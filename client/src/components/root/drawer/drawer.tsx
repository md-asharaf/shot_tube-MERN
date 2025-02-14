import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { BigDrawer } from "./big-drawer";
import { SmallDrawer } from "./small-drawer";
export const Drawer = () => {
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
        <div className="hidden sm:flex">
            {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
        </div>
    );
};
