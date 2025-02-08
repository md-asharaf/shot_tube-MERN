import { onTimestampClick } from "./utils";

export const processText = (comment: string, playerRef: any) => {
    const timestampRegex = /\b(\d{1,2}:\d{2})\b/g;
    const parts = comment.split(timestampRegex);
    return parts.map((part, index) => {
        if (timestampRegex.test(part)) {
            const [minutes, seconds] = part.split(":").map(Number);
            const timeInSeconds = minutes * 60 + seconds;
            return (
                <a
                    key={index}
                    href="#"
                    className="text-blue-500"
                    onClick={(e) => {
                        e.preventDefault();
                        onTimestampClick(timeInSeconds, playerRef);
                    }}
                >
                    {part}
                </a>
            );
        }

        return <span key={index}>{part}</span>;
    });
};
