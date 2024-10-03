import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import { CiMenuBurger } from "react-icons/ci";
import { TbVideoPlus } from "react-icons/tb";
import { IoNotificationsOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { ImYoutube } from "react-icons/im";
import { Button } from "@/components/ui/button";
import NoUser from "@/assets/images/user.png";
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
import { shortName } from "@/lib/utils";
import VideoUpload from "./VideoUpload";
import { toggleVideoModal } from "@/provider/ui.slice";
import authServices from "@/services/auth.services";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { toggleTheme } from "@/provider/theme.slice";
import { FaSignOutAlt } from "react-icons/fa";

const NavBar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useSelector((state: RootState) => state.theme.mode);
    const userData = useSelector((state: RootState) => state.auth.userData);
    const videoModal = useSelector(
        (state: RootState) => state.ui.isVideoModalOpen
    );

    const onLogout = async () => {
        const res = await authServices.logout();
        dispatch(logout());
        navigate("/");
    };
    return (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-between p-6 h-16 gap-2 w-full dark:text-white">
            <div className="flex items-center gap-x-2 md:gap-x-4">
                <CiMenuBurger
                    className="text-4xl dark:text-white hover:bg-zinc-400 dark:hover:bg-zinc-700 p-2 rounded-lg hidden sm:block"
                    onClick={() => {
                        dispatch(toggleMenu());
                    }}
                />
                <button
                    className="flex items-center"
                    onClick={() => window.location.reload()}
                >
                    <ImYoutube className="text-3xl w-10" />
                    <h1 className="font-extrabold text-red-500">ShotTube</h1>
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

            <div className="flex gap-1 sm:gap-4 lg:gap-8 items-center">
                <div>
                    <DarkModeSwitch
                        checked={theme === "dark"}
                        onChange={() => dispatch(toggleTheme())}
                    />
                </div>
                {userData ? (
                    <>
                        <div className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800">
                            <TbVideoPlus
                                className="text-3xl"
                                onClick={() => dispatch(toggleVideoModal())}
                            />
                        </div>
                        <div className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800">
                            <IoNotificationsOutline className="text-2xl" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar>
                                    <AvatarImage src={userData?.avatar} />
                                    <AvatarFallback>
                                        {shortName(userData?.fullname)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mr-2">
                                {userData && (
                                    <Link to={`/${userData?.username}/channel`}>
                                        <DropdownMenuItem>
                                            <Profile {...userData} />
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </Link>
                                )}
                                <DropdownMenuItem>
                                    <Button
                                        className="w-full space-x-2"
                                        onClick={onLogout}
                                        variant="destructive"
                                    >
                                        <FaSignOutAlt className="text-xl"/>
                                        <div>Sign out</div>
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Link to={"/login"}>
                        <Button
                            className="rounded-2xl text-blue-500 gap-1"
                            variant={"outline"}
                        >
                            <span>Log in</span>
                            <img src={NoUser} height={25} width={25} />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default NavBar;
