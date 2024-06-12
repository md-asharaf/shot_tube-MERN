import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
// import { ScrollArea } from "@/components/ui/scroll-area";

const RootLayOut = () => {
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
        <div>
            <header>
                <nav>
                    <NavBar />
                </nav>
            </header>
            <div className="flex pt-20 space-x-4">
                {isMenuOpen ? (
                    <div className="w-44 hidden sm:block">
                        <BigDrawer />
                    </div>
                ) : (
                    <div className="w-11 hidden sm:block">
                        <SmallDrawer />
                    </div>
                )}
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayOut;
