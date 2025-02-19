import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";

const sentimentOptions = ["All", "Positive", "Negative", "Neutral"];

interface FilterProps {
    onFilterChange: (filter: string) => void;
}

export const Filter = ({ onFilterChange }: FilterProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="focus:outline-none">
                <SlidersHorizontal size={20} strokeWidth={1.5} />
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
