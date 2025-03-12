import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {authService} from "@/services/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logoutFromGoogle } from "@/lib/firebase";
import { toast } from "sonner";
import { logout } from "@/store/reducers/auth";
import { AvatarImg } from "./avatar-image";
import { ClapperboardIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
export const Profile = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { username, fullname, avatar } = useSelector(
        (state: RootState) => state.auth.userData
    ) || {};
    const navigate = useNavigate();
    const onLogout = async () => {
        try {
            await logoutFromGoogle();
            await authService.logout();
            toast.info("Logged out!!");
            dispatch(logout());
            navigate("/");
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    };
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className="h-10 w-10 focus:outline-none">
                <AvatarImg fullname={fullname} avatar={avatar} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="min-w-[300px] p-0 m-0"
                collisionPadding={20}
                onClick={() => setOpen(false)}
            >
                <DropdownMenuItem className="p-2">
                    <Link to={`/channel/${username}`} className="w-full">
                        <div className="flex space-x-8 items-center">
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
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="m-0 p-0" />
                <DropdownMenuItem className="p-2">
                    <Link to={`/studio/${username}`} className="w-full">
                        <div className="flex space-x-8 p-3 items-center">
                            <ClapperboardIcon />
                            <div>Studio</div>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-2">
                    <Link to={`/account/${username}`} className="w-full">
                        <div className="flex space-x-8 p-3 items-center">
                            <SettingsIcon />
                            <div>Manage your account</div>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-2">
                    <div
                        onClick={onLogout}
                        className="flex space-x-8 p-3 items-center w-full"
                    >
                        <LogOutIcon />
                        <div>Sign out</div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
