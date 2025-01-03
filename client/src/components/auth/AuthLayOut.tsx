import { RootState } from "@/store/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
const AuthLayOut = () => {
    const navigate = useNavigate();
    const userData = useSelector((state: RootState) => state.auth.userData);
    useEffect(()=>{
        if(userData) navigate("/");
    },[])
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

export default AuthLayOut;
