import { NavLink } from "react-router-dom";
interface IOption {
    name: string;
    icon?: React.ReactNode;
    route: string;
}
const SubDrawer: React.FC<{ options: IOption[] }> = ({ options }) => {
    return (
        <div className={`flex-col dark:text-white`}>
            {options?.map((option, index) => (
                <NavLink
                    to={option.route}
                    key={index}
                    className={({ isActive }) =>
                        `flex items-center gap-x-4 rounded-xl p-2 ${
                            isActive && "bg-zinc-200 dark:bg-zinc-800"
                        } `
                    }
                >
                    {option.icon && (
                        <span className="text-xl">{option.icon}</span>
                    )}
                    <span>{option.name}</span>
                </NavLink>
            ))}
        </div>
    );
};
export default SubDrawer;
