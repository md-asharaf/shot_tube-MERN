import { Outlet } from "react-router-dom";
const AuthLayOut = () => {
    return (
        <div className="h-screen w-screen bg-cover flex items-center justify-center bg-[url('https://png.pngtree.com/background/20210717/original/pngtree-abstract-modern-curvey-background-picture-image_1415876.jpg')]">
            <div className="w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4 items-center justify-center flex flex-col gap-2 text-black">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayOut;
