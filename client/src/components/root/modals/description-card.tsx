import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IShortData } from "@/interfaces";
import { useDispatch } from "react-redux";
import { setOpenCard } from "@/store/reducers/short";

export const DescriptionCard = ({
    short,
    likes,
}: {
    short: IShortData;
    likes: number;
}) => {
    const date = new Date(short.createdAt);
    const dispatch = useDispatch();
    return (
        <Card className="w-[512px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex justify-between px-4 items-center">
                        <div className="text-2xl">Description</div>
                        <X
                            size={30}
                            strokeWidth={0.7}
                            onClick={() => dispatch(setOpenCard(""))}
                        />
                    </div>
                </CardTitle>
            </CardHeader>
            <hr className="mb-2" />
            <CardContent className="w-[512px] h-[815px]">
                <p>{short.description}</p>
                <hr className="my-2" />
                <div className="flex items-center justify-around">
                    <div>
                        <p className="font-bold">{likes}</p>
                        <p className="text-muted-foreground text-sm">Likes</p>
                    </div>
                    <div>
                        <p className="font-bold">{short.views}</p>
                        <p className="text-muted-foreground text-sm">Views</p>
                    </div>
                    <div>
                        <p className="font-bold flex space-x-2">
                            {`${date.getDate()} ${date.toLocaleString("en-US", {
                                month: "long",
                            })}`}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {date.getFullYear()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
