import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { toggleLoginPopover } from "@/store/reducers/ui";
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
import authService from "@/services/Auth";
import { toast } from "sonner";
const LoginPopover: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const loginPopoverVisible = useSelector(
        (state: RootState) => state.ui.isLoginPopoverVisible
    );
    const message = useSelector(
        (state: RootState) => state.ui.loginPopoverMessage
    );
    const handleLoginClick = async () => {
        try {
            const data = await authService.loginViaRefreshToken();
            dispatch(login(data.user));
            toast.success("Logged in successfully");
        } catch (error) {
            navigate("/login");
        } finally {
            dispatch(toggleLoginPopover(false));
        }
    };
    return (
        <Dialog
            open={loginPopoverVisible}
            onOpenChange={(open) => dispatch(toggleLoginPopover(open))}
        >
            <DialogContent className="max-w-sm w-full mx-4 p-6 rounded-xl shadow-xl border bg-background transform transition-transform scale-100">
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
                    <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover py-3 text-lg font-medium"
                        onClick={handleLoginClick}
                    >
                        Log In
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginPopover;
