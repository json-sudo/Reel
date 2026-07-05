import Button from '../../components/Button';

type NoHighlightsScreenProps = {
    onSearch?: () => void;
};

const NoHighlightsScreen = ({ onSearch }: NoHighlightsScreenProps) => {
    return (
        <main>
            <p>No highlights to show right now.</p>
            <p>Nothing matched the featured window — try searching for a specific fixture.</p>
            {onSearch && (
                <Button text="Search a fixture" onClick={onSearch} />
            )}
        </main>
    );
};

export default NoHighlightsScreen;
