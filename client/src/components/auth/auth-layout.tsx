import { Outlet } from "react-router-dom";
export const AuthLayOut = () => {
    return (
        <div
            className="h-screen w-screen bg-cover flex items-center justify-center"
            style={{
                backgroundImage:
                    "url('https://png.pngtree.com/background/20210717/original/pngtree-abstract-modern-curvey-background-picture-image_1415876.jpg')",
            }}
        >
            <Outlet />
        </div>
    );
};
