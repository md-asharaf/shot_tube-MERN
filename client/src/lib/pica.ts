import pica from "pica";

export const resizeImageWithPica = (
    file: File,
    targetWidth: number = 1280,
    targetHeight: number = 720
): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                pica()
                    .resize(img, canvas, {
                        unsharpAmount: 80,
                        unsharpRadius: 0.6,
                        unsharpThreshold: 2,
                    })
                    .then(() => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    const resizedFile = new File(
                                        [blob],
                                        file.name,
                                        {
                                            type: file.type,
                                            lastModified: Date.now(),
                                        }
                                    );
                                    resolve(resizedFile);
                                } else {
                                    resolve(file);
                                }
                            },
                            file.type,
                            0.9
                        );
                    })
                    .catch((err) => {
                        console.error(err);
                        resolve(file);
                    });
            };

            img.onerror = (error) => {
                console.error(error);
                resolve(file);
            };

            img.src = event.target.result as string;
        };

        reader.onerror = (error) => {
            console.error(error);
            resolve(file);
        };

        reader.readAsDataURL(file);
    });
};
