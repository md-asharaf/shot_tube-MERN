import pica from 'pica';

export const resizeImageWithPica = (file:File, targetWidth:number = 1280, targetHeight:number = 720):Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        pica()
          .resize(img, canvas)
          .then(() => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const resizedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                } else {
                  reject(new Error('Failed to create Blob'));
                }
              },
              file.type,
              0.9
            );
          })
          .catch((err) => reject(err));
      };

      img.onerror = (error) => reject(error);

      img.src = event.target.result as string;
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
};
