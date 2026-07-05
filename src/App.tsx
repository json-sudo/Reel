import { useCallback, useEffect, useState } from 'react';

import Header from './components/Header';
import PlayerView from './components/PlayerView';
import ErrorScreen from './pages/Error';
import HomePage from './pages/Home';
import NoHighlightsScreen from './pages/NoHighlights';
import SearchPage from './pages/Search';
import {
    fetchFeaturedHighlights,
    type FeaturedErrorReason,
} from './shared/api/highlights';
import { mockHighlights } from './shared/data/mockHighlights';
import type { Highlight } from './shared/types/highlight';
import { getFeaturedHomepage } from './shared/utils/featuredSelection';

import './App.scss';

const OFFLINE_FALLBACK = false;

type LoadStatus = 'loading' | 'ready' | 'error';

function App() {
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Highlight[] | null>(null);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [errorReason, setErrorReason] = useState<FeaturedErrorReason>('upstream');
    const [showSearch, setShowSearch] = useState(false);
    const [fetchAttempt, setFetchAttempt] = useState(0);

    const loadFeatured = useCallback(() => {
        setStatus('loading');
        setErrorReason('upstream');

        fetchFeaturedHighlights()
            .then((result) => {
                if (!result.ok) {
                    if (OFFLINE_FALLBACK) {
                        setHighlights(mockHighlights);
                        setStatus('ready');
                        return;
                    }
                    setErrorReason(result.reason);
                    setStatus('error');
                    return;
                }

                setHighlights(result.highlights);
                setStatus('ready');
            });
    }, []);

    useEffect(() => {
        loadFeatured();
    }, [loadFeatured, fetchAttempt]);

    const featured = status === 'ready' ? getFeaturedHomepage(highlights) : null;

    const handleSelectHighlight = (highlight: Highlight, playlist: Highlight[]) => {
        setSelectedHighlight(highlight);
        setSelectedPlaylist(playlist);
    };

    const handleBackFromPlayer = () => {
        setSelectedHighlight(null);
        setSelectedPlaylist(null);
    };

    return (
        <>
            <Header />
            {selectedHighlight && selectedPlaylist ? (
                <PlayerView
                    highlight={selectedHighlight}
                    playlist={selectedPlaylist}
                    onSelectHighlight={handleSelectHighlight}
                    onBack={handleBackFromPlayer}
                />
            ) : status === 'loading' ? (
                <main>
                    <p>Loading highlights…</p>
                </main>
            ) : status === 'error' ? (
                <ErrorScreen
                    reason={errorReason}
                    onRetry={() => setFetchAttempt((n) => n + 1)}
                />
            ) : showSearch ? (
                <SearchPage />
            ) : featured ? (
                <HomePage featured={featured} onSelectHighlight={handleSelectHighlight} />
            ) : (
                <NoHighlightsScreen onSearch={() => setShowSearch(true)} />
            )}
        </>
    );
}

export default App;
