import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { BigDrawer } from "./big-drawer";
import { SmallDrawer } from "./small-drawer";
import { useEffect } from "react";
import { shortService } from "@/services/short";
import { setRandomShortId } from "@/store/reducers/short";
export const Drawer = () => {
    const dispatch = useDispatch();
    const isMenuOpen = useSelector((state: RootState) => state.ui.isMenuOpen);
    useEffect(()=>{
        shortService.randomShort().then((data)=>dispatch(setRandomShortId(data?.shortId))).catch((err)=>console.error(err))
        console.log("okay")
    },[])
    return (
        <div className="hidden sm:flex">
            {isMenuOpen ? <BigDrawer /> : <SmallDrawer />}
        </div>
    );
};
