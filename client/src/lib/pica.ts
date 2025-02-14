import pica from "pica";

export const resizeImage = async (file: File, width: number, height: number): Promise<File> => {
    try {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
    
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
    
        const picaInstance = pica();
        const resizedBlob = await picaInstance.resize(img, canvas).then((result) =>
            picaInstance.toBlob(result, "image/jpeg", 0.9)
        );

        // Convert Blob to File
        const resizedFile = new File([resizedBlob], file.name, { type: "image/jpeg", lastModified: Date.now() });

        return resizedFile;
    } catch (error) {
        console.error("Error resizing image", error.message);
        return file;
    }
};
