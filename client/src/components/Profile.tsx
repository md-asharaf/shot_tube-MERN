import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUser } from "@/interfaces/index";
import { shortName } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
const Profile: React.FC<IUser> = (user) => {
    const navigate = useNavigate();
    const { username, fullname, avatar } = user;
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{shortName(fullname)}</AvatarFallback>
                </Avatar>
                <div id="right">
                    <div className="font-semibold">{fullname}</div>
                    <div className="dark:text-gray-300 text-gray-500">
                        @{username}
                    </div>
                </div>
            </div>
            <div
                onClick={() => {
                    navigate(`/${username}/channel`,{viewTransition:true});
                }}
                className="hover:underline"
            >
                View your channel
            </div>
        </div>
    );
};

export default Profile;
