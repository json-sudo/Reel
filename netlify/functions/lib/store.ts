import { getStore } from '@netlify/blobs';

import type { Highlight } from '../../../src/shared/types/highlight';
import { FEATURED_STORE_KEY, FEATURED_STORE_NAME } from './constants';

export type FeaturedStoreEntry = {
    highlights: Highlight[];
    updatedAt: string;
};

let memoryFallback: FeaturedStoreEntry | null = null;

function isHighlight(value: unknown): value is Highlight {
    if (typeof value !== 'object' || value === null) return false;

    const highlight = value as Record<string, unknown>;

    return (
        typeof highlight.competitionId === 'string' &&
        typeof highlight.homeTeam === 'string' &&
        typeof highlight.awayTeam === 'string' &&
        typeof highlight.url === 'string' &&
        typeof highlight.title === 'string' &&
        typeof highlight.publishedAt === 'string' &&
        (highlight.thumbnail === undefined || typeof highlight.thumbnail === 'string') &&
        (highlight.duration === undefined || typeof highlight.duration === 'string')
    );
}

function isFeaturedStoreEntry(value: unknown): value is FeaturedStoreEntry {
    if (typeof value !== 'object' || value === null) return false;

    const entry = value as FeaturedStoreEntry;
    const updatedAtMs = new Date(entry.updatedAt).getTime();

    return (
        'highlights' in entry &&
        'updatedAt' in entry &&
        Array.isArray(entry.highlights) &&
        entry.highlights.every(isHighlight) &&
        typeof entry.updatedAt === 'string' &&
        !Number.isNaN(updatedAtMs)
    );
}

export function getFeaturedAgeMs(entry: FeaturedStoreEntry): number {
    const updatedAtMs = new Date(entry.updatedAt).getTime();

    if (Number.isNaN(updatedAtMs)) {
        return Number.POSITIVE_INFINITY;
    }

    return Date.now() - updatedAtMs;
}

export async function getFeaturedStore(): Promise<FeaturedStoreEntry | null> {
    try {
        const store = getStore(FEATURED_STORE_NAME);
        const entry = await store.get(FEATURED_STORE_KEY, { type: 'json' });

        if (entry === null) {
            return memoryFallback;
        }

        if (!isFeaturedStoreEntry(entry)) {
            console.warn('store: invalid featured entry in blobs, treating as empty');
            return null;
        }

        memoryFallback = entry;
        return entry;
    } catch (error) {
        console.warn('store: blobs read unavailable, using memory fallback', error);
    }

    return memoryFallback;
}

export async function setFeaturedStore(entry: FeaturedStoreEntry): Promise<void> {
    memoryFallback = entry;

    try {
        const store = getStore(FEATURED_STORE_NAME);
        await store.setJSON(FEATURED_STORE_KEY, entry);
    } catch (error) {
        console.warn('store: blobs write failed, kept in memory only', error);
    }
}
