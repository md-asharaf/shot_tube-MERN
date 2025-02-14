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
    width?: number;
    onOpenChange: (open: boolean) => void;
}
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
    children,
    title,
    open,
    onOpenChange,
    width,
}) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="px-4 max-h-[50%]">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="overflow-y-auto">{children}</div>
                </DrawerContent>
            </Drawer>
        );
    }
    const widthClass = width ? `w-${width.toString()}` : "";
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`p-4 flex-1 overflow-y-auto ${widthClass}`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};
