import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setShareModalData } from "@/store/reducers/ui";

export const SharePopup = () => {
    const dispatch = useDispatch();
    const { id, open, type } = useSelector(
        (state: RootState) => state.ui.shareModalData
    );
    const videoLink = `https://shot-tube.live/${type}?${type[0]}=${id}`;
    const inputRef = useRef(null);
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(videoLink);
        toast.success("Link copied to clipboard!");
    };
    const onOpenChange = (open: boolean) => {
        dispatch(setShareModalData({ open, id: "", type: "" }));
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90%] sm:max-w-lg rounded-lg">
                <DialogHeader>
                    <DialogTitle>{`Share ${type}`}</DialogTitle>
                </DialogHeader>
                <div className="flex space-x-2 p-2 items-center rounded-lg border border-gray-300 dark:border-gray-600">
                    <Input
                        className="w-full text-sm p-1"
                        value={videoLink}
                        readOnly
                        ref={inputRef}
                        autoComplete="off"
                    />
                    <Button
                        onClick={() => {
                            handleCopyToClipboard();
                            if (inputRef.current) {
                                inputRef.current.select();
                            }
                        }}
                        className="rounded-full bg-blue-500"
                    >
                        Copy
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
