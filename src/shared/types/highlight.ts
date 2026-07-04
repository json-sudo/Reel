import type { CompetitionId } from '../config/importanceMap';

export type Highlight = {
    competitionId: CompetitionId;
    homeTeam: string;
    awayTeam: string;
    url: string;
    title: string;
    publishedAt: string;
    thumbnail?: string;
    duration: string;
};
