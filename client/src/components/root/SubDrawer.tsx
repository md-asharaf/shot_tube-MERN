import { Link } from "react-router-dom";
interface IOption {
    name: string;
    icon?: React.ReactNode;
    route?: string;
}
interface ISubDrawer {
    options: IOption[];
    isSmall?: boolean;
}
const SubDrawer: React.FC<ISubDrawer> = ({ options, isSmall = false }) => {
    return (
        <div className={`flex-col cursor-pointer ${isSmall && "w-11"}`}>
            {options?.map((option, index) => (
                <Link
                    to={option.route}
                    key={index}
                    className={`flex ${
                        isSmall && "flex-col text-[11px]"
                    } items-center gap-x-4 hover:bg-zinc-400 rounded-xl p-2`}
                >
                    {option.icon && (
                        <span className="text-xl">{option.icon}</span>
                    )}
                    <span>{option.name}</span>
                </Link>
            ))}
        </div>
    );
};
export default SubDrawer;
