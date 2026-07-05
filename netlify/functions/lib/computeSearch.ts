import type { CompetitionId } from '../../../src/shared/config/importanceMap';
import {
    getCompetitionsByImportance,
    getHighlightPrecedenceScore,
    hasRankedTeamInFixture,
    resolveTeamInCompetition,
} from '../../../src/shared/config/importanceMap';
import {
    getCompetitionForChannel,
    getPreferredChannels,
    isPreferredChannel,
} from '../../../src/shared/config/preferredChannels';
import type { Highlight } from '../../../src/shared/types/highlight';
import { isLikelyMatchHighlight, parseFixture } from '../../../src/shared/utils/parseFixture';
import { isYouTubeApiError, searchVideos, type YouTubeSearchItem } from './youtube';

const SEARCH_MAX_RESULTS = 5;
const MAX_COMPETITION_CHANNEL_SEARCHES = 3;

export type SearchQuery = {
    home: string;
    away: string;
    date?: string | undefined;
};

export type SearchComputeResult = {
    highlights: Highlight[];
    fromOfficialChannel: boolean;
};

function normalizeTeam(value: string): string {
    return value.trim().toLowerCase();
}

export function buildSearchCacheKey(home: string, away: string, date?: string): string {
    const homeKey = normalizeTeam(home).replace(/\s+/g, '-');
    const awayKey = normalizeTeam(away).replace(/\s+/g, '-');
    const dateKey = date?.trim() || 'recent';
    return `${homeKey}:${awayKey}:${dateKey}`;
}

function buildSearchQuery(home: string, away: string): string {
    return `${home.trim()} vs ${away.trim()} highlights`;
}

function getPublishedWindow(date?: string): { publishedAfter: string; publishedBefore?: string } {
    if (!date) {
        return {
            publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        };
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
        throw new Error('computeSearch: invalid date');
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 2);
    end.setUTCHours(23, 59, 59, 999);

    return {
        publishedAfter: start.toISOString(),
        publishedBefore: end.toISOString(),
    };
}

function inferCompetitionId(
    home: string,
    away: string,
    channelId?: string,
): CompetitionId {
    if (channelId) {
        const fromChannel = getCompetitionForChannel(channelId);
        if (fromChannel) return fromChannel;
    }

    let best: CompetitionId | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const competition of getCompetitionsByImportance()) {
        if (!hasRankedTeamInFixture(competition.id, home, away)) continue;

        const score = getHighlightPrecedenceScore(competition.id, home, away);
        if (score < bestScore) {
            bestScore = score;
            best = competition.id;
        }
    }

    return best ?? 'unknown';
}

function teamsMatchFixture(
    expectedHome: string,
    expectedAway: string,
    title: string,
): boolean {
    const parsed = parseFixture(title);
    if (!parsed.homeTeam || !parsed.awayTeam) return false;

    const expectedHomeNorm = normalizeTeam(expectedHome);
    const expectedAwayNorm = normalizeTeam(expectedAway);
    const parsedHomeNorm = normalizeTeam(parsed.homeTeam);
    const parsedAwayNorm = normalizeTeam(parsed.awayTeam);

    const direct =
        parsedHomeNorm.includes(expectedHomeNorm) || expectedHomeNorm.includes(parsedHomeNorm);
    const directAway =
        parsedAwayNorm.includes(expectedAwayNorm) || expectedAwayNorm.includes(parsedAwayNorm);

    if (direct && directAway) return true;

    const swapped =
        (parsedHomeNorm.includes(expectedAwayNorm) || expectedAwayNorm.includes(parsedHomeNorm)) &&
        (parsedAwayNorm.includes(expectedHomeNorm) || expectedHomeNorm.includes(parsedAwayNorm));

    return swapped;
}

function toHighlight(
    item: YouTubeSearchItem,
    query: SearchQuery,
): Highlight | null {
    if (!isLikelyMatchHighlight(item.title)) return null;
    if (!teamsMatchFixture(query.home, query.away, item.title)) return null;

    const competitionId = inferCompetitionId(query.home, query.away, item.channelId);
    const parsed = parseFixture(item.title);

    const homeResolved = resolveTeamInCompetition(competitionId, parsed.homeTeam || query.home);
    const awayResolved = resolveTeamInCompetition(competitionId, parsed.awayTeam || query.away);

    return {
        competitionId,
        homeTeam: homeResolved?.name ?? parsed.homeTeam ?? query.home,
        awayTeam: awayResolved?.name ?? parsed.awayTeam ?? query.away,
        url: `https://www.youtube.com/watch?v=${item.videoId}`,
        title: item.title,
        publishedAt: item.publishedAt,
        thumbnail:
            item.thumbnailUrl ?? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
    };
}

function rankItems(items: YouTubeSearchItem[]): YouTubeSearchItem[] {
    return [...items].sort((a, b) => {
        const aOfficial = a.channelId && isPreferredChannel(a.channelId) ? 0 : 1;
        const bOfficial = b.channelId && isPreferredChannel(b.channelId) ? 0 : 1;
        if (aOfficial !== bOfficial) return aOfficial - bOfficial;

        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

function getCandidateCompetitions(home: string, away: string): CompetitionId[] {
    return getCompetitionsByImportance()
        .filter((competition) => hasRankedTeamInFixture(competition.id, home, away))
        .map((competition) => competition.id)
        .slice(0, MAX_COMPETITION_CHANNEL_SEARCHES);
}

function collectHighlights(
    items: YouTubeSearchItem[],
    query: SearchQuery,
    seenVideoIds: Set<string>,
    highlights: Highlight[],
): boolean {
    let foundOfficial = false;

    for (const item of rankItems(items)) {
        if (seenVideoIds.has(item.videoId)) continue;

        const highlight = toHighlight(item, query);
        if (!highlight) continue;

        seenVideoIds.add(item.videoId);
        highlights.push(highlight);

        if (item.channelId && isPreferredChannel(item.channelId)) {
            foundOfficial = true;
        }
    }

    return foundOfficial;
}

export async function computeSearch(
    apiKey: string,
    query: SearchQuery,
): Promise<SearchComputeResult> {
    const { publishedAfter, publishedBefore } = getPublishedWindow(query.date);
    const searchQuery = buildSearchQuery(query.home, query.away);
    const highlights: Highlight[] = [];
    const seenVideoIds = new Set<string>();
    let fromOfficialChannel = false;

    const candidateCompetitions = getCandidateCompetitions(query.home, query.away);

    for (const competitionId of candidateCompetitions) {
        const channel = getPreferredChannels(competitionId)[0];
        if (!channel) continue;

        try {
            const items = await searchVideos({
                apiKey,
                q: searchQuery,
                channelId: channel.channelId,
                publishedAfter,
                publishedBefore,
                maxResults: SEARCH_MAX_RESULTS,
                order: 'date',
            });

            const official = collectHighlights(items, query, seenVideoIds, highlights);
            fromOfficialChannel = fromOfficialChannel || official;
            if (fromOfficialChannel) break;
        } catch (error) {
            console.error(`computeSearch: channel ${channel.channelId} failed`, error);
            if (isYouTubeApiError(error) && error.isFatal) throw error;
        }
    }

    if (highlights.length === 0) {
        const items = await searchVideos({
            apiKey,
            q: searchQuery,
            publishedAfter,
            publishedBefore,
            maxResults: SEARCH_MAX_RESULTS,
            order: 'relevance',
        });

        const official = collectHighlights(items, query, seenVideoIds, highlights);
        fromOfficialChannel = fromOfficialChannel || official;
    }

    return { highlights, fromOfficialChannel };
}
