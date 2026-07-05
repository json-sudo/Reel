export type ParsedFixture = {
    homeTeam: string;
    awayTeam: string;
};

const EMPTY: ParsedFixture = { homeTeam: '', awayTeam: '' };

export function parseFixture(title: string): ParsedFixture {
    if (!title) return EMPTY;

    // Drop anything after a separator that typically precedes descriptors.
    const primary = title.split(/[|\u2013\u2014\-–—:]/)[0]?.trim() ?? title.trim();

    // "Team A vs/v Team B"
    const vsMatch = primary.match(/^(.+?)\s+(?:vs?\.?)\s+(.+?)$/i);
    if (vsMatch) {
        return normalize(vsMatch[1], vsMatch[2]);
    }

    return EMPTY;
}

function normalize(home: string, away: string): ParsedFixture {
    const homeTeam = home.trim();
    const awayTeam = away.trim();

    if (!homeTeam || !awayTeam) return EMPTY;

    return { homeTeam, awayTeam };
}
