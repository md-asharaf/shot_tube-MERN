import z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { videoUpdateFormValidation } from "@/validations";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { shortService } from "@/services/short";
import { IShortData, Playlist } from "@/interfaces";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/constants";
import {
  CopyCheckIcon,
  CopyIcon,
  EarthIcon,
  ImageIcon,
  LockIcon,
  MoreVerticalIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { PlyrPlayer } from "@/components/root/video-player";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { playlistService } from "@/services/playlist";
import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { uploadService } from "@/services/upload";
import { v4 as uuid } from "uuid";
import { uploadToPresignedUrl } from "@/lib/upload";
import { toast } from "sonner";
import { resizeImage } from "@/lib/pica";
import { setCreatePlaylistDialog } from "@/store/reducers/ui";
export const ShortDetails = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isThumbnailUploaded, setIsThumbnailUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const BUCKET = process.env.INPUT_BUCKET;
  const playerRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const { username } = useSelector((state: RootState) => state.auth.userData);
  const { id } = useParams();
  const {
    data: short,
    isLoading: isShortLoading,
    refetch: refetchShort,
  } = useQuery({
    queryKey: ["short", id],
    queryFn: async (): Promise<IShortData> => {
      const data = await shortService.singleShort(id);
      return data.short;
    },
    enabled: !!id,
  });
  const shortLink = `https://shot-tube.live/short/${short?._id}`;
  const {
    data: playlists,
    isLoading: isPlaylistsLoading,
    refetch: refetchPlaylists,
  } = useQuery({
    queryKey: ["playlists", username],
    queryFn: async (): Promise<Playlist[]> => {
      const data = await playlistService.getAllPlaylists(username);
      return data.playlists;
    },
    enabled: !!username,
  });
  const form = useForm<z.infer<typeof videoUpdateFormValidation>>({
    resolver: zodResolver(videoUpdateFormValidation),
    defaultValues: {
      title: short.title || "",
      description: short.description || "",
      categories: short.categories || [],
      playlists:
        playlists
          ?.filter((p) => p.shorts.includes(short._id))
          .map((p) => p._id) || [],
      visibility: short.visibility || "public",
      thumbnail: "",
    },
  });
  const onCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  const onThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      let thumbnail = e.target.files?.[0];
      const thumbnailExtension = thumbnail?.name.split(".").pop();
      const thumbnailKey = `uploads/thumbnails/${uuid()}.${thumbnailExtension}`;
      thumbnail = await resizeImage(thumbnail, 720, 1280);
      const { url } = await uploadService.getPutObjectPresignedUrl(
        thumbnailKey,
        thumbnail?.type
      );
      await uploadToPresignedUrl(url, thumbnail, null, (progress) => {
        setUploadProgress(progress);
      });
      form.setValue(
        "thumbnail",
        `https://${BUCKET}.s3.ap-south-1.amazonaws.com/${thumbnailKey}`
      );
      setIsThumbnailUploaded(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };
  const onSubmit = async (data: z.infer<typeof videoUpdateFormValidation>) => {
    try {
      await shortService.updateShort(short._id, {
        ...data,
        thumbnail: data.thumbnail || short.thumbnail,
      });
      toast.success("Changes saved");
      refetchShort();
      refetchPlaylists();
    } catch (error) {
      toast.error(error.message);
    }
  };
  if (isShortLoading || isPlaylistsLoading || !short || !playlists) return null;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 px-6 py-4 max-w-[1300px]">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">Short Details</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-full"
                disabled={!form.formState.isDirty}
                onClick={() => form.reset()}
              >
                Undo changes
              </Button>
              <Button
                variant={form.formState.isDirty ? "default" : "secondary"}
                className="rounded-full"
                disabled={!form.formState.isDirty}
                type="submit"
              >
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <MoreVerticalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="m-0 p-0" collisionPadding={10}>
                  <DropdownMenuItem className="p-2">
                    <Trash2Icon /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid-cols-1 lg:grid-cols-5 gap-4 grid">
            <div className="lg:col-span-3 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Card className="px-2">
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm text-[#6B6B6B]">
                        Title (required)
                        {/*TODO: AI integration to genrate title */}
                      </FormLabel>
                      <FormControl className="p-0 m-0">
                        <Textarea
                          {...field}
                          maxLength={100}
                          className="resize-none"
                          placeholder="Add a title that describes your short"
                        />
                      </FormControl>
                    </FormItem>
                  </Card>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Card className="px-2">
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm text-[#6B6B6B]">
                        Description
                        {/*TODO: AI integration to genrate title */}
                      </FormLabel>
                      <FormControl className="p-0 m-0">
                        <Textarea
                          {...field}
                          maxLength={5000}
                          className="resize-none min-h-60"
                          placeholder="Tell viewers about your short"
                        />
                      </FormControl>
                    </FormItem>
                  </Card>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnail"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Thumbnail
                      {/*TODO: AI integration to genrate title */}
                      <p className="text-xs text-muted-foreground">
                        Set a thumbnail that stands out and draws viewers'
                        attention.
                      </p>
                    </FormLabel>

                    <div className="flex items-center gap-4">
                      <div
                        className={`relative flex flex-col items-center justify-center border-2 rounded border-dotted ${
                          isUploading && "animate-pulse"
                        } h-20 aspect-video`}
                      >
                        <Input
                          accept="image/*"
                          ref={inputRef}
                          type="file"
                          onChange={onThumbnailChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs">{`${uploadProgress}%`}</span>
                            <span className="text-xs">Uploading</span>
                          </div>
                        ) : isThumbnailUploaded ? (
                          <div className="relative w-full h-full">
                            <img
                              src={form.getValues("thumbnail")}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 z-40">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="focus:outline-none">
                                  <div className="rounded-full p-2 hover:bg-secondary-foreground">
                                    <MoreVerticalIcon
                                      className="size-4"
                                      color="white"
                                    />
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="m-0 p-0">
                                  <DropdownMenuItem
                                    className="p-2"
                                    onClick={() => inputRef.current?.click()}
                                  >
                                    <ImageIcon /> Change
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="p-2"
                                    onClick={() => {
                                      form.setValue("thumbnail", "");
                                      setIsThumbnailUploaded(false);
                                    }}
                                  >
                                    <Undo2Icon /> Undo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6" />
                            <div className="text-sm">Upload file</div>
                          </>
                        )}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <Select>
                      <FormControl>
                        <SelectTrigger className="max-w-sm">
                          <SelectValue
                            placeholder={`${
                              field.value.length > 0
                                ? `${field.value.length} categories`
                                : "Select"
                            }`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => {
                          const isSelected = field.value?.includes(category);
                          return (
                            <div
                              key={category}
                              className="flex items-center gap-4 px-4 py-2 cursor-pointer"
                              onClick={() => {
                                const newSelection = isSelected
                                  ? field.value.filter((c) => c !== category)
                                  : [...(field.value || []), category];
                                field.onChange(newSelection);
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="rounded size-4"
                              />
                              <div>{category}</div>
                            </div>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playlists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Playlists</FormLabel>
                    <Select open={open} onOpenChange={setOpen}>
                      <FormControl>
                        <SelectTrigger className="max-w-sm">
                          <SelectValue
                            placeholder={`${
                              field.value.length > 0
                                ? `${field.value.length} playlists`
                                : "Select"
                            }`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {playlists.map((playlist) => {
                          const isSelected = field.value?.includes(
                            playlist._id
                          );
                          return (
                            <div
                              key={playlist._id}
                              className="flex items-center gap-4 px-4 py-2 cursor-pointer"
                              onClick={() => {
                                const newSelection = isSelected
                                  ? field.value.filter(
                                      (id) => id !== playlist._id
                                    )
                                  : [...(field.value || []), playlist._id];
                                field.onChange(newSelection);
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="rounded size-4"
                              />
                              <div>{playlist.name}</div>
                            </div>
                          );
                        })}
                        <Separator />
                        <div className="flex items-center justify-between p-2">
                          <Button onClick={()=>dispatch(setCreatePlaylistDialog(true))}>New playlist</Button>
                          <Button variant="outline" onClick={()=>setOpen(false)}>Done</Button>
                        </div>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Card className="space-y-4 pb-2">
                <PlyrPlayer
                  key={form.getValues("thumbnail")}
                  thumbnail={form.getValues("thumbnail") || short.thumbnail}
                  playerRef={playerRef}
                  source={short.source}
                  subtitle={short.subtitle}
                  controls={["play", "progress", "mute"]}
                  className="w-full aspect-video"
                />
                <div className="flex items-center justify-between px-4">
                  <div className="flex flex-col">
                    <div className="text-xs text-muted-foreground">
                      Short Link:
                    </div>
                    <Link
                      className="w-64 lg:w-52 xl:w-68 2xl:w-80 truncate text-blue-500 text-sm hover:cursor-pointer hover:underline"
                      to={shortLink}
                    >
                      {shortLink}
                    </Link>
                  </div>
                  <div onClick={onCopy}>
                    {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                  </div>
                </div>
                <div className="flex flex-col px-4">
                  <div className="text-xs text-muted-foreground">
                    Short Status:
                  </div>
                  <div className="text-sm">{short.sourceStatus}</div>
                </div>
                <div className="flex flex-col px-4">
                  <div className="text-xs text-muted-foreground">
                    Subtitle Status:
                  </div>
                  <div className="text-sm">{short.subtitleStatus}</div>
                </div>
              </Card>
              <FormField
                name="visibility"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <EarthIcon className="size-4 mr-2" /> Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-2" /> Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
