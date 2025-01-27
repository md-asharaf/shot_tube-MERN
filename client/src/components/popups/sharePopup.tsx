import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setShareModal } from "@/store/reducers/ui";

export default function SharePopup() {
    const dispatch = useDispatch();
    const isModalOpen = useSelector(
        (state: RootState) => state.ui.isShareModalOpen
    );
    const videoId = useSelector((state: RootState) => state.ui.videoId);
    const videoLink = `https://shot-tube.live/video?v=${videoId}`;
    const inputRef = useRef(null);
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(videoLink);
        toast.success("Link copied to clipboard!");
    };
    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={(open) =>
                dispatch(setShareModal({ open, videoId: null }))
            }
        >
            <DialogContent className="max-w-[90%] sm:max-w-lg rounded-lg">
                <DialogHeader>
                    <DialogTitle>Share Video</DialogTitle>
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
}
