export type ParsedFixture = {
    homeTeam: string;
    awayTeam: string;
};

const EMPTY: ParsedFixture = { homeTeam: '', awayTeam: '' };

const HIGHLIGHT_PREFIX = /^(?:extended\s+)?highlights?\s*[:|]\s*/i;
const TRAILING_NOISE =
    /\s*(?:\|\s*)?(?:\d+\s*[-–]\s*\d+\s*)?(?:\(?\s*\d+\s*[-–]\s*\d+\s*\)?\s*)?(?:official\s+)?(?:match\s+|extended\s+)?highlights?.*$/i;
export const MAX_HIGHLIGHT_TITLE_LENGTH = 75;

export function isLikelyMatchHighlight(title: string): boolean {
    return title.trim().length <= MAX_HIGHLIGHT_TITLE_LENGTH;
}

export function parseFixture(title: string): ParsedFixture {
    if (!title) return EMPTY;

    const pipeSegments = title.split('|').map((segment) => segment.trim()).filter(Boolean);
    const highlightSegments = pipeSegments.filter((segment) => /\bhighlights?\b/i.test(segment));

    const candidates = [
        ...highlightSegments,
        title.trim(),
        ...pipeSegments,
    ];

    const seen = new Set<string>();
    for (const candidate of candidates) {
        if (seen.has(candidate)) continue;
        seen.add(candidate);

        const parsed = parseVsSegment(candidate);
        if (parsed.homeTeam && parsed.awayTeam) {
            return parsed;
        }
    }

    return EMPTY;
}

function parseVsSegment(text: string): ParsedFixture {
    const cleaned = text.replace(HIGHLIGHT_PREFIX, '').trim();
    const split = splitAtLastVs(cleaned);
    if (!split) return EMPTY;

    const homeTeam = stripHomeNoise(split.home);
    const awayTeam = stripAwayNoise(split.away);

    return normalize(homeTeam, awayTeam);
}

function splitAtLastVs(text: string): { home: string; away: string } | null {
    const matches = [...text.matchAll(/\s+vs?\.?\s+/gi)];
    const last = matches.at(-1);
    if (!last || last.index === undefined) return null;

    return {
        home: text.slice(0, last.index),
        away: text.slice(last.index + last[0].length),
    };
}

function stripHomeNoise(home: string): string {
    return home.replace(HIGHLIGHT_PREFIX, '').trim();
}

function stripAwayNoise(away: string): string {
    let cleaned = away.trim();
    cleaned = cleaned.split(/[|\u2013\u2014\-–—]/)[0]?.trim() ?? cleaned;
    cleaned = cleaned.replace(TRAILING_NOISE, '').trim();
    return cleaned;
}

function normalize(home: string, away: string): ParsedFixture {
    const homeTeam = home.trim();
    const awayTeam = away.trim();

    if (!homeTeam || !awayTeam) return EMPTY;

    return { homeTeam, awayTeam };
}
