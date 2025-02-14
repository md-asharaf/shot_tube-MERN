import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setLoginPopoverData } from "@/store/reducers/ui";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { login } from "@/store/reducers/auth";
import { authService } from "@/services/Auth";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
export const LoginPopover: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const { message, open } = useSelector(
        (state: RootState) => state.ui.loginPopoverData
    );
    const handleLoginClick = async () => {
        try {
            const data = await authService.loginViaRefreshToken();
            dispatch(login(data.user));
            toast.success("Logged in successfully");
        } catch (error) {
            navigate("/login");
        }
    };
    const onOpenChange = (open: boolean) => {
        dispatch(setLoginPopoverData({ open, message: "" }));
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[90%]
            sm:max-w-sm mx-4 p-6 rounded-xl shadow-xl border bg-background transform transition-transform scale-100 m-0"
            >
                <DialogHeader className="flex flex-col items-center">
                    <Lock
                        className="h-12 w-12 text-primary mb-4 animate-bounce"
                        strokeWidth={1}
                    />
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        Login Required
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        {message || "Please log in to continue."}
                    </p>
                    <DialogClose asChild>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover py-3 text-lg font-medium"
                            onClick={handleLoginClick}
                        >
                            Log In
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginPopover;
