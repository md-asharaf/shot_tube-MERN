import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

const SearchBar = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState<string>("");

    const handleSearch = () => {
        if (input.trim()) navigate("/results?q=" + input);
    };

    return (
        <div className="flex items-center justify-center w-[40vw] mx-auto">
            <div className="flex-1 relative">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search"
                    className="w-full h-10 pl-4 pr-12 rounded-l-full border focus:outline-none"
                />
                {input && (
                    <button
                        className="absolute top-1/2 right-3 -translate-y-1/2"
                        onClick={() => setInput("")}
                        aria-label="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            <button
                onClick={handleSearch}
                disabled={!input.trim()}
                className="flex items-center justify-center w-16 h-10 dark:bg-[#3C3C3C] bg-[#F0F0F0] border
                dark:border-[#3C3C3C] border-[#F0F0F0] rounded-r-full"
                aria-label="Search"
            >
                <Search size={18} />
            </button>
        </div>
    );
};

export default SearchBar;
