import { computeFeatured } from './computeFeatured';
import { type FeaturedStoreEntry, setFeaturedStore } from './store';

export async function refreshFeaturedStore(apiKey: string): Promise<FeaturedStoreEntry> {
    const highlights = await computeFeatured(apiKey);

    if (highlights.length === 0) {
        throw new Error('refreshFeaturedStore: no highlights found');
    }

    const entry: FeaturedStoreEntry = {
        highlights,
        updatedAt: new Date().toISOString(),
    };

    await setFeaturedStore(entry);
    return entry;
}
