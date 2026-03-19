
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Image, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/utils/imageCompression';
import { toast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/lazy-image';

interface ImageUploadEditorProps {
  imagensExistentes: string[];
  novasImagens: File[];
  onRemoverExistente: (url: string) => void;
  onAdicionarNovas: (files: File[]) => void;
  maxFiles?: number;
  maxSizeKB?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

const ImageUploadEditor: React.FC<ImageUploadEditorProps> = ({
  imagensExistentes = [],
  novasImagens = [],
  onRemoverExistente,
  onAdicionarNovas,
  maxFiles = 6,
  maxSizeKB = 5000,
  accept = "image/*",
  className,
  disabled = false
}) => {
  const [previewsNovas, setPreviewsNovas] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImagens = imagensExistentes.length + novasImagens.length;

  const generatePreviews = useCallback((files: File[]) => {
    previewsNovas.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewsNovas(newPreviews);
  }, [previewsNovas]);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxFiles - totalImagens;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    console.log('🔄 Processando', filesToProcess.length, 'arquivos...');

    const validFiles: File[] = [];
    
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: `${file.name} não é uma imagem válida`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > maxSizeKB * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxSizeKB}KB`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      console.log('📸 Comprimindo', validFiles.length, 'imagens...');
      
      const compressedFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            return await compressImage(file, {
              maxWidth: 1024,
              maxHeight: 1024,
              quality: 0.8,
              format: 'jpeg'
            });
          } catch (error) {
            console.error('Erro ao comprimir imagem:', error);
            return file;
          }
        })
      );

      const newFiles = [...novasImagens, ...compressedFiles];
      onAdicionarNovas(newFiles);
      generatePreviews(newFiles);

      toast({
        title: "Imagens adicionadas",
        description: `${compressedFiles.length} imagem(ns) adicionada(s)`,
      });
    } catch (error) {
      console.error('Erro no processamento das imagens:', error);
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar as imagens",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const removerNovaImagem = (indexToRemove: number) => {
    const newFiles = novasImagens.filter((_, index) => index !== indexToRemove);
    onAdicionarNovas(newFiles);
    
    const newPreviews = previewsNovas.filter((_, index) => index !== indexToRemove);
    URL.revokeObjectURL(previewsNovas[indexToRemove]);
    setPreviewsNovas(newPreviews);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  React.useEffect(() => {
    if (novasImagens.length > 0) {
      generatePreviews(novasImagens);
    }
  }, [novasImagens]);

  React.useEffect(() => {
    return () => {
      previewsNovas.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Imagens Existentes */}
      {imagensExistentes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Imagens Atuais</h4>
          <div className="grid grid-cols-3 gap-4">
            {imagensExistentes.map((url, index) => (
              <div key={`existing-${index}`} className="relative group">
                <LazyImage
                  src={url}
                  alt={`Imagem existente ${index + 1}`}
                  bucket="itens"
                  size="medium"
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemoverExistente(url)}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Novas Imagens */}
      {previewsNovas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Novas Imagens</h4>
          <div className="grid grid-cols-3 gap-4">
            {previewsNovas.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <img 
                  src={preview} 
                  alt={`Nova imagem ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-green-200"
                />
                <button
                  type="button"
                  onClick={() => removerNovaImagem(index)}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                  Nova
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {totalImagens < maxFiles && (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-gray-300 hover:border-gray-400",
            (disabled || isUploading) && "cursor-not-allowed opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <Upload className="w-10 h-10 text-primary animate-bounce" />
            ) : isDragOver ? (
              <Image className="w-10 h-10 text-primary" />
            ) : (
              <Camera className="w-10 h-10 text-gray-400" />
            )}
            
            <div className="space-y-1">
              <p className={cn(
                "font-medium",
                isDragOver ? "text-primary" : "text-gray-700"
              )}>
                {isUploading ? 'Processando imagens...' : 
                 isDragOver ? 'Solte as imagens aqui' : 
                 'Clique ou arraste fotos aqui'}
              </p>
              <p className="text-sm text-gray-500">
                {totalImagens}/{maxFiles} fotos • Max {maxSizeKB}KB cada
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP até {maxSizeKB}KB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadEditor;
