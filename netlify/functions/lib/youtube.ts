export type YouTubeSearchItem = {
    videoId: string;
    title: string;
    publishedAt: string;
    thumbnailUrl?: string | undefined;
};

export type YouTubeErrorReason =
    | 'quotaExceeded'
    | 'keyInvalid'
    | 'forbidden'
    | 'notFound'
    | 'unknown';

export class YouTubeApiError extends Error {
    readonly status: number;
    readonly reason: YouTubeErrorReason;
    readonly channelId?: string;

    constructor(
        message: string,
        status: number,
        reason: YouTubeErrorReason,
        channelId?: string,
    ) {
        super(message);
        this.name = 'YouTubeApiError';
        this.status = status;
        this.reason = reason;
        this.channelId = channelId;
    }

    get isFatal(): boolean {
        return this.reason === 'quotaExceeded' || this.reason === 'keyInvalid';
    }
}

export function isYouTubeApiError(error: unknown): error is YouTubeApiError {
    return error instanceof YouTubeApiError;
}

type RawSearchResponse = {
    items?: Array<{
        id?: { videoId?: string };
        snippet?: {
            title?: string;
            publishedAt?: string;
            thumbnails?: Record<string, { url?: string } | undefined>;
        };
    }>;
    error?: {
        code?: number;
        message?: string;
        errors?: Array<{ reason?: string; message?: string }>;
    };
};

const SEARCH_ENDPOINT = 'https://www.googleapis.com/youtube/v3/search';
const FETCH_TIMEOUT_MS = 10_000;

function pickThumbnail(
    thumbnails: Record<string, { url?: string } | undefined> | undefined,
): string | undefined {
    if (!thumbnails) return undefined;
    return (
        thumbnails.high?.url ??
        thumbnails.medium?.url ??
        thumbnails.default?.url ??
        undefined
    );
}

function mapApiReason(rawReason: string | undefined): YouTubeErrorReason {
    switch (rawReason) {
        case 'quotaExceeded':
        case 'dailyLimitExceeded':
        case 'userRateLimitExceeded':
            return 'quotaExceeded';
        case 'keyInvalid':
        case 'keyExpired':
            return 'keyInvalid';
        case 'forbidden':
            return 'forbidden';
        case 'notFound':
        case 'channelNotFound':
            return 'notFound';
        default:
            return 'unknown';
    }
}

function throwYouTubeApiError(
    data: RawSearchResponse,
    httpStatus: number,
    channelId: string,
): never {
    const rawReason = data.error?.errors?.[0]?.reason;
    const reason = mapApiReason(rawReason);
    const message =
        data.error?.message ??
        `YouTube search.list failed (${httpStatus}) for channel ${channelId}`;

    throw new YouTubeApiError(message, httpStatus, reason, channelId);
}

function mapItems(data: RawSearchResponse): YouTubeSearchItem[] {
    return (data.items ?? [])
        .map((item) => {
            const videoId = item.id?.videoId;
            const snippet = item.snippet;
            if (!videoId || !snippet?.title || !snippet.publishedAt) return null;

            const entry: YouTubeSearchItem = {
                videoId,
                title: snippet.title,
                publishedAt: snippet.publishedAt,
            };
            const thumbnailUrl = pickThumbnail(snippet.thumbnails);
            if (thumbnailUrl !== undefined) {
                entry.thumbnailUrl = thumbnailUrl;
            }
            return entry;
        })
        .filter((item): item is YouTubeSearchItem => item !== null);
}

export async function searchChannelRecent(
    channelId: string,
    publishedAfterISO: string,
    apiKey: string,
    maxResults = 5,
): Promise<YouTubeSearchItem[]> {
    const params = new URLSearchParams({
        key: apiKey,
        channelId,
        part: 'snippet',
        type: 'video',
        order: 'date',
        q: 'highlights vs',
        publishedAfter: publishedAfterISO,
        maxResults: String(maxResults),
    });

    const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const data = (await response.json()) as RawSearchResponse;

    if (!response.ok || data.error) {
        throwYouTubeApiError(data, response.status, channelId);
    }

    return mapItems(data);
}
