import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import { CiMenuBurger } from "react-icons/ci";
import { TbVideoPlus } from "react-icons/tb";
import { IoNotificationsOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { ImYoutube } from "react-icons/im";
import { Button } from "@/components/ui/button";
import ProfileImage from "@/assets/images/profile.png";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Profile from "./Profile";
import { logout, RootState, toggleMenu } from "@/provider";
import { Link, useNavigate } from "react-router-dom";
import { shortName, useSuccess } from "@/lib/utils";
import VideoUpload from "./VideoUpload";
import { toggleVideoModal } from "@/provider/ui.slice";
import authService from "@/services/auth.services";

const NavBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const videoModal = useSelector(
        (state: RootState) => state.ui.isVideoModalOpen
    );
    const isSuccess = useSuccess(navigate);
    const onLogout = async () => {
        const res = await authService.logout();
        if (isSuccess(res)) {
            dispatch(logout());
            navigate("/");
        }
    };
    return (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-between p-6 h-16 gap-2 w-full shadow-lg bg-white">
            <div className="flex items-center gap-x-2 md:gap-x-4">
                <CiMenuBurger
                    className="text-4xl dark:text-white hover:bg-zinc-400 p-2 rounded-lg"
                    onClick={() => {
                        dispatch(toggleMenu());
                    }}
                />
                <button className="flex items-center">
                    <ImYoutube className="text-3xl w-10" />
                    <h1 className="font-extrabold text-red-500">ShOtTube</h1>
                </button>
            </div>
            <div className="items-center gap-x-2 flex">
                <div className="hidden md:flex gap-x-2">
                    <SearchBar />
                </div>
                <div className="p-1 rounded-full hover:bg-zinc-500">
                    <CiSearch className="md:hidden block text-3xl font-extralight" />
                </div>
            </div>
            {videoModal && <VideoUpload />}
            {authStatus ? (
                <div className="flex gap-1 sm:gap-4 lg:gap-8 items-center">
                    <div className="p-1.5 rounded-full hover:bg-zinc-500">
                        <TbVideoPlus
                            className="text-3xl dark:text-white"
                            onClick={() => dispatch(toggleVideoModal())}
                        />
                    </div>
                    <div className="p-2 rounded-full hover:bg-zinc-500">
                        <IoNotificationsOutline className="text-2xl dark:text-white" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarImage src={userData?.avatar?.url} />
                                <AvatarFallback>
                                    {shortName(userData?.fullname)}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-2">
                            {userData && (
                                <Link to={`/channel/${userData?.username}`}>
                                    <DropdownMenuItem>
                                        <Profile {...userData} />
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </Link>
                            )}
                            <DropdownMenuItem>
                                <Button
                                    className="w-full"
                                    onClick={onLogout}
                                    variant="destructive"
                                >
                                    Log out
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <Link to={"/login"}>
                    <Button
                        className="rounded-2xl text-blue-500 gap-1"
                        variant={"outline"}
                    >
                        <span>Log in</span>
                        <img src={ProfileImage} height={30} width={30} />
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default NavBar;
