import { FEATURED_FALLBACK_STEPS, type FeaturedFallbackStep } from '../constants/featured';
import {
    getCompetitionsByImportance,
    hasRankedTeamInFixture,
    type CompetitionId,
} from '../config/importanceMap';
import type { Highlight } from '../types/highlight';
import { sortHighlightsByImportance, type HomepageSection } from './importance';

export type FeaturedHomepageResult = {
    sections: HomepageSection[];
    fallbackStep: FeaturedFallbackStep;
};

function isWithinWindow(publishedAt: string, windowHours: number, now: Date): boolean {
    const published = new Date(publishedAt).getTime();
    const cutoff = now.getTime() - windowHours * 60 * 60 * 1000;
    return published >= cutoff;
}

function isEligibleForFallbackStep(
    highlight: Highlight,
    fallbackStep: FeaturedFallbackStep,
    now: Date,
): boolean {
    if (!isWithinWindow(highlight.publishedAt, fallbackStep.windowHours, now)) {
        return false;
    }

    const hasRankedTeam = hasRankedTeamInFixture(
        highlight.competitionId,
        highlight.homeTeam,
        highlight.awayTeam,
    );

    if (fallbackStep.rankedTeamsOnly && !hasRankedTeam) {
        return false;
    }

    return true;
}

function buildSectionsFromHighlights(eligible: Highlight[]): HomepageSection[] {
    const sorted = sortHighlightsByImportance(eligible);
    const byCompetition = new Map<CompetitionId, Highlight[]>();

    for (const highlight of sorted) {
        const existing = byCompetition.get(highlight.competitionId) ?? [];
        byCompetition.set(highlight.competitionId, [...existing, highlight]);
    }

    return getCompetitionsByImportance()
        .filter((competition) => byCompetition.has(competition.id))
        .map((competition) => ({
            competitionId: competition.id,
            competitionName: competition.name,
            rank: competition.rank,
            highlights: byCompetition.get(competition.id)!,
        }));
}

/**
 * Walks the fallback ladder step by step. Returns all non-empty competition sections
 * from the first step that finds eligible highlights, or null if every step is empty.
 */
export function getFeaturedHomepage(
    highlights: Highlight[],
    now: Date = new Date(),
): FeaturedHomepageResult | null {
    for (const fallbackStep of FEATURED_FALLBACK_STEPS) {
        const eligible = highlights.filter((h) =>
            isEligibleForFallbackStep(h, fallbackStep, now),
        );
        const sections = buildSectionsFromHighlights(eligible);

        if (sections.length > 0) {
            return { sections, fallbackStep };
        }
    }

    return null;
}
