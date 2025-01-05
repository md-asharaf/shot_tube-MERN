import { useDispatch, useSelector } from "react-redux";
import SearchBar from "./SearchBar";
import { IoNotificationsOutline } from "react-icons/io5";
import { ImYoutube } from "react-icons/im";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Profile from "./Profile";
import { Link } from "react-router-dom";
import { shortName } from "@/lib/utils";
import { toggleMenu, toggleVideoModal } from "@/store/reducers/ui";
import authServices from "@/services/Auth";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { toggleTheme } from "@/store/reducers/theme";
import { FaSignOutAlt } from "react-icons/fa";
import { Menu, Plus, Search, User } from "lucide-react";
import { logoutFromGoogle } from "@/lib/firebase";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { logout } from "@/store/reducers/auth";

const NavBar = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);
  const userData = useSelector((state: RootState) => state.auth.userData);


  const onLogout = async () => {
    try {
      await logoutFromGoogle();
      await authServices.logout();
      toast.info("Logged out!!");
      dispatch(logout());
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-8 h-12 gap-2 w-full bg-background text-foreground">
      <div className="flex items-center gap-x-2 md:gap-x-4">
        <Menu
        strokeWidth={1.5}
          className="text-4xl hover:bg-muted rounded-lg hidden sm:block"
          onClick={() => {
            dispatch(toggleMenu());
          }}
        />
        <button
          className="flex items-center"
          onClick={() => (location.href = "/")}
        >
          <ImYoutube className="text-3xl w-10" />
          <h1 className="font-extrabold text-red-500">ShotTube</h1>
        </button>
      </div>
      <div className="items-center gap-x-2 flex">
        <div className="hidden md:flex gap-x-2">
          <SearchBar />
        </div>
        <div className="p-1 rounded-full hover:bg-muted">
          <Search className="md:hidden block text-3xl" />
        </div>
      </div>
      <div className="flex gap-1 sm:gap-4 lg:gap-8 items-center">
        <div>
          <DarkModeSwitch
            checked={theme === "dark"}
            onChange={() => dispatch(toggleTheme())}
          />
        </div>
        {userData ? (
          <>
            <button
              className="pl-2 pr-3 py-1 sm:py-1.5 text-sm items-center rounded-full bg-muted hover:bg-muted/80 flex space-x-1"
              onClick={() => dispatch(toggleVideoModal())}
            >
              <Plus /> <span>Create</span>
            </button>
            <div className="p-1 rounded-full hover:bg-muted">
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
                  <Link to={`/channel?u=${userData.username}`}>
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
                    <FaSignOutAlt className="text-xl" />
                    <div>Sign out</div>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link to={"/login"}>
            <Button
              className="rounded-2xl text-primary gap-1"
              variant={"outline"}
            >
              <span>Log in</span>
              <User
                className="hidden sm:block"
                height={25}
                width={25}
              />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;
