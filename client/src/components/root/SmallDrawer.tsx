import { SiYoutubeshorts } from "react-icons/si";
import {
    MdOutlineSubscriptions,
    MdOutlineVideoLibrary,
    MdSubscriptions,
    MdVideoLibrary,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { GoHome, GoHomeFill } from "react-icons/go";
import { RootState } from "@/store/store";

const SmallDrawer = () => {
    const username = useSelector(
        (state: RootState) => state.auth.userData?.username
    );
    return (
        <div className="w-full pl-1">
            <div className={`flex-col cursor-pointer dark:text-white`}>
                <NavLink to={"/"}>
                    {({ isActive }) => (
                        <div
                            className={`flex flex-col items-center rounded-xl py-2 px-1 hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                        >
                            {isActive ? (
                                <GoHomeFill className="text-2xl" />
                            ) : (
                                <GoHome className="text-2xl" />
                            )}
                            <span className="text-[12px]">Home</span>
                        </div>
                    )}
                </NavLink>
                <NavLink to={"/shorts"}>
                    <div
                        className={`flex flex-col items-center rounded-xl py-2 px-1 hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                    >
                        <SiYoutubeshorts className="text-2xl" />
                        <span className="text-[12px]">Shorts</span>
                    </div>
                </NavLink>
                <NavLink to={"/subscriptions"}>
                    {({ isActive }) => (
                        <div
                            className={`flex flex-col items-center rounded-xl py-2 px-1 hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                        >
                            {isActive ? (
                                <MdSubscriptions className="text-2xl" />
                            ) : (
                                <MdOutlineSubscriptions className="text-2xl" />
                            )}
                            <span className="text-[12px]">Subscriptions</span>
                        </div>
                    )}
                </NavLink>
                {username && (
                    <NavLink to={`/playlist-n-history?u=${username}`}>
                        {({ isActive }) => (
                            <div
                                className={`flex flex-col items-center rounded-xl py-2 px-1 hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                            >
                                {isActive ? (
                                    <MdVideoLibrary className="text-2xl" />
                                ) : (
                                    <MdOutlineVideoLibrary className="text-2xl" />
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
