import type { Highlight } from '../../shared/types/highlight';
import { getCompetitionDisplayName } from '../../shared/utils/importance';
import { formatRecency } from '../../shared/utils/time';
import { getYouTubeEmbedUrl } from '../../shared/utils/youtube';

type PlayerViewProps = {
    highlight: Highlight;
    onBack: () => void;
};

const PlayerView = ({ highlight, onBack }: PlayerViewProps) => {
    const embedUrl = getYouTubeEmbedUrl(highlight.url);

    return (
        <section>
            <button type="button" onClick={onBack}>
                Back
            </button>
            <h1>{highlight.title}</h1>
            <p>{getCompetitionDisplayName(highlight.competitionId)}</p>
            <p>{formatRecency(highlight.publishedAt)}</p>
            {embedUrl ? (
                <iframe
                    src={embedUrl}
                    title={highlight.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <p>Could not load video.</p>
            )}
        </section>
    );
};

export default PlayerView;
