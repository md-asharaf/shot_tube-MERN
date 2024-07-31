import { Outlet } from "react-router-dom";
import bgImage from "@/assets/images/authBackgroundImage.jpg";
const AuthLayOut = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center dark:bg-black bg-white">
            <Outlet />
        </div>
    );
};

export default AuthLayOut;
