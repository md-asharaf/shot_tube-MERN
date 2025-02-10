import { generateColor, shortName } from "@/lib/utils";
import { AvatarFallback, AvatarImage, Avatar } from "./ui/avatar";

export default function AvatarImg({ avatar, fullname,className="",onClick=()=>{}}) {
    const bgColor = generateColor(fullname);
    return (
        <Avatar className={`${className}`} onClick={onClick}>
            <AvatarImage src={avatar} />
            <AvatarFallback className={`${bgColor}`}>
                {shortName(fullname)||"null"}
            </AvatarFallback>
        </Avatar>
    );
}
