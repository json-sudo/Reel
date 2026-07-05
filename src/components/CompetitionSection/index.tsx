import HighlightCard from '../HighlightCard';
import type { Highlight } from '../../shared/types/highlight';
import './styles.scss';

export type SelectHighlightHandler = (
    highlight: Highlight,
    playlist: Highlight[],
) => void;

type CompetitionSectionProps = {
    competitionName: string;
    rank: number;
    highlights: Highlight[];
    onSelectHighlight: SelectHighlightHandler;
};

const CompetitionSection = ({
    competitionName,
    rank,
    highlights,
    onSelectHighlight,
}: CompetitionSectionProps) => {
    if (highlights.length === 0) return null;

    return (
        <section className="competition-section" data-competition-rank={rank}>
            <h2>{competitionName}</h2>
            <ul>
                {highlights.map((highlight) => (
                    <li key={highlight.url}>
                        <HighlightCard
                            highlight={highlight}
                            onSelect={(item) => onSelectHighlight(item, highlights)}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default CompetitionSection;
