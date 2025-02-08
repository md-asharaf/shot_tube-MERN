import { X } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { useDispatch} from "react-redux";
import { setOpenCard } from "@/store/reducers/short";
import Comments from "./Comments";

export default function CommentsCard({
    shortId,
    playerRef,
    creatorId,
}: {
    shortId: string;
    playerRef: any;
    creatorId: string;
}) {
    const dispatch = useDispatch();
    return (
        <Card className="w-[512px]">
            <CardTitle className="relative">
                <X
                    size={30}
                    strokeWidth={0.7}
                    onClick={() => dispatch(setOpenCard(""))}
                    className="absolute right-4 top-4 cursor-pointer"
                />
            </CardTitle>
            <CardContent className="min-w-[300px] max-w-lg h-[910px] overflow-y-auto px-2 pt-2">
                <Comments
                    playerRef={playerRef}
                    id={shortId}
                    creatorId={creatorId}
                    type="short"
                />
            </CardContent>
        </Card>
    );
}
