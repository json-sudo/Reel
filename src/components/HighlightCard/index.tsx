import type { Highlight } from '../../shared/types/highlight';
import { formatRecency } from '../../shared/utils/time';
import './style.scss';

type HighlightCardProps = {
    highlight: Highlight;
    onSelect: (highlight: Highlight) => void;
};

const HighlightCard = ({ highlight, onSelect }: HighlightCardProps) => {
    return (
        <button className="highlight-card" type="button" onClick={() => onSelect(highlight)}>
            {highlight.thumbnail && (
                <img src={highlight.thumbnail} alt={`${highlight.title}`} />
            )}
            <div className="details">
                <h3>{highlight.title}</h3>
                <p>{formatRecency(highlight.publishedAt)}</p>
            </div>
            {highlight.duration && <p className="duration">{highlight.duration}</p>}
        </button>
    );
};

export default HighlightCard;
