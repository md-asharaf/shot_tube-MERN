import { IoHomeOutline } from "react-icons/io5";
import SubDrawer from "./SubDrawer";
import { SiYoutubeshorts } from "react-icons/si";
import { MdOutlineSubscriptions } from "react-icons/md";

const SmallDrawer = () => {
    const options = [
        { name: "Home", icon: <IoHomeOutline />, route: "/" },
        {
            name: "Shorts",
            icon: <SiYoutubeshorts />,
            route: window.location.href,
        },
        {
            name: "Subscriptions",
            icon: <MdOutlineSubscriptions />,
            route: window.location.href,
        },
    ];
    return (
        <div className="w-full">
            <SubDrawer options={options} isSmall />
        </div>
    );
};

export default SmallDrawer;
