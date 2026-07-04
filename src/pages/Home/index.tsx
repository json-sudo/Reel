import CompetitionSection from '../../components/CompetitionSection';
import { getFeaturedWindowLabel } from '../../shared/constants/featured';
import type { Highlight } from '../../shared/types/highlight';
import type { FeaturedHomepageResult } from '../../shared/utils/featuredSelection';

type HomePageProps = {
    featured: FeaturedHomepageResult;
    onSelectHighlight: (highlight: Highlight) => void;
};

const HomePage = ({ featured, onSelectHighlight }: HomePageProps) => {
    const { sections, fallbackStep } = featured;
    const showWindowLabel =
        fallbackStep.windowHours > 24 || !fallbackStep.rankedTeamsOnly;

    return (
        <main>
            {showWindowLabel && <p>{getFeaturedWindowLabel(fallbackStep)}</p>}
            {sections.map((section) => (
                <CompetitionSection
                    key={section.competitionId}
                    competitionName={section.competitionName}
                    rank={section.rank}
                    highlights={section.highlights}
                    onSelectHighlight={onSelectHighlight}
                />
            ))}
        </main>
    );
};

export default HomePage;
