import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { useDispatch, useSelector } from "react-redux";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
import { useEffect} from "react";
import BottomBar from "./BottomBar";
import userServices from "@/services/User";
import { RootState } from "@/store/store";
import { login, logout } from "@/store/reducers/auth";
const RootLayOut = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userServices.getCurrentUser();
                if (data.user) {
                    dispatch(login(data.user));
                } else {
                    dispatch(logout());
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    }, [navigate]);
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
            <div className="w-screen bg-white dark:bg-black h-screen flex flex-col">
                <nav className="z-30 fixed top-0 left-0 h-12 sm:h-16 w-full">
                    <NavBar />
                </nav>
                <div className="flex flex-1 overflow-hidden mt-12 sm:mt-16 sm:space-x-4">
                    <div className="hidden sm:flex">
                        {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
                    </div>
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{
                            paddingBottom: "38px",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <Outlet />
                    </div>
                </div>
                <div className="sm:hidden fixed bottom-0 z-10 left-0 w-full">
                    <BottomBar />
                </div>
            </div>
    );
};

export default RootLayOut;
