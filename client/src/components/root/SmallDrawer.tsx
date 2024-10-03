import { SiYoutubeshorts } from "react-icons/si";
import {
    MdOutlineSubscriptions,
    MdOutlineVideoLibrary,
    MdSubscriptions,
    MdVideoLibrary,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "@/provider";
import { NavLink } from "react-router-dom";
import { GoHome, GoHomeFill } from "react-icons/go";

const SmallDrawer = () => {
    const username = useSelector(
        (state: RootState) => state.auth.userData?.username
    );
    return (
        <div className="w-full">
            <div className={`flex-col cursor-pointer dark:text-white`}>
                <NavLink to={"/"}>
                    {({ isActive }) => (
                        <div className="flex flex-col items-center rounded-xl p-2">
                            {isActive ? (
                                <GoHomeFill className="text-xl" />
                            ) : (
                                <GoHome className="text-xl" />
                            )}
                            <span className="text-[12px]">Home</span>
                        </div>
                    )}
                </NavLink>
                <NavLink to={"/shorts"}>
                    <div className="flex flex-col items-center rounded-xl p-2">
                        <SiYoutubeshorts className="text-xl" />
                        <span className="text-[12px]">Shorts</span>
                    </div>
                </NavLink>
                <NavLink to={"/subscriptions"}>
                    {({ isActive }) => (
                        <div className="flex flex-col items-center rounded-xl p-2">
                            {isActive ? (
                                <MdSubscriptions className="text-xl" />
                            ) : (
                                <MdOutlineSubscriptions className="text-xl" />
                            )}
                            <span className="text-[12px]">Subscriptions</span>
                        </div>
                    )}
                </NavLink>
                {username && (
                    <NavLink to={`/${username}/playlist-n-history`}>
                        {({ isActive }) => (
                            <div className="flex flex-col items-center rounded-xl p-2">
                                {isActive ? (
                                    <MdVideoLibrary className="text-xl" />
                                ) : (
                                    <MdOutlineVideoLibrary className="text-xl" />
                                )}
                                <span className="text-[12px]">Library</span>
                            </div>
                        )}
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default SmallDrawer;
