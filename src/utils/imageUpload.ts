import { supabase } from '@/integrations/supabase/client';
import { buildBlogImageUrl } from '@/lib/cdn';

/**
 * Faz upload de uma imagem para o Cloudflare R2 via Edge Function
 * @param file - Arquivo de imagem
 * @param bucket - Nome do bucket (padrão: 'blog-images')
 * @returns Path da imagem ou null em caso de erro (não URL completa)
 */
export async function uploadImage(
  file: File,
  bucket: string = 'blog-images'
): Promise<string | null> {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('🔄 Iniciando upload R2:', { bucket, fileName, fileSize: file.size });

    // 1. Pedir URL assinada para a Edge Function
    const { data: funcData, error: funcError } = await supabase.functions.invoke('storage-r2', {
      body: {
        action: 'upload',
        bucket,
        key: fileName,
        contentType: file.type
      }
    });

    if (funcError || !funcData?.uploadUrl) {
      console.error('❌ Erro ao obter URL de upload:', funcError);
      return null;
    }

    // 2. Fazer o upload via PUT na URL assinada
    const uploadResponse = await fetch(funcData.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      console.error('❌ Falha no upload para R2:', uploadResponse.status);
      return null;
    }

    // 3. Retornar apenas o path (não URL completa)
    // Quem consumir vai usar buildBlogImageUrl(path) para construir URL
    console.log('✅ Upload R2 realizado, path:', fileName);
    
    return fileName;
  } catch (error) {
    console.error('❌ Erro no upload R2:', error);
    return null;
  }
}

/**
 * Comprime uma imagem antes do upload
 * @param file - Arquivo de imagem
 * @param maxWidth - Largura máxima (padrão: 1200px)
 * @param quality - Qualidade de compressão (0-1, padrão: 0.8)
 * @returns Promise com o arquivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Erro ao comprimir imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Valida se o arquivo é uma imagem válida
 * @param file - Arquivo a ser validado
 * @param maxSizeMB - Tamanho máximo em MB (padrão: 5MB)
 * @returns true se válido, mensagem de erro caso contrário
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Use JPG, PNG, GIF ou WebP.',
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}
