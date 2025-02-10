import { PlusIcon } from "lucide-react";
import { SidebarTrigger } from "../../ui/sidebar";
import { Link } from "react-router-dom";
import { ImYoutube } from "react-icons/im";
import SearchBar from "../../SearchBar";
import Profile from "../../Profile";
import { Button } from "../../ui/button";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { toggleTheme } from "@/store/reducers/theme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function StudioNavbar() {
    const theme = useSelector((state: RootState) => state.theme.mode);
    const dispatch = useDispatch();
    return (
        <nav className="fixed top-0 bg-white dark:bg-black right-0 left-0 flex items-center justify-between h-16 pl-2 pr-5 z-50 shadow-md border-b">
            <div className="flex items-center gap-4 w-full">
                <div className="flex items-center flex-shrink-0 gap-4">
                    <SidebarTrigger/>
                    <Link to="/studio">
                        <div className="flex items-center hover:bg-transparent gap-1">
                            <ImYoutube color="red" className="text-xl" />
                            <h1 className="font-bold text-xl tracking-tight">
                                Studio
                            </h1>
                        </div>
                    </Link>
                </div>
                <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
                    <SearchBar />
                </div>
                <div className="flex items-center gap-8">
                    <DarkModeSwitch
                        checked={theme === "dark"}
                        onChange={() => dispatch(toggleTheme())}
                    />
                    <Button
                        variant="outline"
                        className="flex rounded-full px-4 py-2 [&_svg]:size-5"
                    >
                        <PlusIcon />
                        Create
                    </Button>
                    <Profile />
                </div>
            </div>
        </nav>
    );
}
