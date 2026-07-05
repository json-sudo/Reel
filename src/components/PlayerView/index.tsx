import BackIcon from '../../assets/back.icon';
import type { Highlight } from '../../shared/types/highlight';
import { getCompetitionDisplayName } from '../../shared/utils/importance';
import { formatRecency } from '../../shared/utils/time';
import { getYouTubeEmbedUrl } from '../../shared/utils/youtube';
import Button from '../Button';
import './styles.scss';

type PlayerViewProps = {
    highlight: Highlight;
    onBack: () => void;
};

const PlayerView = ({ highlight, onBack }: PlayerViewProps) => {
    const embedUrl = getYouTubeEmbedUrl(highlight.url);

    return (
        <section className="player-view">
            <Button text="Back" type="outlined" onClick={onBack} icon={<BackIcon />} />

            {embedUrl ? (
                <div className="iframe-wrapper">
                    <iframe
                        src={embedUrl}
                        title={highlight.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <p>Could not load video.</p>
            )}
            <h1>{highlight.title}</h1>
            <div className="player-view__details">
                <p className="player-view__competition">{getCompetitionDisplayName(highlight.competitionId)}</p>
                <p className="player-view__recency">{formatRecency(highlight.publishedAt)}</p>
            </div>
        </section>
    );
};

export default PlayerView;
