export function getYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    return match?.[1] ?? null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
