import { useState } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { UploadCloud } from "lucide-react";

const DragDropInput = ({ label, accept, name, form }) => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.includes(accept.split("/")[0])) {
            updateFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.includes(accept.split("/")[0])) {
            updateFile(selectedFile);
        }
    };

    const updateFile = (newFile: File) => {
        setFile(newFile);
        setFilePreviewUrl(URL.createObjectURL(newFile));
        form.setValue(name, newFile);
    };

    const removeFile = () => {
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
                    <FormLabel htmlFor={name}>{label}</FormLabel>
                    <FormControl>
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-md p-3 cursor-pointer ${
                                dragging ? "border-blue-500" : "border-gray-300 dark:border-zinc-700"
                            }`}
                        >
                            {file ? (
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="relative">{accept.includes("image") &&
                                        filePreviewUrl && (
                                            <img
                                                src={filePreviewUrl}
                                                className="max-h-32 max-w-60 mx-auto"
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
                                    <button type="button" onClick={removeFile} className="text-red-500 font-bold text-2xl absolute top-0 right-2 z-50">
                                        X
                                    </button></div>
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
