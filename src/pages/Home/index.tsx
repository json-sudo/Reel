import CompetitionSection, {
    type SelectHighlightHandler,
} from '../../components/CompetitionSection';
import type { FeaturedHomepageResult } from '../../shared/utils/featuredSelection';

type HomePageProps = {
    featured: FeaturedHomepageResult;
    onSelectHighlight: SelectHighlightHandler;
};

const HomePage = ({ featured, onSelectHighlight }: HomePageProps) => {
    const { sections } = featured;

    return (
        <main>
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
