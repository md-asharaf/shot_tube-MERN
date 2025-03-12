import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { TrashIcon } from "lucide-react";
import { useEffect } from "react";

interface Data {
  text: string;
  correct: number;
  explanation: string;
  options: Array<string>;
}

interface QuizProps {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  reset: () => void;
}

interface QuizOptionProps {
  index: number;
  option: string;
  explanation: string;
  onExplanationChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  onCheckboxChange: (index: number, value: boolean) => void;
  onInputChange: (value: string, index: number) => void;
  isCorrect: boolean;
}

export const Quiz = ({ data, setData, reset }: QuizProps) => {
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
  const handleToggleCorrect = (index: number, value: boolean) => {
    setData((prev) => {
      return { ...prev, correct: value ? index : -1 };
    });
  };
  const deleteOption = (index: number) => {
    setData((prev) => {
      const options = [...prev.options];
      options.splice(index, 1);
      return { ...prev, options };
    });
  };
  const handleExplanationChange = (index: number, value: string) => {
    setData((prev) => ({ ...prev, explanation: value }));
  };
  const { options, explanation, correct } = data;
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
          placeholder="Quiz your community..."
          value={data.text}
          onChange={(e) =>
            setData((prev) => ({ ...prev, text: e.target.value }))
          }
        />
        {options.map((option, index) => (
          <QuizOption
            key={index}
            explanation={explanation}
            index={index}
            option={option}
            onExplanationChange={handleExplanationChange}
            onDelete={deleteOption}
            onCheckboxChange={handleToggleCorrect}
            onInputChange={handleInputChange}
            isCorrect={correct === index}
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
        Add answer
      </Button>
    </div>
  );
};

const QuizOption = ({
  index,
  option,
  explanation,
  onExplanationChange,
  onDelete,
  onInputChange,
  onCheckboxChange,
  isCorrect,
}: QuizOptionProps) => {
  return (
    <Card className="w-full rounded-xl">
      <CardContent className="m-0 p-0 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isCorrect}
              onCheckedChange={(checked) =>
                onCheckboxChange(index, checked as boolean)
              }
            />
            <input
              type="text"
              maxLength={80}
              onChange={(e) => onInputChange(e.target.value, index)}
              value={option}
              placeholder={`Answer ${index + 1}`}
              className="focus:outline-none bg-transparent placeholder:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm">{`${option.length}/80`}</div>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => onDelete(index)}
            >
              <TrashIcon />
            </Button>
          </div>
        </div>
        {isCorrect && (
          <div className="relative">
            <Textarea
              value={explanation}
              className="resize-none"
              placeholder="Explain why this is correct (optional)"
              onChange={(e) => onExplanationChange(index, e.target.value)}
            />
            <div className="absolute right-0 bottom-2 text-sm">{`${explanation.length}/500`}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
