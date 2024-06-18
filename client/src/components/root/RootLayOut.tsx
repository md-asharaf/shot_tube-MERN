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
            <div className="flex py-20 pr-4 space-x-4 h-screen w-screen">
                {isMenuOpen ? (
                    <div className="pl-6 min-w-44 hidden sm:block overflow-auto">
                        <BigDrawer />
                    </div>
                ) : (
                    <div className="min-w-12 hidden sm:block overflow-auto">
                        <SmallDrawer />
                    </div>
                )}
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayOut;
