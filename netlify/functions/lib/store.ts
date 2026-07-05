import { getStore } from '@netlify/blobs';

import type { Highlight } from '../../../src/shared/types/highlight';
import {
    FEATURED_STORE_KEY,
    FEATURED_STORE_NAME,
    SEARCH_DEFAULT_TTL_MS,
    SEARCH_KEY_PREFIX,
    SEARCH_OFFICIAL_TTL_MS,
} from './constants';

export type FeaturedStoreEntry = {
    highlights: Highlight[];
    updatedAt: string;
};

export type SearchStoreEntry = {
    highlights: Highlight[];
    updatedAt: string;
    fromOfficialChannel: boolean;
};

let memoryFeaturedFallback: FeaturedStoreEntry | null = null;
const memorySearchFallback = new Map<string, SearchStoreEntry>();

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

function isSearchStoreEntry(value: unknown): value is SearchStoreEntry {
    if (typeof value !== 'object' || value === null) return false;

    const entry = value as SearchStoreEntry;
    const updatedAtMs = new Date(entry.updatedAt).getTime();

    return (
        'highlights' in entry &&
        'updatedAt' in entry &&
        'fromOfficialChannel' in entry &&
        Array.isArray(entry.highlights) &&
        entry.highlights.every(isHighlight) &&
        typeof entry.updatedAt === 'string' &&
        typeof entry.fromOfficialChannel === 'boolean' &&
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

export function getSearchAgeMs(entry: SearchStoreEntry): number {
    const updatedAtMs = new Date(entry.updatedAt).getTime();

    if (Number.isNaN(updatedAtMs)) {
        return Number.POSITIVE_INFINITY;
    }

    return Date.now() - updatedAtMs;
}

export function getSearchTtlMs(entry: SearchStoreEntry): number {
    return entry.fromOfficialChannel ? SEARCH_OFFICIAL_TTL_MS : SEARCH_DEFAULT_TTL_MS;
}

export function isSearchCacheFresh(entry: SearchStoreEntry): boolean {
    return getSearchAgeMs(entry) < getSearchTtlMs(entry);
}

function toSearchBlobKey(cacheKey: string): string {
    return `${SEARCH_KEY_PREFIX}${cacheKey}`;
}

export async function getFeaturedStore(): Promise<FeaturedStoreEntry | null> {
    try {
        const store = getStore(FEATURED_STORE_NAME);
        const entry = await store.get(FEATURED_STORE_KEY, { type: 'json' });

        if (entry === null) {
            return memoryFeaturedFallback;
        }

        if (!isFeaturedStoreEntry(entry)) {
            console.warn('store: invalid featured entry in blobs, treating as empty');
            return null;
        }

        memoryFeaturedFallback = entry;
        return entry;
    } catch (error) {
        console.warn('store: blobs read unavailable, using memory fallback', error);
    }

    return memoryFeaturedFallback;
}

export async function setFeaturedStore(entry: FeaturedStoreEntry): Promise<void> {
    memoryFeaturedFallback = entry;

    try {
        const store = getStore(FEATURED_STORE_NAME);
        await store.setJSON(FEATURED_STORE_KEY, entry);
    } catch (error) {
        console.warn('store: blobs write failed, kept in memory only', error);
    }
}

export async function getSearchStore(cacheKey: string): Promise<SearchStoreEntry | null> {
    const blobKey = toSearchBlobKey(cacheKey);

    try {
        const store = getStore(FEATURED_STORE_NAME);
        const entry = await store.get(blobKey, { type: 'json' });

        if (entry === null) {
            return memorySearchFallback.get(cacheKey) ?? null;
        }

        if (!isSearchStoreEntry(entry)) {
            console.warn(`store: invalid search entry for ${cacheKey}, treating as empty`);
            return null;
        }

        memorySearchFallback.set(cacheKey, entry);
        return entry;
    } catch (error) {
        console.warn('store: blobs search read unavailable, using memory fallback', error);
    }

    return memorySearchFallback.get(cacheKey) ?? null;
}

export async function setSearchStore(
    cacheKey: string,
    entry: SearchStoreEntry,
): Promise<void> {
    memorySearchFallback.set(cacheKey, entry);

    try {
        const store = getStore(FEATURED_STORE_NAME);
        await store.setJSON(toSearchBlobKey(cacheKey), entry);
    } catch (error) {
        console.warn('store: blobs search write failed, kept in memory only', error);
    }
}
