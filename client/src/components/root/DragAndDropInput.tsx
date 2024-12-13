import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CloudUpload } from "lucide-react";

const DragDropInput = ({ label, accept, name, form }) => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    // Handle drag events
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
                            className={`relative border-2 border-dashed rounded-md p-3 cursor-pointer ${
                                dragging ? "border-blue-500" : "border-gray-300"
                            }`}
                        >
                            {file ? (
                                <div className="flex items-center justify-center space-x-4">
                                    {/* Preview */}
                                    <div className="flex-shrink-0">
                                        {accept.includes("image") && filePreviewUrl && (
                                            <img
                                                src={filePreviewUrl}
                                                alt="Preview"
                                                className="max-h-32 max-w-60 mx-auto"
                                            />
                                        )}
                                        {accept.includes("video") && filePreviewUrl && (
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
                                    </div>
                                    {/* Remove File button */}
                                    <div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={removeFile}
                                            className="bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 focus:outline-none"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                    <div className="text-4xl flex justify-center text-center"><CloudUpload /></div>
                            )}
                            <Input
                                type="file"
                                accept={accept}
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default DragDropInput;
