import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Laugh } from "lucide-react";
import AvatarImg from "./AvatarImg";

interface TextAreaProps {
    userAvatar: string;
    fullname: string;
    initialValue?: string;
    placeholder?: string;
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    submitLabel: string;
}

const TextArea: React.FC<TextAreaProps> = ({
    userAvatar,
    fullname,
    initialValue = "",
    placeholder = "",
    onSubmit,
    onCancel,
    submitLabel,
}) => {
    const [content, setContent] = useState(initialValue);
    const [isInputFocused, setIsInputFocused] = useState(
        !(submitLabel === "Comment")
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const theme = useSelector((state: RootState) => state.theme.mode);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [content]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prevContent) => prevContent + emojiData.emoji);
    };

    const handleSubmit = () => {
        onSubmit(content.trim());
        setContent("");
        setIsInputFocused(false);
    };

    const handleCancel = () => {
        setContent("");
        setIsInputFocused(false);
        if (onCancel) onCancel();
    };

    return (
        <div className="flex gap-y-1 flex-col justify-start">
            <div className="flex items-center gap-2">
                <div
                    className={`${
                        submitLabel == "Comment" ? "h-10 min-w-10" : "h-8 min-w-8"
                    }`}
                >
                    <AvatarImg fullname={fullname} avatar={userAvatar} />
                </div>
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="outline-none shadow-none w-full bg-transparent resize-none overflow-hidden border-b border-gray-500 focus:border-gray-400 transition-all"
                    rows={1}
                    style={{ lineHeight: "1.2", padding: "0.3rem" }}
                    onFocus={() => setIsInputFocused(true)}
                    maxLength={500}
                />
            </div>
            {(isInputFocused || content) && (
                <div className="ml-12 flex space-x-2 justify-between items-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="rounded-full h-7 sm:h-9 p-2"
                            >
                                <Laugh />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            collisionPadding={100}
                            className="p-0 overflow-y-auto"
                            side="bottom"
                        >
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme={
                                    theme == "dark" ? Theme.DARK : Theme.LIGHT
                                }
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex space-x-2 items-center">
                        <Button
                            onClick={handleCancel}
                            variant="ghost"
                            className="h-7 sm:h-9 rounded-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!content}
                            onClick={handleSubmit}
                            variant="outline"
                            className="bg-blue-500 hover:bg-blue-400 h-7 sm:h-9 p-1 sm:p-3 rounded-full"
                        >
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TextArea;
