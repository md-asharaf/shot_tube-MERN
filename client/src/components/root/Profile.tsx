import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUser } from "@/interfaces/index";
import { shortName } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
const Profile: React.FC<IUser> = (user) => {
    const navigate = useNavigate();
    const { username, fullname, avatar } = user;
    return (
        <div className="flex gap-4">
            <div id="left">
                <Avatar>
                    <AvatarImage src={avatar?.url} />
                    <AvatarFallback>{shortName(fullname)}</AvatarFallback>
                </Avatar>
            </div>
            <div id="right">
                <div className="font-semibold">{fullname}</div>
                <div className="text-zinc-700">@{username}</div>
                <div
                    onClick={() => {
                        navigate(`/channel/${username}`);
                    }}
                    className="hover:underline"
                >
                    view your channel
                </div>
            </div>
        </div>
    );
};

export default Profile;
