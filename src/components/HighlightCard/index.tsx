import type { Highlight } from '../../shared/types/highlight';
import { formatRecency } from '../../shared/utils/time';

type HighlightCardProps = {
    highlight: Highlight;
    onSelect: (highlight: Highlight) => void;
};

const HighlightCard = ({ highlight, onSelect }: HighlightCardProps) => {
    return (
        <button type="button" onClick={() => onSelect(highlight)}>
            {highlight.thumbnail && (
                <img src={highlight.thumbnail} alt="" />
            )}
            <p>{highlight.title}</p>
            <p>{highlight.homeTeam} vs {highlight.awayTeam}</p>
            <p>{formatRecency(highlight.publishedAt)}</p>
            <p>{highlight.duration}</p>
        </button>
    );
};

export default HighlightCard;
