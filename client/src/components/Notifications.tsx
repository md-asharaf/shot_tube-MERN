import { useState, useCallback } from "react";
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
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import notificationService from "@/services/Notification";
import {
    setNotifications,
    resetNotificationCount,
} from "@/store/reducers/notification";
import { IoNotificationsOutline } from "react-icons/io5";
import { formatDistanceToNowStrict } from "date-fns";
import { CheckCheck, EllipsisVertical, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AvatarImg from "./AvatarImg";

const Notifications = () => {
    const dispatch = useDispatch();
    const { notifications, newNotificationCount } = useSelector(
        (state: RootState) => state.notification
    );
    const userId = useSelector((state: RootState) => state.auth.userData?._id);
    const [expandedMessages, setExpandedMessages] = useState({});

    const toggleExpand = (id: string) => {
        setExpandedMessages((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const { mutate: deleteNotification } = useMutation({
        mutationFn: async (date: Date) => {
            await notificationService.deleteNotification(date);
        },
        onSuccess: (_, deletedDate) => {
            dispatch(setNotifications(notifications.filter((n) => n.createdAt !== deletedDate)));
            toast.success("Notification deleted!");
        },
    });

    const { mutate: markAsRead } = useMutation({
        mutationFn: async (id:string) => {
            await notificationService.markAsRead(id);
        },
        onSuccess: (_, id) => {
            dispatch(setNotifications(
                notifications.map((n) =>
                    n._id === id ? { ...n, read: true } : n
                )
            ));
        },
    });

    const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ["notifications", userId],
        queryFn: async ({ pageParam }) => {
            const data = await notificationService.getNotifications(pageParam);
            dispatch(setNotifications(
                pageParam === 1
                    ? data.notifications.docs
                    : [...notifications, ...data.notifications.docs]
            ));
            return data.notifications;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => lastPage.hasNextPage ? allPages.length + 1 : undefined,
        enabled: !!userId,
    });

    const onDropDownOpenChange = (open: boolean) => {
        if (open && newNotificationCount > 0) {
            dispatch(resetNotificationCount());
        }
    };

    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const getRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new IntersectionObserver(observerCallback, { threshold: 0.5 });
        observer.observe(node);
    }, [observerCallback]);

    return (
        <DropdownMenu onOpenChange={onDropDownOpenChange}>
            <DropdownMenuTrigger>
                <div className="p-1 rounded-full hover:bg-muted relative">
                    <IoNotificationsOutline className="text-2xl" />
                    {newNotificationCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                            {newNotificationCount}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                collisionPadding={100}
                className="w-[455px] dark:bg-[#282828] p-0"
            >
                <div className="sticky top-0 z-10">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-muted-foreground opacity-40" />
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full w-full">
                        <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[550px] overflow-y-auto">
                        {notifications
                            .slice()
                            .reverse()
                            .map((notification, index) => {
                                const isExpanded = expandedMessages[notification._id] || false;
                                const message = notification.message;
                                const shortMessage = message.length > 100 ? message.slice(0, 100) + "..." : message;

                                return (
                                    <DropdownMenuItem
                                        onClick={() => markAsRead(notification._id)}
                                        key={index}
                                        className="flex items-start hover:dark:bg-[#3E3E3E] space-x-2"
                                    >
                                        <div className="flex space-x-2 w-3/4 items-start overflow-hidden">
                                            <div className="flex items-center">
                                                <div className="h-1.5 w-1.5 mr-2">
                                                    {!notification.read && (
                                                        <div className="h-full w-full bg-blue-500 rounded-full" />
                                                    )}
                                                </div>
                                                <div className="min-w-[52px] h-[52px] rounded-full">
                                                    <AvatarImg
                                                        avatar={notification.creator.avatar}
                                                        fullname={notification.creator.fullname}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    {isExpanded ? message : shortMessage}
                                                    {message.length > 100 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(notification._id);
                                                            }}
                                                            className="text-blue-500 text-xs ml-1"
                                                        >
                                                            {isExpanded ? "See less" : "See more"}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    {formatDistanceToNowStrict(
                                                        new Date(notification.createdAt),
                                                        { addSuffix: true }
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1 w-1/4">
                                            <div className="min-w-[80px]">
                                                <img
                                                    src={notification.video?.thumbnail || notification.tweet?.image}
                                                    alt="notification thumbnail"
                                                    className="h-full w-full aspect-video object-cover rounded-sm"
                                                />
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="p-0">
                                                    <div className="p-1 rounded-full hover:bg-muted">
                                                        <EllipsisVertical className="text-sm" />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    key={index}
                                                    onClick={(e) => e.stopPropagation()}
                                                    collisionPadding={120}
                                                    className="dark:bg-[#282828] p-0 rounded-lg shadow-lg space-y-2"
                                                >
                                                    <button
                                                        className="flex space-x-2 hover:bg-muted-foreground w-full p-2"
                                                        onClick={() => deleteNotification(notification.createdAt)}
                                                    >
                                                        <EyeOff className="h-5 w-5" />
                                                        <span>Hide this notification</span>
                                                    </button>
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="flex space-x-2 hover:bg-muted-foreground w-full p-2"
                                                    >
                                                        <CheckCheck className="h-5 w-5" />
                                                        <span>Mark as read</span>
                                                    </button>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        <div className="flex items-center justify-center" ref={getRef}>
                            {isFetchingNextPage ? <Loader2 className="h-10 w-10 animate-spin" /> : "No more notifications"}
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
