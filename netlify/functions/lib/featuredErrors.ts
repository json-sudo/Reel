import { isYouTubeApiError } from './youtube';

export type FeaturedErrorCode = 'config' | 'quota' | 'upstream';

export function toFeaturedErrorCode(error: unknown): FeaturedErrorCode {
    if (isYouTubeApiError(error)) {
        if (error.reason === 'quotaExceeded') return 'quota';
        if (error.reason === 'keyInvalid') return 'config';
    }
    return 'upstream';
}

export function isQuotaOrConfigError(error: unknown): boolean {
    if (!isYouTubeApiError(error)) return false;
    return error.reason === 'quotaExceeded' || error.reason === 'keyInvalid';
}
