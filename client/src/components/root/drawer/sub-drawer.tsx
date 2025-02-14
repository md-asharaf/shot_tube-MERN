import { NavLink, useLocation } from "react-router-dom";
import { AvatarImg } from "@/components/root/avatar-image";
interface IOption {
    name: string;
    icon?: React.ReactNode;
    avatar?: string;
    route: string;
}
export const SubDrawer = ({ options }: { options: IOption[] }) => {
    const location = useLocation();
    return (
        <div className={`flex-col dark:text-white pr-6`}>
            {options?.map(({ route, icon, name, avatar }, index) => (
                <NavLink
                    to={route}
                    key={index}
                    className={`flex items-center gap-x-2 rounded-xl p-2 ${
                        location.pathname == route &&
                        "bg-zinc-200 dark:bg-zinc-800"
                    }  hover:bg-zinc-200 dark:hover:bg-zinc-800`}
                >
                    {icon ? (
                        <span>{icon}</span>
                    ) : name == "You >" ? null : (
                        <AvatarImg
                            avatar={avatar}
                            fullname={name}
                            className="h-7 w-7"
                        />
                    )}
                    <span>{name}</span>
                </NavLink>
            ))}
        </div>
    );
};
export default SubDrawer;
