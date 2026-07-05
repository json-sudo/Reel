import { STALE_FALLBACK_MS } from './lib/constants';
import { type FeaturedErrorCode } from './lib/featuredErrors';
import { getFeaturedAgeMs, getFeaturedStore } from './lib/store';

import type { Highlight } from '../../src/shared/types/highlight';

type FeaturedSuccessBody = {
    highlights: Highlight[];
    cached: true;
    stale?: boolean;
};

function successResponse(body: FeaturedSuccessBody): Response {
    return Response.json(body);
}

function errorResponse(code: FeaturedErrorCode): Response {
    const status = code === 'config' ? 500 : 502;
    return Response.json({ error: code }, { status });
}

export default async (): Promise<Response> => {
    const stored = await getFeaturedStore();

    if (!stored) {
        console.error('featured: no cached highlights available');
        return errorResponse('upstream');
    }

    const stale = getFeaturedAgeMs(stored) >= STALE_FALLBACK_MS;

    return successResponse({
        highlights: stored.highlights,
        cached: true,
        ...(stale ? { stale: true } : {}),
    });
};
