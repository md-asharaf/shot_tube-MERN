import { generateColor, shortName } from "@/lib/utils";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";

export default function AvatarImg({ avatar, fullname }) {
    const bgColor = generateColor(fullname);
    return (
        <Avatar className="w-full h-full">
            <AvatarImage src={avatar} />
            <AvatarFallback className={`${bgColor}`}>
                {shortName(fullname)||"null"}
            </AvatarFallback>
        </Avatar>
    );
}
