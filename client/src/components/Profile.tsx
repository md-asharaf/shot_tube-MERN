import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortName } from "@/lib/utils";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/Auth";
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
import AvatarImg from "./AvatarImg";
const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { username, fullname, avatar } = useSelector((state: RootState) => state.auth.userData);
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
            <DropdownMenuTrigger className="h-10 w-10">
                <AvatarImg fullname={fullname} avatar={avatar} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-2 min-w-[200px]">
                <Link to={`/channel?u=${username}`}>
                    <DropdownMenuItem>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10"><AvatarImg
                                    fullname={fullname}
                                    avatar={avatar}
                                /></div>
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
