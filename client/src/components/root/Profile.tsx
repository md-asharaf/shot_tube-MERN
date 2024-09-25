import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUser } from "@/interfaces/index";
import { shortName } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AiTwotoneProfile } from "react-icons/ai";
const Profile: React.FC<IUser> = (user) => {
    const navigate = useNavigate();
    const { username, fullname, avatar } = user;
    return (
        <div className="flex flex-col gap-4 ">
            <div className="flex gap-4">
                <div id="left">
                    <Avatar>
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{shortName(fullname)}</AvatarFallback>
                    </Avatar>
                </div>
                <div id="right">
                    <div className="font-semibold">{fullname}</div>
                    <div className="text-zinc-700">@{username}</div>
                </div>
            </div>
            <div className="space-y-2">
                <div
                    onClick={() => {
                        navigate(`/channel/${username}`);
                    }}
                    className="hover:underline"
                >
                    View your channel
                </div>
                <div className="flex items-center hover:underline">
                    <AiTwotoneProfile /> Profile
                </div>
            </div>
        </div>
    );
};

export default Profile;
