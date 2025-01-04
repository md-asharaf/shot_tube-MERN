import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateLayout: React.FC = () => {
    const userData = useSelector((state: RootState) => state.auth.userData);
    if (!userData) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default PrivateLayout;
