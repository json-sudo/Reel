import { useState } from 'react';

import Header from './components/Header';
import PlayerView from './components/PlayerView';
import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import { mockHighlights } from './shared/data/mockHighlights';
import type { Highlight } from './shared/types/highlight';
import { getFeaturedHomepage } from './shared/utils/featuredSelection';

import './App.scss';

function App() {
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
    const featured = getFeaturedHomepage(mockHighlights);

    return (
        <>
            <Header />
            {selectedHighlight ? (
                <PlayerView
                    highlight={selectedHighlight}
                    onBack={() => setSelectedHighlight(null)}
                />
            ) : featured ? (
                <HomePage
                    featured={featured}
                    onSelectHighlight={setSelectedHighlight}
                />
            ) : (
                <SearchPage />
            )}
        </>
    );
}

export default App;
