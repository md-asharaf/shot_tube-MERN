import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import BigDrawer from "./BigDrawer";
import SmallDrawer from "./SmallDrawer";
export default function Drawer() {
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    return (
        <div className="hidden sm:flex">
            {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
        </div>
    );
}
