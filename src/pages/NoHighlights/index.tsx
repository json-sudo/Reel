import Button from '../../components/Button';
import ForwardIcon from '../../assets/forward.icon';

type NoHighlightsScreenProps = {
    onSearch?: () => void;
};

const NoHighlightsScreen = ({ onSearch }: NoHighlightsScreenProps) => {
    return (
        <main className="error-page no-highlights">
            <h1>No highlights to show right now.</h1>
            <p>Try searching for a specific fixture.</p>
            {onSearch && (
                <Button text="Search a fixture" icon={<ForwardIcon />} onClick={onSearch} />
            )}
        </main>
    );
};

export default NoHighlightsScreen;
