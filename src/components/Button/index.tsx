import type { ReactNode } from 'react';
import './styles.scss';

type ButtonProps = {
    text: string;
    type?: 'header' | 'clearSearch' | 'outlined';
    icon?: ReactNode;
    onClick?: () => void;
}

const Button = ({text, type, icon, onClick}: ButtonProps) => {
    const headerBtn = type === 'header';
    const clearSearchBtn = type === 'clearSearch';
    const outlinedBtn = type === 'outlined'
    const classesString = `${headerBtn ? ' header-btn' : ''}${clearSearchBtn ? ' clear-btn' : ''}${outlinedBtn ? ' outlined-btn' : ''}${icon ? ' has-icon' : ''}`;

    return (
        <button className={`button${classesString}`} onClick={onClick}>
            {icon ? icon : ''}
            {text}
        </button>
    )
};

export default Button;
