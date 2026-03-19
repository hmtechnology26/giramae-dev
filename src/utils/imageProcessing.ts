/**
 * Processamento de imagens no cliente
 * Converte para WebP e gera múltiplas variações
 */

export interface ImageVariant {
  size: 'small' | 'medium' | 'large';
  width: number;
  quality: number;
  maxSizeKB: number;
}

const VARIANTS: ImageVariant[] = [
  { size: 'small', width: 400, quality: 0.8, maxSizeKB: 30 },
  { size: 'medium', width: 800, quality: 0.85, maxSizeKB: 70 },
  { size: 'large', width: 1200, quality: 0.85, maxSizeKB: 120 },
];

/**
 * Sanitiza nome de arquivo para SEO-friendly (kebab-case)
 */
export function sanitizeFileName(filename: string): string {
  return filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Converte e redimensiona imagem para WebP
 */
export async function processImageVariant(
  file: File,
  targetWidth: number,
  quality: number = 0.85
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      let width = Math.min(targetWidth, originalWidth);
      let height = Math.round((originalHeight * width) / originalWidth);

      // Criar canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Processa arquivo original em 3 variações WebP
 */
export async function processImageAllVariants(file: File): Promise<
  Array<{
    variant: ImageVariant;
    blob: Blob;
    width: number;
    height: number;
  }>
> {
  const results = [];

  for (const variant of VARIANTS) {
    console.log(`Processing ${variant.size}: ${variant.width}px at ${variant.quality * 100}% quality`);
    
    let result = await processImageVariant(file, variant.width, variant.quality);
    
    // Se exceder tamanho máximo, recomprimir
    const maxSizeBytes = variant.maxSizeKB * 1024;
    if (result.blob.size > maxSizeBytes) {
      console.log(`${variant.size} exceeded max size (${(result.blob.size / 1024).toFixed(1)}KB > ${variant.maxSizeKB}KB), recompressing...`);
      result = await processImageVariant(file, variant.width, variant.quality - 0.1);
    }

    console.log(`${variant.size} processed: ${(result.blob.size / 1024).toFixed(1)}KB`);

    results.push({
      variant,
      ...result,
    });
  }

  return results;
}
