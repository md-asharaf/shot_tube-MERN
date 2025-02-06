import { X } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { IShortData } from "@/interfaces";
import { useDispatch } from "react-redux";
import { setOpenCard } from "@/store/reducers/short";


export default function DescriptionCard({short,likes}:{short:IShortData,likes:number}){
  const dispatch = useDispatch();
    return (
        <Card >
            <CardTitle>
                <div className="flex justify-between px-4 items-center">
                    <div className="text-2xl">Description</div>
                    <X size={20} onClick={() => dispatch(setOpenCard(""))}/>
                </div>
            </CardTitle>
            <CardContent>
            <div className="flex items-center space-x-6 text-sm">
            <div>
              <p className="font-semibold">{likes}</p>
              <p className="text-gray-400">Likes</p>
            </div>
            <div>
              <p className="font-semibold">{short.views}</p>
              <p className="text-gray-400">Views</p>
            </div>
            <div>
              <p className="font-semibold">
                {short.createdAt.toString()}
              </p>
              <p className="text-gray-400">{short.createdAt.toString()}</p>
            </div>
          </div>
            </CardContent>
        </Card>
    )
}