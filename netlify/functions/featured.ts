import { getCompetitionsByImportance } from '../../src/shared/config/importanceMap';
import { getPreferredChannels } from '../../src/shared/config/preferredChannels';
import type { Highlight } from '../../src/shared/types/highlight';
import { parseFixture } from '../../src/shared/utils/parseFixture';
import { isYouTubeApiError, searchChannelRecent } from './lib/youtube';

const FEATURED_COMPETITION_LIMIT = 4;
const WINDOW_DAYS = 7;
const MEMO_TTL_MS = 30 * 60 * 1000;

type FeaturedErrorCode = 'config' | 'quota' | 'upstream';

let memo: { at: number; highlights: Highlight[] } | null = null;

function windowStartISO(): string {
    return new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

function toFeaturedErrorCode(error: unknown): FeaturedErrorCode {
    if (isYouTubeApiError(error)) {
        if (error.reason === 'quotaExceeded') return 'quota';
        if (error.reason === 'keyInvalid') return 'config';
    }
    return 'upstream';
}

async function computeFeatured(apiKey: string): Promise<Highlight[]> {
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
            const items = await searchChannelRecent(channel.channelId, publishedAfter, apiKey);

            for (const item of items) {
                if (seenVideoIds.has(item.videoId)) continue;
                seenVideoIds.add(item.videoId);

                const { homeTeam, awayTeam } = parseFixture(item.title);

                highlights.push({
                    competitionId: competition.id,
                    homeTeam,
                    awayTeam,
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
            console.error(`featured: channel ${channel.channelId} failed`, error);

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
        throw new Error('featured: all channel queries failed');
    }

    return highlights;
}

export default async (): Promise<Response> => {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.error('featured: YOUTUBE_API_KEY is not set');
        return Response.json({ error: 'config' satisfies FeaturedErrorCode }, { status: 500 });
    }

    if (memo && Date.now() - memo.at < MEMO_TTL_MS) {
        return Response.json({ highlights: memo.highlights });
    }

    try {
        const highlights = await computeFeatured(apiKey);
        memo = { at: Date.now(), highlights };
        return Response.json({ highlights });
    } catch (error) {
        console.error('featured: unexpected error', error);
        const code = toFeaturedErrorCode(error);
        const status = code === 'config' ? 500 : 502;
        return Response.json({ error: code }, { status });
    }
};
