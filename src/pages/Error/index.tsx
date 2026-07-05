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
        <main>
            <p>{MESSAGES[reason]}</p>
            <button type="button" onClick={onRetry}>
                Try again
            </button>
        </main>
    );
};

export default ErrorScreen;
