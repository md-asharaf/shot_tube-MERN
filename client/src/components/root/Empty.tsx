import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Empty = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col w-full space-y-4 h-full items-center justify-center">
            <div className="text-2xl">Nothing to show 🥺</div>
            <Button onClick={() => navigate(-1)}>go back</Button>
        </div>
    );
};

export default Empty;
