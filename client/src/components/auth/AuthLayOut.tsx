import { Outlet } from "react-router-dom";
import bgImage from "@/assets/images/authBackgroundImage.jpg";
const AuthLayOut = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center relative">
            <img
                src={bgImage}
                alt=""
                className="absolute right-0 top-0 w-1/2 h-full z-0 object-cover  rounded-xl "
            />
            <div className="w-1/2">
                <Outlet />
            </div>
            <div className="w-1/2 h-full flex items-center justify-center z-10">
                <h1 className="text-2xl font-bold text-white">
                    {window.location.href === "http://localhost:5173/login"
                        ? "Welcome back!"
                        : "Hello there!"}
                </h1>
            </div>
        </div>
    );
};

export default AuthLayOut;
