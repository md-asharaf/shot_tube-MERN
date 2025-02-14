import { generateColor, shortName } from "@/lib/utils";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
interface AvatarImgProps {
    avatar: string;
    fullname: string;
    className?: string;
    onClick?: () => void;
}
export const AvatarImg = ({
    avatar,
    fullname,
    className = "",
    onClick = () => {},
}: AvatarImgProps) => {
    const bgColor = generateColor(fullname);
    return (
        <Avatar className={`${className}`} onClick={onClick}>
            <AvatarImage src={avatar} />
            <AvatarFallback className={`${bgColor}`}>
                {shortName(fullname) || "User"}
            </AvatarFallback>
        </Avatar>
    );
};
