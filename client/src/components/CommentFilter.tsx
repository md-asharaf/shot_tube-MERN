import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const sentimentOptions = ["All", "Positive", "Negative", "Neutral"];

interface CommentFilterProps {
    onFilterChange: (filter: string) => void;
    filter: string;
}

const CommentFilter = ({ onFilterChange, filter }: CommentFilterProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center space-x-2 px-2 bg-secondary rounded"
                >
                    <span>{filter}</span>
                    <ChevronDown className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                collisionPadding={20}
                align="start"
                className="w-40 p-0 bg-white dark:bg-[#212121]"
            >
                {sentimentOptions.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onClick={() => onFilterChange(option)}
                        className="rounded-none dark:hover:bg-[#535353] hover:bg-[#E5E5E5] py-2 px-4"
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CommentFilter;
