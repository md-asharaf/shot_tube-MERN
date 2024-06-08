import { IoHomeOutline } from "react-icons/io5";
import SubDrawer from "./SubDrawer";
import { SiYoutubeshorts } from "react-icons/si";
import { MdOutlineSubscriptions } from "react-icons/md";

const SmallDrawer = () => {
    const options = [
        { name: "Home", icon: <IoHomeOutline />, route: "/" },
        { name: "Shorts", icon: <SiYoutubeshorts />, route: "/shorts" },
        {
            name: "Subscriptions",
            icon: <MdOutlineSubscriptions />,
            route: "/subscriptions",
        },
    ];
    return (
        <div className="ml-5 w-full">
            <SubDrawer options={options} isSmall />
        </div>
    );
};

export default SmallDrawer;
