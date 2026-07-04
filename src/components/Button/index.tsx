import type { ReactNode } from 'react';
import './styles.scss';

type ButtonProps = {
    text: string;
    type?: 'header' | 'clearSearch' | 'outlined';
    icon?: ReactNode;
}

const Button = ({text, type, icon}: ButtonProps) => {
    const headerBtn = type === 'header';
    const clearSearchBtn = type === 'clearSearch';
    const outlinedBtn = type === 'outlined'
    const classesString = `${headerBtn ? ' header-btn' : ''}${clearSearchBtn ? ' clear-btn' : ''}${outlinedBtn ? ' outlined-btn' : ''}${icon ? ' has-icon' : ''}`;

    return (
        <button className={`button${classesString}`}>
            {icon ? icon : ''}
            {text}
        </button>
    )
};

export default Button;
