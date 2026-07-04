export const UNRANKED_TEAM_RANK = 999;

type RankedTeamInput = {
    name: string;
    rank: number;
    aliases?: readonly string[];
};

type RankedCompetitionInput = {
    id: string;
    name: string;
    rank: number;
    teams: readonly RankedTeamInput[];
};

export const importanceMap = [
    {
        id: 'world-cup',
        name: 'World Cup',
        rank: 1,
        teams: [
            { name: 'Brazil', rank: 1 },
            { name: 'Argentina', rank: 2 },
            { name: 'France', rank: 3 },
            { name: 'England', rank: 4 },
            { name: 'Germany', rank: 5 },
            { name: 'Spain', rank: 6 },
            { name: 'Italy', rank: 7 },
            { name: 'Portugal', rank: 8 },
        ],
    },
    {
        id: 'champions-league',
        name: 'Champions League',
        rank: 2,
        teams: [
            { name: 'Real Madrid', rank: 1, aliases: ['Madrid'] },
            { name: 'Manchester City', rank: 2, aliases: ['Man City'] },
            { name: 'FC Barcelona', rank: 3, aliases: ['Barcelona', 'Barca', 'Barça'] },
            { name: 'Bayern Munich', rank: 4, aliases: ['Bayern'] },
            { name: 'Liverpool', rank: 5 },
            { name: 'Arsenal', rank: 6 },
            { name: 'Paris Saint-Germain', rank: 7, aliases: ['PSG'] },
            { name: 'Inter Milan', rank: 8, aliases: ['Inter'] },
            { name: 'Chelsea', rank: 9 }
        ],
    },
    {
        id: 'premier-league',
        name: 'Premier League',
        rank: 3,
        teams: [
            { name: 'Arsenal', rank: 1 },
            { name: 'Liverpool', rank: 2 },
            { name: 'Manchester City', rank: 3, aliases: ['Man City'] },
            { name: 'Manchester United', rank: 4, aliases: ['Man United', 'Man Utd'] },
            { name: 'Chelsea', rank: 5 },
            { name: 'Tottenham Hotspur', rank: 6, aliases: ['Tottenham', 'Spurs'] },
            { name: 'Newcastle United', rank: 7, aliases: ['Newcastle'] },
            { name: 'Aston Villa', rank: 8 },
        ],
    },
    {
        id: 'la-liga',
        name: 'La Liga',
        rank: 4,
        teams: [
            { name: 'Real Madrid', rank: 1 },
            { name: 'Barcelona', rank: 2 },
            { name: 'Atletico Madrid', rank: 3, aliases: ['Atlético Madrid'] },
            { name: 'Sevilla', rank: 4 },
            { name: 'Real Sociedad', rank: 5 },
            { name: 'Villarreal', rank: 6 },
            { name: 'Athletic Club', rank: 7, aliases: ['Athletic Bilbao'] },
            { name: 'Real Betis', rank: 8 },
        ],
    },
    {
        id: 'serie-a',
        name: 'Serie A',
        rank: 5,
        teams: [
            { name: 'Inter Milan', rank: 1, aliases: ['Inter'] },
            { name: 'AC Milan', rank: 2, aliases: ['Milan'] },
            { name: 'Juventus', rank: 3 },
            { name: 'Napoli', rank: 4 },
            { name: 'AS Roma', rank: 5, aliases: ['Roma'] },
            { name: 'Lazio', rank: 6 },
            { name: 'Atalanta', rank: 7 },
            { name: 'Fiorentina', rank: 8 },
        ],
    },
    {
        id: 'bundesliga',
        name: 'Bundesliga',
        rank: 6,
        teams: [
            { name: 'Bayern Munich', rank: 1, aliases: ['Bayern'] },
            { name: 'Borussia Dortmund', rank: 2, aliases: ['Dortmund'] },
            { name: 'Bayer Leverkusen', rank: 3, aliases: ['Leverkusen'] },
            { name: 'RB Leipzig', rank: 4, aliases: ['Leipzig'] },
            { name: 'VfB Stuttgart', rank: 5, aliases: ['Stuttgart'] },
            { name: 'Eintracht Frankfurt', rank: 6, aliases: ['Frankfurt'] },
            { name: 'Borussia Mönchengladbach', rank: 7, aliases: ['Gladbach'] },
            { name: 'Wolfsburg', rank: 8 },
        ],
    },
    {
        id: 'fa-cup',
        name: 'FA Cup',
        rank: 7,
        teams: [
            { name: 'Manchester City', rank: 1, aliases: ['Man City'] },
            { name: 'Arsenal', rank: 2 },
            { name: 'Liverpool', rank: 3 },
            { name: 'Manchester United', rank: 4, aliases: ['Man United', 'Man Utd'] },
            { name: 'Chelsea', rank: 5 },
            { name: 'Tottenham Hotspur', rank: 6, aliases: ['Tottenham', 'Spurs'] },
            { name: 'Newcastle United', rank: 7, aliases: ['Newcastle'] },
            { name: 'Aston Villa', rank: 8 },
        ],
    },
    {
        id: 'efl-cup',
        name: 'EFL Cup',
        rank: 8,
        teams: [
            { name: 'Manchester City', rank: 1, aliases: ['Man City'] },
            { name: 'Liverpool', rank: 2 },
            { name: 'Arsenal', rank: 3 },
            { name: 'Manchester United', rank: 4, aliases: ['Man United', 'Man Utd'] },
            { name: 'Chelsea', rank: 5 },
            { name: 'Tottenham Hotspur', rank: 6, aliases: ['Tottenham', 'Spurs'] },
            { name: 'Newcastle United', rank: 7, aliases: ['Newcastle'] },
            { name: 'Aston Villa', rank: 8 },
        ],
    },
] as const satisfies readonly RankedCompetitionInput[];

