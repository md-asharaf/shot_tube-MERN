import { Outlet } from "react-router-dom";
const AuthLayOut = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center dark:bg-black bg-white">
            <Outlet />
        </div>
    );
};

export default AuthLayOut;
