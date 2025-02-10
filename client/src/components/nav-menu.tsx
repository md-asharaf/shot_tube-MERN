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
        <nav className="bg-background border-b-2">
            <div className="flex items-center space-x-6 px-4 py-2">
                {data.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${isActive && "border-b-2"}`
                        }
                    >
                        {item.name}
                        <span
                            className="absolute bottom-0 left-0 h-[2px] bg-white transition-opacity"
                            style={{
                                opacity:
                                    window.location.pathname === item.path
                                        ? 1
                                        : 0,
                            }}
                        />
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default NavigationMenu;
