import { NavLink } from "react-router-dom";
interface IOption {
    name: string;
    icon?: React.ReactNode;
    route: string;
}
const SubDrawer: React.FC<{ options: IOption[] }> = ({ options }) => {
    return (
        <div className={`flex-col dark:text-white pr-6`}>
            {options?.map((option, index) => (
                <NavLink
                    to={option.route}
                    key={index}
                    className={
                        `flex items-center gap-x-4 rounded-xl p-2 ${
                            location.pathname==option.route && "bg-zinc-200 dark:bg-zinc-800"
                        }  hover:bg-zinc-200 dark:hover:bg-zinc-800`
                    }
                >
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.name}</span>
                </NavLink>
            ))}
        </div>
    );
};
export default SubDrawer;
