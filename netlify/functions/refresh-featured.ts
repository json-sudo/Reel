import { toFeaturedErrorCode } from './lib/featuredErrors';
import { refreshFeaturedStore } from './lib/refreshFeaturedStore';

export default async (): Promise<Response> => {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.error('refresh-featured: YOUTUBE_API_KEY is not set');
        return Response.json({ ok: false, error: 'config' }, { status: 500 });
    }

    try {
        const entry = await refreshFeaturedStore(apiKey);
        console.info(`refresh-featured: stored ${entry.highlights.length} highlights`);
        return Response.json({ ok: true, count: entry.highlights.length });
    } catch (error) {
        console.error('refresh-featured: failed', error);
        const code = toFeaturedErrorCode(error);
        return Response.json({ ok: false, error: code }, { status: 502 });
    }
};
