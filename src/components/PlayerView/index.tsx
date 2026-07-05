import { useEffect, useRef } from 'react';
import BackIcon from '../../assets/back.icon';
import HighlightCard from '../HighlightCard';
import Button from '../Button';
import type { Highlight } from '../../shared/types/highlight';
import { getCompetitionRail } from '../../shared/utils/competitionRail';
import { getCompetitionDisplayName } from '../../shared/utils/importance';
import { formatRecency } from '../../shared/utils/time';
import { getYouTubeEmbedUrl } from '../../shared/utils/youtube';
import './styles.scss';

type PlayerViewProps = {
    highlight: Highlight;
    playlist: Highlight[];
    onSelectHighlight: (highlight: Highlight, playlist: Highlight[]) => void;
    onBack: () => void;
};

const PlayerView = ({
    highlight,
    playlist,
    onSelectHighlight,
    onBack,
}: PlayerViewProps) => {
    const playerRef = useRef<HTMLElement>(null);
    const embedUrl = getYouTubeEmbedUrl(highlight.url);
    const railHighlights = getCompetitionRail(playlist, highlight);

    useEffect(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [highlight.url]);

    return (
        <section className="player-view" ref={playerRef}>
            <Button text="Back" type="outlined" onClick={onBack} icon={<BackIcon />} />

            {embedUrl ? (
                <div className="iframe-wrapper">
                    <iframe
                        key={embedUrl}
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

            {railHighlights.length > 0 && (
                <div className="player-view__rail">
                    <h2>More {getCompetitionDisplayName(highlight.competitionId)} highlights</h2>
                    <ul>
                        {railHighlights.map((item) => (
                            <li key={item.url}>
                                <HighlightCard
                                    highlight={item}
                                    onSelect={(next) => onSelectHighlight(next, playlist)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export default PlayerView;
