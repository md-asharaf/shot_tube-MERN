import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, RootState } from "@/provider";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
import VideoProvider from "@/provider/video.slice";
import { useEffect, useState } from "react";
import BottomBar from "./BottomBar";
// import { Bounce, ToastContainer } from "react-toastify";
import userServices from "@/services/user.services";
const RootLayOut = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
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
    const theme = useSelector((state: RootState) => state.theme.mode);
    return (
        <VideoProvider value={{ query, setQuery }}>
            <div className="w-screen bg-white dark:bg-black h-screen flex flex-col">
                <nav className="z-30 fixed top-0 left-0 h-12 sm:h-16 w-full">
                    <NavBar />
                </nav>
                <div className="flex flex-1 overflow-hidden sm:px-1 mt-12 sm:mt-16 sm:space-x-4">
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
                {/* <ToastContainer
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover={false}
                    theme={theme}
                    transition={Bounce}
                /> */}
            </div>
        </VideoProvider>
    );
};

export default RootLayOut;
