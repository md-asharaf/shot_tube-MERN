import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const sentimentOptions = [
    'All',
    'Positive',
    'Negative',
    'Neutral',
];

interface CommentFilterProps {
    onFilterChange: (filter: string) => void;
}

const CommentFilter = ({ onFilterChange }: CommentFilterProps) => {
    const [selectedFilter, setSelectedFilter] = useState(sentimentOptions[0]);

    const handleFilterChange = (value:string) => {
        setSelectedFilter(value);
        onFilterChange(value);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                    <span>{selectedFilter}</span>
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 p-0">
                {sentimentOptions.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        onClick={() => handleFilterChange(option)}
                        className="rounded-none"
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CommentFilter;