export type RankedCompetition = (typeof importanceMap)[number];
export type RankedTeam = RankedCompetition['teams'][number];
export type CompetitionId = RankedCompetition['id'];

const competitionById = new Map(
    importanceMap.map((competition) => [competition.id, competition] as const),
);

export function getCompetitionById(id: CompetitionId): RankedCompetition | undefined {
    return competitionById.get(id);
}

export function getCompetitionRank(id: CompetitionId): number {
    return competitionById.get(id)?.rank ?? Number.MAX_SAFE_INTEGER;
}

export function getTeamRank(competitionId: CompetitionId, teamName: string): number | null {
    const competition = competitionById.get(competitionId);
    if (!competition) return null;

    const normalized = teamName.trim().toLowerCase();

    for (const team of competition.teams) {
        const aliases = 'aliases' in team ? team.aliases : [];
        const names = [team.name, ...aliases];
        if (names.some((name) => name.toLowerCase() === normalized)) {
            return team.rank;
        }
    }

    return null;
}

export function hasRankedTeamInFixture(
    competitionId: CompetitionId,
    homeTeam: string,
    awayTeam: string,
): boolean {
    return (
        getTeamRank(competitionId, homeTeam) !== null ||
        getTeamRank(competitionId, awayTeam) !== null
    );
}

export function getHighlightPrecedenceScore(
    competitionId: CompetitionId,
    homeTeam: string,
    awayTeam: string,
): number {
    const competitionRank = getCompetitionRank(competitionId);
    const homeRank = getTeamRank(competitionId, homeTeam);
    const awayRank = getTeamRank(competitionId, awayTeam);

    const bestTeamRank = Math.min(
        homeRank ?? UNRANKED_TEAM_RANK,
        awayRank ?? UNRANKED_TEAM_RANK,
    );

    return competitionRank * 1000 + bestTeamRank;
}

export function getCompetitionsByImportance(): RankedCompetition[] {
    return [...importanceMap].sort((a, b) => a.rank - b.rank);
}
