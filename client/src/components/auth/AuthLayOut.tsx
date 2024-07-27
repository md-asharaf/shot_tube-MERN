import { Outlet } from "react-router-dom";
import bgImage from "@/assets/images/authBackgroundImage.jpg";
const AuthLayOut = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center relative">
            <img
                src={bgImage}
                alt=""
                className="absolute aspect-video object-cover right-0 top-0 w-full h-full z-0"
            />
            <div className="min-w-[700px] z-10">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayOut;
