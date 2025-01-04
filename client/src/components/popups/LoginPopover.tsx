import React from "react";
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
import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";

const LoginPopover: React.FC = () => {
    const location = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const loginPopoverVisible = useSelector(
        (state: RootState) => state.ui.isLoginPopoverVisible
    );

    const closePopover = () => dispatch(toggleLoginPopover(false));

    return (
        <Dialog
            open={loginPopoverVisible}
            onOpenChange={(open) => dispatch(toggleLoginPopover(open))}
        >
            <DialogContent className="max-w-sm mx-auto p-6 rounded-lg shadow-lg border bg-background">
                <DialogHeader className="flex flex-col items-center">
                    <Lock className="h-10 w-10 text-primary mb-4" strokeWidth={1} />
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Login Required
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-8">
                        To access this feature, you need to log in. Please log in to continue.
                    </p>
                    <Link to={`/login?r=${location.pathname+location.search}`}>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                            onClick={closePopover}
                        >
                            Log In
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginPopover;
