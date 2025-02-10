import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoHome, GoHomeFill } from "react-icons/go";
import { SiYoutubeshorts } from "react-icons/si";
import {
    MdOutlineSubscriptions,
    MdOutlineVideoLibrary,
    MdSubscriptions,
    MdVideoLibrary,
} from "react-icons/md";
import { RootState } from "@/store/store";

const BottomBar = () => {
    const username = useSelector(
        (state: RootState) => state.auth.userData?.username
    );
    const shortId = useSelector((state:RootState)=>state.short.randomShortId)
    return (
        <div className="flex items-center justify-around bg-white dark:bg-black dark:text-white pt-2">
            <NavLink to={"/"}>
                {({ isActive }) => (
                    <div className="flex flex-col items-center">
                        {isActive ? (
                            <GoHomeFill className="text-xl" />
                        ) : (
                            <GoHome className="text-xl" />
                        )}
                        <span className="text-[12px]">Home</span>
                    </div>
                )}
            </NavLink>
            <NavLink to={`/short?s=${shortId}`}>
                <div className="flex flex-col items-center">
                    <SiYoutubeshorts className="text-xl" />
                    <span className="text-[12px]">Shorts</span>
                </div>
            </NavLink>
            <NavLink to={"/subscriptions"}>
                {({ isActive }) => (
                    <div className="flex flex-col items-center">
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
                <NavLink to={`/playlist-n-history?u=${username}`}>
                    {({ isActive }) => (
                        <div className="flex flex-col items-center">
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
    );
};

export default BottomBar;
