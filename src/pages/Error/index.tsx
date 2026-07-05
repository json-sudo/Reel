import Button from "../../components/Button";
import ErrorIcon from "../../assets/error.icon";
import './style.scss'

type ErrorScreenProps = {
    reason: 'config' | 'quota' | 'upstream' | 'network';
    onRetry: () => void;
};

const MESSAGES: Record<ErrorScreenProps['reason'], string> = {
    config: 'Highlights are unavailable right now. Server is misconfigured.',
    quota: 'Highlights are temporarily unavailable. Please try again later.',
    upstream: 'Something went wrong fetching highlights. Please try again.',
    network: 'Could not reach the server. Check your connection and try again.',
};

const ErrorScreen = ({ reason, onRetry }: ErrorScreenProps) => {
    return (
        <main className="error-page">
            <ErrorIcon />
            <p>{MESSAGES[reason]}</p>
            <Button text="Try again" onClick={onRetry} />
        </main>
    );
};

export default ErrorScreen;
