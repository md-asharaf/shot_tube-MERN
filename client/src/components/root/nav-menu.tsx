import { NavLink } from "react-router-dom";
interface MenuProps {
    name: string;
    path: string;
}
interface NavigationMenuProps {
    data: MenuProps[];
}
const NavigationMenu: React.FC<NavigationMenuProps> = ({ data }) => {
    return (
            <div className="flex space-x-4 border-b">
                {data.map((item) => (
                    <NavLink
                        key={item.path}
                        end
                        to={item.path}
                        className={({ isActive }) =>
                            `px-4 py-2 ${
                                isActive && "border-b-2 border-primary"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>
    );
};

export default NavigationMenu;
