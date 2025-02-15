import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setAlertDialogData } from "@/store/reducers/ui";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
export const GlobalAlertDialog = () => {
    const dispatch = useDispatch();
    const {open,message,onConfirm} = useSelector((state:RootState)=>state.ui.alertDialogData)
    const handleClose = () => {
        dispatch(setAlertDialogData({ open: false, message: "", onConfirm: () => {} }));
    }
    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="max-w-[90%] rounded-lg sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-red-500 text-sm">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
