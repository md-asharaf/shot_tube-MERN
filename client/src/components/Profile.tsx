import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortName } from "@/lib/utils";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/Auth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { FaSignOutAlt } from "react-icons/fa";
import { logoutFromGoogle } from "@/lib/firebase";
import { toast } from "sonner";
import { logout } from "@/store/reducers/auth";
const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.auth.userData);
    const { username, fullname, avatar } = userData;
    const onLogout = async () => {
        try {
            await logoutFromGoogle();
            await authService.logout();
            toast.info("Logged out!!");
            dispatch(logout());
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={userData?.avatar} />
                    <AvatarFallback>
                        {shortName(userData?.fullname)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-2 min-w-[200px]">
                <Link to={`/channel?u=${userData.username}`}>
                    <DropdownMenuItem>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={avatar} />
                                    <AvatarFallback>
                                        {shortName(fullname)}
                                    </AvatarFallback>
                                </Avatar>
                                <div id="right">
                                    <div className="font-semibold">
                                        {fullname}
                                    </div>
                                    <div className="dark:text-gray-300 text-gray-500">
                                        @{username}
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => {
                                    navigate(`/${username}/channel`, {
                                        viewTransition: true,
                                    });
                                }}
                                className="hover:underline"
                            >
                                View your channel
                            </div>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </Link>
                <DropdownMenuItem>
                    <Button
                        className="w-full space-x-2"
                        onClick={onLogout}
                        variant="destructive"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <div>Sign out</div>
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Profile;
