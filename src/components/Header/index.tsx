import { useEffect, useRef, useState } from 'react';

import Button from '../Button';

import {
    applyThemeFromStorage,
    getResolvedTheme,
    setUserTheme,
    subscribeToSystemTheme,
    type Theme,
} from '../../utils/theme'

import DarkThemeIcon from '../../assets/dark-theme.icon';
import LightThemeIcon from '../../assets/light-theme.icon';

import './styles.scss'

const Header = () => {
    const headerRef = useRef<HTMLElement>(null);
    const [resolvedTheme, setResolvedTheme] = useState<Theme>(getResolvedTheme);
    const [isScrolled, setIsScrolled] = useState(false);
    const isDarkTheme = resolvedTheme === 'dark';

    useEffect(() => {
        applyThemeFromStorage();
        return subscribeToSystemTheme(setResolvedTheme);
    }, []);

    const changeTheme = () => {
        const nextTheme: Theme = isDarkTheme ? 'light' : 'dark';

        setUserTheme(nextTheme);
        setResolvedTheme(nextTheme);
    }

    useEffect(() => {
        const headerEl = headerRef.current;
        if (!headerEl) return;

        const threshold = headerEl.offsetHeight * 1.08;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > threshold);
        }

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            ref={headerRef}
            className={`header${isScrolled ? ' header--scrolled' : ''}`}
        >
            <a href='/'>Reel</a>

            <div className='header-controls'>
                <Button text='Search a fixture' type='header' />
                <button onClick={changeTheme}>
                    {
                        isDarkTheme ? <LightThemeIcon /> : <DarkThemeIcon />
                    }
                </button>
            </div>
        </header>
    )
}

export default Header;