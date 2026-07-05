import type { CompetitionId, RankedCompetitionId } from './importanceMap';

export type PreferredChannel = {
    name: string;
    /** YouTube channel ID (starts with "UC..."). */
    channelId: string;
};

/**
 * Preferred YouTube channels to search WITHIN, per competition (ordered by preference).
 *
 * Why search within channels: the YouTube Data API `search.list` has no notion of an
 * "official highlight". Scoping the search to a trusted channel is how we get reliable,
 * on-topic results instead of filtering the whole of YouTube after the fact.
 *
 * Attribution note: results are attributed to the competition whose channel returned them,
 * so PREFER official, single-competition channels. Multi-competition aggregator channels
 * would mis-attribute results and are out of scope for now.
 *
 * The channel IDs below are PLACEHOLDERS. Replace/verify each one:
 *   - Open the channel on YouTube -> "About"/"Share channel" -> "Copy channel ID",
 *     or read it from the channel URL (youtube.com/channel/UC...).
 */
export const preferredChannels: Record<RankedCompetitionId, PreferredChannel[]> = {
    'world-cup': [
        { name: 'FOX Sports', channelId: 'UCwNqHDsnBCKT-olwJwIFyfg' },
    ],
    'champions-league': [
        { name: 'CBS', channelId: 'UCyGa1YEx9ST66rYrJTGIKOw' },
    ],
    'premier-league': [
        { name: 'Sky Sports Football', channelId: 'UCG5qGWdu8nIRZqJ_GgDwQ-w' },
    ],
    'la-liga': [
        { name: 'LALIGA', channelId: 'UCTv-XvfzLX3i4IGWAm4sbmA' },
    ],
    'serie-a': [
        { name: 'Serie A', channelId: 'UCBJeMCIeLQos7wacox4hmLQ' },
    ],
    'bundesliga': [
        { name: 'Bundesliga', channelId: 'UCcs82Z6xu9Yd80MzdvBYs5g' },
    ],
    'fa-cup': [
        { name: 'Emirates FA Cup', channelId: 'UCz-7VMHhWo6Tzn1igbr211w' },
    ],
    'efl-cup': [
        { name: 'Carabao Cup / EFL', channelId: 'UCJp1XQ0Lq0Wo6xkFg3nb0OQ' },
    ],
};

export function getPreferredChannels(competitionId: CompetitionId): PreferredChannel[] {
    if (competitionId === 'unknown') return [];
    return preferredChannels[competitionId] ?? [];
}

export function getCompetitionForChannel(channelId: string): CompetitionId | null {
    for (const [competitionId, channels] of Object.entries(preferredChannels)) {
        if (channels.some((channel) => channel.channelId === channelId)) {
            return competitionId as CompetitionId;
        }
    }
    return null;
}

export function isPreferredChannel(channelId: string): boolean {
    return getCompetitionForChannel(channelId) !== null;
}
