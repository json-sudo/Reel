export type YouTubeSearchItem = {
    videoId: string;
    title: string;
    publishedAt: string;
    channelId?: string;
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
    readonly context?: string;

    constructor(
        message: string,
        status: number,
        reason: YouTubeErrorReason,
        context?: string,
    ) {
        super(message);
        this.name = 'YouTubeApiError';
        this.status = status;
        this.reason = reason;
        this.context = context;
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
            channelId?: string;
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
    context: string,
): never {
    const rawReason = data.error?.errors?.[0]?.reason;
    const reason = mapApiReason(rawReason);
    const message =
        data.error?.message ?? `YouTube search.list failed (${httpStatus}) for ${context}`;

    throw new YouTubeApiError(message, httpStatus, reason, context);
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

            if (snippet.channelId) {
                entry.channelId = snippet.channelId;
            }

            const thumbnailUrl = pickThumbnail(snippet.thumbnails);
            if (thumbnailUrl !== undefined) {
                entry.thumbnailUrl = thumbnailUrl;
            }

            return entry;
        })
        .filter((item): item is YouTubeSearchItem => item !== null);
}

export type SearchVideosOptions = {
    apiKey: string;
    q: string;
    channelId?: string | undefined;
    publishedAfter?: string | undefined;
    publishedBefore?: string | undefined;
    maxResults?: number | undefined;
    order?: 'date' | 'relevance' | undefined;
};

export async function searchVideos(options: SearchVideosOptions): Promise<YouTubeSearchItem[]> {
    const {
        apiKey,
        q,
        channelId,
        publishedAfter,
        publishedBefore,
        maxResults = 5,
        order = 'relevance',
    } = options;

    const params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        type: 'video',
        order,
        q,
        maxResults: String(maxResults),
    });

    if (channelId) {
        params.set('channelId', channelId);
    }

    if (publishedAfter) {
        params.set('publishedAfter', publishedAfter);
    }

    if (publishedBefore) {
        params.set('publishedBefore', publishedBefore);
    }

    const context = channelId ? `channel ${channelId}` : `query "${q}"`;

    const response = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const data = (await response.json()) as RawSearchResponse;

    if (!response.ok || data.error) {
        throwYouTubeApiError(data, response.status, context);
    }

    return mapItems(data);
}

export async function searchChannelRecent(
    channelId: string,
    publishedAfterISO: string,
    apiKey: string,
    maxResults = 5,
): Promise<YouTubeSearchItem[]> {
    return searchVideos({
        apiKey,
        channelId,
        q: 'highlights vs',
        publishedAfter: publishedAfterISO,
        maxResults,
        order: 'date',
    });
}
