import { useState, useEffect } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { UploadCloud, Info } from "lucide-react"; 

interface DragDropInputProps {
    label: string;
    accept: string;
    name: string;
    form: any; 
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; 

const DragDropInput: React.FC<DragDropInputProps> = ({
    label,
    accept,
    name,
    form,
}) => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile: File | undefined) => {
        if (!selectedFile) return;

        if (!selectedFile.type.includes(accept.split("/")[0])) {
            form.setError(name, {
                type: "manual",
                message: "Invalid file type",
            });
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            form.setError(name, {
                type: "manual",
                message: "File size exceeds the 500 MB limit",
            });
            return;
        }

        updateFile(selectedFile);
    };

    const updateFile = (newFile: File) => {
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
        }
        setFile(newFile);
        setFilePreviewUrl(URL.createObjectURL(newFile));
        form.setValue(name, newFile);
        form.clearErrors(name);
    };

    const removeFile = () => {
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
        }
        setFile(null);
        setFilePreviewUrl(null);
        form.setValue(name, null);
    };

    return (
        <FormField
            control={form.control}
            name={name}
            render={() => (
                <FormItem>
                    <div className="flex items-center space-x-2">
                        <FormLabel htmlFor={name}>{label}</FormLabel>
                        {label == "Video:" && (
                            <div className="relative group">
                                <Info className="w-4 h-4 text-gray-500 cursor-pointer" />
                                <div className="absolute left-6 top-0 bg-black text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 w-40">
                                    Video size should be less than or equal to
                                    500 MB.
                                </div>
                            </div>
                        )}
                    </div>
                    <FormControl>
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-md p-3 cursor-pointer ${
                                dragging
                                    ? "border-blue-500"
                                    : "border-gray-300 dark:border-zinc-700"
                            }`}
                            role="button"
                            aria-label={`Drop your ${label.toLowerCase()} here`}
                        >
                            {file ? (
                                <div className="relative">
                                    {accept.includes("image") &&
                                        filePreviewUrl && (
                                            <img
                                                src={filePreviewUrl}
                                                className="max-h-32 max-w-60 mx-auto"
                                                alt="Preview"
                                            />
                                        )}
                                    {accept.includes("video") &&
                                        filePreviewUrl && (
                                            <video
                                                controls
                                                className="max-h-32 max-w-60 mx-auto"
                                            >
                                                <source
                                                    src={filePreviewUrl}
                                                    type={file.type}
                                                />
                                            </video>
                                        )}
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="text-red-500 font-bold text-2xl absolute top-0 right-2 z-50"
                                        aria-label="Remove file"
                                    >
                                        X
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <UploadCloud />
                                    <div>
                                        Drag and drop here or{" "}
                                        <span className="relative font-semibold hover:underline text-blue-600">
                                            browse
                                            <Input
                                                type="file"
                                                accept={accept}
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 h-6 cursor-pointer"
                                            />
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default DragDropInput;
