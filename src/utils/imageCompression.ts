
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
}

export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha na compressão da imagem'));
            return;
          }

          // Criar novo arquivo com nome original
          const compressedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });

          resolve(compressedFile);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

export const compressMultipleImages = async (
  files: File[],
  options?: CompressOptions
): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};
