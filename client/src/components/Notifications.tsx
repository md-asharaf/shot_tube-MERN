import { useDispatch, useSelector } from "react-redux";
import useSocketNotifications from "@/hooks/use-notification";
import { RootState } from "@/store/store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import notificationService from "@/services/Notification";
import { setNotifications } from "@/store/reducers/notification";
import { IoNotificationsOutline } from "react-icons/io5";
const Notifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(
        (state: RootState) => state.notification.notifications
    );
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    useQuery({
        queryKey: ["notifications", userId],
        queryFn: async () => {
            const data = await notificationService.getNotifications();
            dispatch(setNotifications(data.notifications));
        },
    });
    useSocketNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="p-1 rounded-full hover:bg-muted">
                    <IoNotificationsOutline className="text-2xl" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification, index) => (
                    <DropdownMenuItem key={index} className="flex space-x-4">
                        {notification.message}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
