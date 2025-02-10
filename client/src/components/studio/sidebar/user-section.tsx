import { useSelector } from "react-redux";
import AvatarImg from "../../AvatarImg";
import { RootState } from "@/store/store";
import {
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "../../ui/sidebar";
import { Link } from "react-router-dom";
export const UserSection = () => {
    const { avatar, fullname, username } = useSelector(
        (state: RootState) => state.auth.userData
    );
    const { state } = useSidebar();
    if (state == "collapsed") {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="flex justify-center items-center mx-auto"
                >
                    <Link
                        to={`/users/${username}`}
                    >
                        <AvatarImg
                            fullname={fullname}
                            avatar={avatar || "User"}
                            className="w-8 h-8 hover:opacity-80 transition-opacity"
                        />
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }
    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link to={`/users/${username}`}>
                <AvatarImg
                    fullname={fullname}
                    avatar={avatar || "User"}
                    className="w-32 h-32 hover:opacity-80 transition-opacity"
                />
            </Link>
            <div className="flex flex-col items-center mt-2">
                <p className="font-bold">Your channel</p>
                <p className="text-sm text-muted-foreground">{fullname}</p>
            </div>
        </SidebarHeader>
    );
};
