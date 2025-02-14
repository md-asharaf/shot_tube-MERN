import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Empty = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col w-full space-y-4 h-full items-center justify-center dark:text-white">
            <div className="text-2xl">Working on it... 🥺</div>
            <Button
                onClick={() => navigate(-1)}
                className="dark:bg-white dark:text-black"
            >
                go back
            </Button>
        </div>
    );
};
