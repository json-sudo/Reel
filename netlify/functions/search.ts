import { buildSearchCacheKey, computeSearch } from './lib/computeSearch';
import { type FeaturedErrorCode, isQuotaOrConfigError, toFeaturedErrorCode } from './lib/featuredErrors';
import { getSearchStore, isSearchCacheFresh, setSearchStore } from './lib/store';

import type { Highlight } from '../../src/shared/types/highlight';

type SearchSuccessBody = {
    highlights: Highlight[];
    cached?: boolean;
    stale?: boolean;
};

type SearchErrorCode = FeaturedErrorCode | 'invalid';

function successResponse(body: SearchSuccessBody): Response {
    return Response.json(body);
}

function errorResponse(code: SearchErrorCode, status: number): Response {
    return Response.json({ error: code }, { status });
}

function parseDateParam(value: string | null): string | undefined {
    if (!value?.trim()) return undefined;

    const trimmed = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return undefined;
    }

    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return trimmed;
}

export default async (request: Request): Promise<Response> => {
    const { searchParams } = new URL(request.url);
    const home = searchParams.get('home')?.trim() ?? '';
    const away = searchParams.get('away')?.trim() ?? '';
    const dateParam = searchParams.get('date');
    const date = parseDateParam(dateParam);

    if (!home || !away) {
        return errorResponse('invalid', 400);
    }

    if (dateParam?.trim() && !date) {
        return errorResponse('invalid', 400);
    }

    const cacheKey = buildSearchCacheKey(home, away, date);
    const cached = await getSearchStore(cacheKey);

    if (cached && isSearchCacheFresh(cached)) {
        return successResponse({
            highlights: cached.highlights,
            cached: true,
        });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.error('search: YOUTUBE_API_KEY is not set');

        if (cached) {
            return successResponse({
                highlights: cached.highlights,
                cached: true,
                stale: true,
            });
        }

        return errorResponse('config', 500);
    }

    try {
        const result = await computeSearch(apiKey, { home, away, date });

        const entry = {
            highlights: result.highlights,
            updatedAt: new Date().toISOString(),
            fromOfficialChannel: result.fromOfficialChannel,
        };

        if (result.highlights.length > 0) {
            await setSearchStore(cacheKey, entry);
        }

        return successResponse({
            highlights: result.highlights,
            cached: false,
        });
    } catch (error) {
        console.error('search: compute failed', error);

        if (cached && isQuotaOrConfigError(error)) {
            return successResponse({
                highlights: cached.highlights,
                cached: true,
                stale: true,
            });
        }

        return errorResponse(toFeaturedErrorCode(error), 502);
    }
};
