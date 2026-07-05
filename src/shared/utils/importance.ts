import {
    getCompetitionById,
    getHighlightPrecedenceScore,
    type CompetitionId,
} from '../config/importanceMap';
import type { Highlight } from '../types/highlight';

export function sortHighlightsByImportance(highlights: Highlight[]): Highlight[] {
    return [...highlights].sort(
        (a, b) =>
            getHighlightPrecedenceScore(a.competitionId, a.homeTeam, a.awayTeam) -
            getHighlightPrecedenceScore(b.competitionId, b.homeTeam, b.awayTeam),
    );
}

export function getCompetitionDisplayName(competitionId: CompetitionId): string {
    if (competitionId === 'unknown') return 'Other';
    return getCompetitionById(competitionId)?.name ?? competitionId;
}

export type HomepageSection = {
    competitionId: CompetitionId;
    competitionName: string;
    rank: number;
    highlights: Highlight[];
};
