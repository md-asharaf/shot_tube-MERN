import { EllipsisVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ThreeDotContent } from "./three-dot-content";

interface IThreeDots {
    task?: {
        title: string;
        handler: () => void;
    };
    videoId: string;
}
export const ThreeDots = ({ videoId, task = null }: IThreeDots) => {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <Popover modal>
                <PopoverTrigger asChild>
                    <EllipsisVertical />
                </PopoverTrigger>
                <PopoverContent
                    collisionPadding={10}
                    className="py-2 px-0 w-full rounded-xl shadow-lg bg-white dark:bg-[#212121] border-none text-sm"
                >
                    <ThreeDotContent videoId={videoId} task={task} />
                </PopoverContent>
            </Popover>
        </div>
    );
};
