import { getCompetitionsByImportance, resolveTeamInCompetition } from '../../../src/shared/config/importanceMap';
import { getPreferredChannels } from '../../../src/shared/config/preferredChannels';
import type { Highlight } from '../../../src/shared/types/highlight';
import { isLikelyMatchHighlight, parseFixture } from '../../../src/shared/utils/parseFixture';
import { isYouTubeApiError, searchChannelRecent } from './youtube';

const FEATURED_COMPETITION_LIMIT = 4;
const WINDOW_DAYS = 7;
const SEARCH_MAX_RESULTS = 10;

function windowStartISO(): string {
    return new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export async function computeFeatured(apiKey: string): Promise<Highlight[]> {
    const competitions = getCompetitionsByImportance().slice(0, FEATURED_COMPETITION_LIMIT);
    const publishedAfter = windowStartISO();
    const highlights: Highlight[] = [];
    const seenVideoIds = new Set<string>();
    let channelsQueried = 0;
    let channelsFailed = 0;
    let fatalError: unknown = null;

    for (const competition of competitions) {
        const channel = getPreferredChannels(competition.id)[0];
        if (!channel) continue;

        channelsQueried += 1;

        try {
            const items = await searchChannelRecent(
                channel.channelId,
                publishedAfter,
                apiKey,
                SEARCH_MAX_RESULTS,
            );

            for (const item of items) {
                if (seenVideoIds.has(item.videoId)) continue;
                if (!isLikelyMatchHighlight(item.title)) continue;

                const parsed = parseFixture(item.title);
                if (!parsed.homeTeam || !parsed.awayTeam) continue;

                const homeResolved = resolveTeamInCompetition(competition.id, parsed.homeTeam);
                const awayResolved = resolveTeamInCompetition(competition.id, parsed.awayTeam);
                if (!homeResolved && !awayResolved) continue;

                seenVideoIds.add(item.videoId);

                highlights.push({
                    competitionId: competition.id,
                    homeTeam: homeResolved?.name ?? parsed.homeTeam,
                    awayTeam: awayResolved?.name ?? parsed.awayTeam,
                    url: `https://www.youtube.com/watch?v=${item.videoId}`,
                    title: item.title,
                    publishedAt: item.publishedAt,
                    thumbnail:
                        item.thumbnailUrl ??
                        `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                });
            }
        } catch (error) {
            channelsFailed += 1;
            console.error(`computeFeatured: channel ${channel.channelId} failed`, error);

            if (isYouTubeApiError(error) && error.isFatal) {
                fatalError = error;
                break;
            }
        }
    }

    if (highlights.length === 0 && fatalError) {
        throw fatalError;
    }

    if (highlights.length === 0 && channelsQueried > 0 && channelsFailed === channelsQueried) {
        throw new Error('computeFeatured: all channel queries failed');
    }

    return highlights;
}
