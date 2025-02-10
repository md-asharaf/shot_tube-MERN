import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import authService from "@/services/Auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { logoutFromGoogle } from "@/lib/firebase";
import { toast } from "sonner";
import { logout } from "@/store/reducers/auth";
import AvatarImg from "./AvatarImg";
import { ClapperboardIcon, LogOutIcon, SettingsIcon } from "lucide-react";
const Profile = () => {
    const dispatch = useDispatch();
    const { username, fullname, avatar } = useSelector(
        (state: RootState) => state.auth.userData
    );
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
            <DropdownMenuContent
                className="min-w-[300px] p-0 m-0"
                collisionPadding={20}
            >
                <Link to={`/users/${username}`}>
                    <DropdownMenuItem>
                        <div className="flex space-x-8 p-2 items-center">
                            <AvatarImg
                                className="h-10 w-10"
                                fullname={fullname}
                                avatar={avatar}
                            />
                            <div>
                                <div className="font-semibold">{fullname}</div>
                                <div className="text-muted-foreground hover:underline">
                                    @{username}
                                </div>
                            </div>
                        </div>
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="m-0 p-0" />
                <Link to={`/studio/${username}`}>
                    <DropdownMenuItem>
                        <div className="flex space-x-8 p-3 items-center">
                            <ClapperboardIcon />
                            <div>Studio</div>
                        </div>
                    </DropdownMenuItem>
                </Link>
                <Link to={`/account/${username}`}>
                    <DropdownMenuItem>
                        <div className="flex space-x-8 p-3 items-center">
                            <SettingsIcon />
                            <div>Manage your account</div>
                        </div>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                    <div
                        onClick={onLogout}
                        className="flex space-x-8 p-3 items-center"
                    >
                        <LogOutIcon />
                        <div>Sign out</div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Profile;
