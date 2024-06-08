import { ApiResponse } from "@/interfaces";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { logout } from "@/provider";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function shortName(name: string | undefined) {
    if (!name) return "";
    const splitName = name.split(" ");
    if (splitName.length == 2) {
        return (splitName[0][0] + splitName[1][0]).toUpperCase();
    }
    return splitName[0][0].toUpperCase();
}
export const handleResponse = (
    res: ApiResponse,
    dispatch: Dispatch<UnknownAction>
) => {
    console.log("Response message:: ", res.message);
    if (res.status === 401) {
        dispatch(logout());
        return false;
    }
    return res.success;
};
export const useSuccess =
    (dispatch: Dispatch<UnknownAction>) => (res: ApiResponse) =>
        handleResponse(res, dispatch);
