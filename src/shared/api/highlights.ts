import type { Highlight } from '../types/highlight';

export type FeaturedErrorReason = 'config' | 'quota' | 'upstream' | 'network';

export type FeaturedResult =
    | { ok: true; highlights: Highlight[] }
    | { ok: false; reason: FeaturedErrorReason };

type FeaturedSuccessResponse = {
    highlights: Highlight[];
};

type FeaturedErrorResponse = {
    error: 'config' | 'quota' | 'upstream';
};

function mapHttpError(data: FeaturedErrorResponse): FeaturedErrorReason {
    return data.error ?? 'upstream';
}

/** Fetches raw featured highlight candidates from the serverless function. */
export async function fetchFeaturedHighlights(): Promise<FeaturedResult> {
    try {
        const response = await fetch('/highlights/featured');

        const data = (await response.json()) as
            | FeaturedSuccessResponse
            | FeaturedErrorResponse;

        if (!response.ok) {
            return {
                ok: false,
                reason: 'error' in data ? mapHttpError(data) : 'upstream',
            };
        }

        if ('error' in data) {
            return { ok: false, reason: mapHttpError(data) };
        }

        return { ok: true, highlights: data.highlights ?? [] };
    } catch {
        return { ok: false, reason: 'network' };
    }
}
