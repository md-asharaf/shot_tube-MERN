import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toggleVideoModal } from "@/store/reducers/ui";
import { RootState } from "@/store/store";
import {
  ListPlusIcon,
  PlusIcon,
  SquarePenIcon,
  SquarePlayIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
interface CreateDropdownProps {
  isPlaylist?: boolean;
}
export const CreateDropdown = ({ isPlaylist = false }: CreateDropdownProps) => {
  const { username } =
    useSelector((state: RootState) => state.auth.userData) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onVideoUploadClick = () => {
    if (!window.location.pathname.startsWith("/studio"))
      navigate(`/studio/${username}/content`);
    dispatch(toggleVideoModal());
  }
  const onCreatePostClick = () => {
    navigate(`/channel/${username}/posts`)
  }
  const onNewPlaylistClick = () => {}
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" asChild>
        <Button
          variant="secondary"
          className="flex rounded-full px-4 py-2 [&_svg]:size-5"
        >
          <PlusIcon />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 py-2 m-0">
        <DropdownMenuItem
          onClick={onVideoUploadClick}
          className="flex items-center gap-4 rounded-none px-4 py-2 cursor-pointer [&_svg]:size-6"
        >
          <SquarePlayIcon strokeWidth={1.2} /> <span>Upload video</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreatePostClick}
          className="flex items-center gap-4 rounded-none px-4 py-2 cursor-pointer [&_svg]:size-6"
        >
          <SquarePenIcon strokeWidth={1.2} /> <span>Create post</span>
        </DropdownMenuItem>
        {isPlaylist && (
          <DropdownMenuItem
            onClick={onNewPlaylistClick}
            className="flex items-center gap-4 rounded-none px-4 py-2 cursor-pointer [&_svg]:size-6"
          >
            <ListPlusIcon strokeWidth={1.2} /> <span>New playlist</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
