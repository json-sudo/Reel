/**
 * One step in the featured homepage fallback ladder.
 * Each step defines how far back to look and whether only ranked-team fixtures qualify.
 */
export type FeaturedFallbackStep = {
    rankedTeamsOnly: boolean;
    windowHours: number;
};

export const FEATURED_FALLBACK_STEPS: FeaturedFallbackStep[] = [
    { rankedTeamsOnly: true, windowHours: 24 },
    { rankedTeamsOnly: true, windowHours: 48 },
    { rankedTeamsOnly: true, windowHours: 168 },
    { rankedTeamsOnly: false, windowHours: 24 },
    { rankedTeamsOnly: false, windowHours: 48 },
    { rankedTeamsOnly: false, windowHours: 168 },
];

export function getFeaturedWindowLabel(fallbackStep: FeaturedFallbackStep): string {
    if (fallbackStep.rankedTeamsOnly && fallbackStep.windowHours <= 24) return 'Last 24 hours';
    if (fallbackStep.rankedTeamsOnly && fallbackStep.windowHours <= 48) return 'Last 48 hours';
    if (fallbackStep.rankedTeamsOnly) return 'This week';
    if (fallbackStep.windowHours <= 24) return 'Latest available';
    if (fallbackStep.windowHours <= 48) return 'Latest available — last 48 hours';
    return 'Latest available — this week';
}
