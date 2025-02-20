import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveModalProps {
    children: React.ReactNode;
    title: string;
    open: boolean;
    className?: string;
    onOpenChange: (open: boolean) => void;
}
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
    children,
    title,
    open,
    onOpenChange,
    className="",
}) => {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="px-4 max-h-[50%] dark:bg-[#282828]">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="overflow-y-auto">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`p-4 flex-1 overflow-y-auto shadow-md dark:bg-[#282828] ${className}`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};
