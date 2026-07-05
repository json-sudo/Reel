import CompetitionSection, {
    type SelectHighlightHandler,
} from '../../components/CompetitionSection';
import type { FeaturedHomepageResult } from '../../shared/utils/featuredSelection';

type HomePageProps = {
    featured: FeaturedHomepageResult;
    stale?: boolean;
    onSelectHighlight: SelectHighlightHandler;
};

const HomePage = ({ featured, stale = false, onSelectHighlight }: HomePageProps) => {
    const { sections } = featured;

    return (
        <main>
            {stale && (
                <p className="featured-stale-notice">
                    Showing cached highlights — refresh may be delayed.
                </p>
            )}
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
