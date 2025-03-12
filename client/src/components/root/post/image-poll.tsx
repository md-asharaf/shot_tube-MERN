import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, TrashIcon } from "lucide-react";
import { useEffect } from "react";

interface Data {
  text: string;
  options: { image: string; text: string }[];
}

interface ImagePollProps {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  reset: () => void;
}

interface PollOptionProps {
  index: number;
  option: { image: string; text: string };
  onDelete: (index: number) => void;
  onFileChange: (file: File, index: number) => void;
  onInputChange: (value: string, index: number) => void;
}

export const ImagePoll = ({ data, setData, reset }: ImagePollProps) => {
  const handleAddOption = () => {
    setData((prev) => {
      const options = [...prev.options];
      options.push({ image: "", text: "" });
      return { ...prev, options };
    });
  };
  const handleFileChange = (file: File, index: number) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setData((prev) => {
          const options = [...prev.options];
          options[index].image = reader.result as string;
          return { ...prev, options };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (value: string, index: number) => {
    setData((prev) => {
      const options = [...prev.options];
      options[index].text = value;
      return { ...prev, options };
    });
  };

  const deleteOption = (index: number) => {
    setData((prev) => {
      const options = [...prev.options];
      options.splice(index, 1);
      return { ...prev, options };
    });
  };
  const { options } = data;
  useEffect(() => {
    if (options.length == 0) {
      reset();
    }
  }, [options]);
  if (options.length === 0) return null;
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col space-y-4 w-full">
        <Textarea
          className="resize-none"
          placeholder="Ask your community..."
          value={data.text}
          onChange={(e) =>
            setData((prev) => ({ ...prev, text: e.target.value }))
          }
        />
        {options.map((option, index) => (
          <PollOption
            key={index}
            index={index}
            option={option}
            onDelete={deleteOption}
            onFileChange={handleFileChange}
            onInputChange={handleInputChange}
          />
        ))}
      </div>
      <Button
        variant="outline"
        disabled={options.length === 4}
        className="mt-4 rounded-full text-blue-600 hover:text-blue-600"
        size="lg"
        onClick={handleAddOption}
      >
        Add option
      </Button>
    </div>
  );
};

const PollOption = ({
  index,
  option,
  onDelete,
  onFileChange,
  onInputChange,
}: PollOptionProps) => {
  const { image, text } = option;

  return (
    <Card className="w-full rounded">
      <CardContent className="p-0 m-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            {image ? (
              <img
                src={image}
                alt="Preview"
                className="h-36 aspect-square object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-36 aspect-square">
                <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue">
                  <ImageIcon />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(e.target.files[0], index)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              maxLength={36}
              onChange={(e) => onInputChange(e.target.value, index)}
              value={text}
              placeholder="Enter option"
              className="focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div>{`${text.length}/36`}</div>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => onDelete(index)}
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
