import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XIcon } from "lucide-react";
import { useEffect } from "react";

interface Data {
  text: string;
  options: Array<string>;
}

interface TextPollProps {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  reset: () => void;
}

interface PollOptionProps {
  index: number;
  option: string;
  onDelete: (index: number) => void;
  onInputChange: (value: string, index: number) => void;
}

export const TextPoll = ({ data, setData, reset }: TextPollProps) => {
  const handleAddOption = () => {
    setData((prev) => {
      const options = [...prev.options];
      options.push("");
      return { ...prev, options };
    });
  };
  const handleInputChange = (value: string, index: number) => {
    setData((prev) => {
      const options = [...prev.options];
      options[index] = value;
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
    if (options.length === 0) {
      reset();
    }
  }, [options]);
  if (options.length === 0) {
    return null;
  }
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
        Add another option
      </Button>
    </div>
  );
};

const PollOption = ({
  index,
  option,
  onDelete,
  onInputChange,
}: PollOptionProps) => {
  return (
    <div className="flex flex-col items-end w-full">
      <div className="flex items-center space-x-4 w-full">
        <Button
          onClick={() => onDelete(index)}
          variant="ghost"
          size="icon"
          className="rounded-full "
        >
          <XIcon />
        </Button>
        <input
          type="text"
          maxLength={65}
          onChange={(e) => onInputChange(e.target.value, index)}
          value={option}
          placeholder="Enter option"
          className="focus:outline-none bg-transparent flex-1 border-b-[1px]"
        />
      </div>
      <div>{`${option.length}/65`}</div>
    </div>
  );
};
