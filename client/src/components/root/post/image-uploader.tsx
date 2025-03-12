import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface Data {
  text: string;
  images: Array<File>;
}

interface ImagePostProps {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  reset: () => void;
}
export const ImageUploader = ({ data, setData, reset }: ImagePostProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<number>(0);
  const { text, images } = data || {};
  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, 5 - images.length);
    if (newFiles.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    setData((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
    setIndex(0);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
    multiple: true,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - images.length);
      if (newFiles.length + images.length > 5) {
        toast.error("You can upload a maximum of 5 images.");
        return;
      }
      setData((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
    }
  };

  const removeImage = (index: number) => {
    setData((prev) => {
      const newImages = prev.images?.filter((_, i) => i !== index);
      return { ...prev, images: newImages };
    });
    setIndex(index == 0 ? 0 : index - 1);
  };
  const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, text: event.target.value }));
  };
  const triggerFileInput = () => {
    inputRef.current?.click();
  };
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Write a message..."
        className="resize-none"
        value={text}
        onChange={onTextChange}
      />
      <Card
        className={`rounded ${
          isDragActive
            ? "border-2 border-dashed border-blue-500 bg-blue-500/10"
            : ""
        }`}
        {...getRootProps()}
      >
        <CardHeader className="relative p-0 m-0">
          <XIcon
            className="absolute top-0 right-0 size-8 cursor-pointer hover:bg-secondary rounded-full p-1"
            onClick={() => reset()}
          />
        </CardHeader>
        <CardContent className="h-[350px] px-0 m-0 flex flex-col items-center">
          <Input
            {...getInputProps()}
            ref={inputRef}
            multiple
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          {images.length === 0 ? (
            <div className="flex flex-1 flex-col space-y-4 items-center justify-center">
              <div className="rounded-full w-12 aspect-square flex items-center justify-center bg-blue-500">
                <ImageIcon size={20} />
              </div>
              <div className="text-center">
                <div>Drag up to 5 images or GIFs or</div>
                <div
                  className="relative text-blue-500 hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  Select from your computer
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full h-full">
              <div className="flex flex-col gap-2 w-full md:w-1/6 h-full overflow-y-auto px-2">
                {images.map((file, i) => (
                  <div
                    key={i}
                    className="relative hover:opacity-80 cursor-pointer"
                    onClick={() => setIndex(i)}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Uploaded ${i + 1}`}
                      className="object-cover aspect-video rounded w-full h-auto"
                    />
                    <XIcon
                      className="absolute top-1 right-1 size-6 cursor-pointer bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                    />
                  </div>
                ))}
                {images.length < 5 && (
                  <div className="flex items-center justify-center aspect-video cursor-pointer bg-secondary">
                    <div
                      className="rounded-full w-10 aspect-square flex items-center justify-center bg-blue-400"
                      onClick={triggerFileInput}
                    >
                      <ImagePlusIcon className="size-4" />
                    </div>
                  </div>
                )}
              </div>
              {images.length > 0 && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4">
                  <img
                    src={URL.createObjectURL(images?.[index])}
                    alt={`Image ${index + 1}`}
                    className="object-cover aspect-video rounded w-full md:w-3/4 h-auto"
                  />
                </div>
              )}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {images.length === 0
              ? "Upload an image with an aspect ratio between 2:5 and 5:2"
              : `${images.length}/5 images uploaded`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
