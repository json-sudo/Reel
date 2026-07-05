import type { Highlight } from '../types/highlight';

export function getCompetitionRail(
    playlist: Highlight[],
    current: Highlight,
): Highlight[] {
    return playlist.filter((highlight) => highlight.url !== current.url);
}
