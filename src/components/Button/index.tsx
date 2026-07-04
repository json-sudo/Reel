import type { ReactNode } from 'react';
import './styles.scss';

type ButtonProps = {
    text: string;
    type?: 'header' | 'clearSearch' | 'outlined';
    icon?: ReactNode;
}

const Button = ({text, type}: ButtonProps) => {
    const headerBtn = type === 'header';
    const clearSearchBtn = type === 'clearSearch';
    const outlinedBtn = type === 'outlined'
    const classesString = `${headerBtn ? ' header-btn' : ''}${clearSearchBtn ? ' clear-btn' : ''}${outlinedBtn ? ' outlined-btn' : ''}`;

    return (
        <button className={`button${classesString}`}>{text}</button>
    )
};

export default Button;
