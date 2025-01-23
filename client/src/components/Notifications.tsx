import { useDispatch, useSelector } from "react-redux";
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
import { formatDistanceToNowStrict } from "date-fns";
import { EllipsisVertical } from "lucide-react";
const Notifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(
        (state: RootState) => state.notification?.notifications
    );
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    useQuery({
        queryKey: ["notifications", userId],
        queryFn: async () => {
            const data = await notificationService.getNotifications();
            dispatch(setNotifications(data.notifications.docs));
            return true;
        },
        enabled: !!userId,
    });
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="p-1 rounded-full hover:bg-muted">
                    <IoNotificationsOutline className="text-2xl" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="bottom"
                align="start"
                collisionPadding={100}
                className="max-w-[480px] dark:bg-[#282828] p-0"
            >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-muted-foreground opacity-40"  />
                <div className="space-y-4">{notifications?.map((notification, index) => (
                    <DropdownMenuItem
                        key={index}
                        className="flex items-start justify-between hover:dark:bg-[#3E3E3E]"
                    >
                        <div className="flex space-x-4 w-3/4 items-start">
                            <div className="flex items-center">
                                {!notification.read && <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-2" />}
                                <img
                                    src={
                                        notification.video?.creatorImage ||
                                        notification.tweet?.creatorImage
                                    }
                                    className="min-w-[52px] h-[52px]  rounded-full"
                                    alt="creator"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    {notification.message}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {formatDistanceToNowStrict(
                                        new Date(notification.createdAt),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 w-1/4">
                            <div className="w-25">
                                <img
                                    src={
                                        notification.video?.thumbnail ||
                                        notification.tweet?.thumbnail
                                    }
                                    alt="tweet"
                                    className="h-full w-full aspect-video object-cover rounded-sm"
                                />
                            </div>
                            <div>
                                <EllipsisVertical />
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}</div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
