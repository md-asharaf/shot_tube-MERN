import { X } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { useDispatch } from "react-redux";
import { setOpenCard } from "@/store/reducers/short";

export default function CommentsCard({ shortId }: { shortId: string }) {
    const dispatch = useDispatch();
    return (
        <Card>
            <CardTitle className="w-[500px]">
                <div className="flex justify-between px-4 items-center">
                    <div className="text-2xl">Comments</div>
                    <X size={20} onClick={() => dispatch(setOpenCard(""))} />
                </div>
            </CardTitle>
            <CardContent></CardContent>
        </Card>
    );
}
