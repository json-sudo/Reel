export function formatRecency(publishedAt: string, now: Date = new Date()): string {
    const publishedMs = new Date(publishedAt).getTime();
    const diffMs = now.getTime() - publishedMs;

    if (Number.isNaN(publishedMs) || diffMs < 0) return 'just now';

    const minutes = Math.floor(diffMs / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
}
