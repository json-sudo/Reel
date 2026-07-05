import type { Highlight } from '../types/highlight';

export type FeaturedErrorReason = 'config' | 'quota' | 'upstream' | 'network';

export type SearchErrorReason = FeaturedErrorReason | 'invalid';

export type FeaturedResult =
    | { ok: true; highlights: Highlight[]; cached?: boolean; stale?: boolean }
    | { ok: false; reason: FeaturedErrorReason };

export type SearchResult =
    | { ok: true; highlights: Highlight[]; cached?: boolean; stale?: boolean }
    | { ok: false; reason: SearchErrorReason };

export type SearchParams = {
    home: string;
    away: string;
    /** YYYY-MM-DD, or omit for last 24 hours. */
    date?: string | undefined;
};

type FeaturedSuccessResponse = {
    highlights: Highlight[];
    cached?: boolean;
    stale?: boolean;
};

type ApiErrorResponse = {
    error: 'config' | 'quota' | 'upstream' | 'invalid';
};

function mapFeaturedHttpError(data: ApiErrorResponse): FeaturedErrorReason {
    if (data.error === 'invalid') return 'upstream';
    return data.error ?? 'upstream';
}

function mapSearchHttpError(data: ApiErrorResponse): SearchErrorReason {
    return data.error ?? 'upstream';
}

/** Fetches raw featured highlight candidates from the serverless function. */
export async function fetchFeaturedHighlights(): Promise<FeaturedResult> {
    try {
        const response = await fetch('/highlights/featured');

        const data = (await response.json()) as FeaturedSuccessResponse | ApiErrorResponse;

        if (!response.ok) {
            return {
                ok: false,
                reason: 'error' in data ? mapFeaturedHttpError(data) : 'upstream',
            };
        }

        if ('error' in data) {
            return { ok: false, reason: mapFeaturedHttpError(data) };
        }

        return {
            ok: true,
            highlights: data.highlights ?? [],
            cached: data.cached,
            stale: data.stale,
        };
    } catch {
        return { ok: false, reason: 'network' };
    }
}

export async function fetchSearchHighlights(params: SearchParams): Promise<SearchResult> {
    const query = new URLSearchParams({
        home: params.home.trim(),
        away: params.away.trim(),
    });

    if (params.date?.trim()) {
        query.set('date', params.date.trim());
    }

    try {
        const response = await fetch(`/highlights/search?${query.toString()}`);

        const data = (await response.json()) as FeaturedSuccessResponse | ApiErrorResponse;

        if (!response.ok) {
            const reason = 'error' in data ? mapSearchHttpError(data) : 'upstream';
            return { ok: false, reason };
        }

        if ('error' in data) {
            return { ok: false, reason: mapSearchHttpError(data) };
        }

        return {
            ok: true,
            highlights: data.highlights ?? [],
            cached: data.cached,
            stale: data.stale,
        };
    } catch {
        return { ok: false, reason: 'network' };
    }
}
