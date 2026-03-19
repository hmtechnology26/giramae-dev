import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateImage } from '@/utils/imageUpload';
import { generateOptimizedImageMarkdown, OptimizedImageData, sanitizeFileName } from '@/utils/optimizedImage';
import { processImageAllVariants } from '@/utils/imageProcessing';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageInsert: (markdown: string) => void;
  onClose: () => void;
  postSlug?: string;
}

export default function ImageUploader({ onImageInsert, onClose, postSlug = 'draft' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadedData, setUploadedData] = useState<OptimizedImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validar arquivo
    const validation = validateImage(file);
    if (!validation.valid) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: validation.error,
      });
      return;
    }

    try {
      setUploading(true);

      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Auto-preencher com nome do arquivo se alt estiver vazio
      if (!altText) {
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setAltText(baseName);
      }

      toast({
        title: '🔄 Processando imagem...',
        description: 'Convertendo para WebP e gerando 3 variações',
      });

      // Processar imagem no cliente (3 variações WebP)
      const variants = await processImageAllVariants(file);

      // Obter dimensões originais
      const originalDimensions = variants.find(v => v.variant.size === 'large');
      if (!originalDimensions) throw new Error('Failed to get dimensions');

      // Sanitizar nome
      const baseName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ''));

      // Preparar FormData com as 3 variações
      const formData = new FormData();
      formData.append('postSlug', postSlug);
      formData.append('baseName', baseName);
      formData.append('alt', altText || baseName);
      formData.append('originalWidth', originalDimensions.width.toString());
      formData.append('originalHeight', originalDimensions.height.toString());

      for (const variant of variants) {
        formData.append(variant.variant.size, variant.blob, `${baseName}-${variant.variant.size}.webp`);
      }

      toast({
        title: '📤 Enviando para servidor...',
        description: 'Fazendo upload das 3 variações',
      });

      // Chamar edge function para upload
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/blog-image-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const data: OptimizedImageData = await response.json();
      setUploadedData(data);

      toast({
        title: '✅ Upload concluído!',
        description: 'Imagem otimizada em 3 variações (small, medium, large)',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      setPreview(null);
      setUploadedData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInsertFromUpload = () => {
    if (!uploadedData) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Upload ainda não concluído',
      });
      return;
    }
    
    if (!altText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Alt text obrigatório',
        description: 'Descrição da imagem é obrigatória para SEO e acessibilidade',
      });
      return;
    }
    
    // Validar alt text descritivo (não genérico)
    const genericTerms = ['imagem', 'foto', 'image', 'picture', 'img', 'figura'];
    const isGeneric = genericTerms.some(term => 
      altText.toLowerCase().trim() === term
    );
    
    if (isGeneric) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito genérica',
        description: 'Use uma descrição específica (ex: "Mãe organizando roupas infantis")',
      });
      return;
    }
    
    // Validar comprimento mínimo
    if (altText.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito curta',
        description: 'Use pelo menos 10 caracteres para descrever a imagem',
      });
      return;
    }

    // Atualizar alt no uploadedData
    const finalData = { ...uploadedData, alt: altText };
    
    // Gerar markdown otimizado
    const markdown = generateOptimizedImageMarkdown(finalData);
    onImageInsert(markdown);
    onClose();
  };

  const handleInsertFromUrl = () => {
    if (!urlInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'URL da imagem não pode estar vazia',
      });
      return;
    }
    
    if (!altText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Alt text obrigatório',
        description: 'Descrição da imagem é obrigatória para SEO e acessibilidade',
      });
      return;
    }
    
    // Validar alt text descritivo (não genérico)
    const genericTerms = ['imagem', 'foto', 'image', 'picture', 'img', 'figura'];
    const isGeneric = genericTerms.some(term => 
      altText.toLowerCase().trim() === term
    );
    
    if (isGeneric) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito genérica',
        description: 'Use uma descrição específica (ex: "Mãe organizando roupas infantis")',
      });
      return;
    }
    
    // Validar comprimento mínimo
    if (altText.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito curta',
        description: 'Use pelo menos 10 caracteres para descrever a imagem',
      });
      return;
    }
    
    // Para URLs externas, gerar markdown simples
    const markdown = `![${altText}](${urlInput})`;
    onImageInsert(markdown);
    onClose();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </div>
            ) : preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF ou WebP (máx. 5MB)
                </p>
              </div>
            )}
          </div>

          {preview && (
            <>
              <div>
                <Label htmlFor="alt-upload">
                  Texto alternativo (alt) *
                </Label>
                <Input
                  id="alt-upload"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descrição detalhada da imagem (min. 10 caracteres)"
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descreva o conteúdo da imagem para acessibilidade e SEO.
                  Evite termos genéricos como "imagem" ou "foto".
                </p>
              </div>
              <Button
                onClick={handleInsertFromUpload}
                disabled={!uploadedData || !altText || altText.length < 10 || uploading}
                className="w-full"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Inserir Imagem Otimizada
              </Button>
              {uploadedData && (
                <p className="text-xs text-muted-foreground text-center">
                  ✅ 3 variações geradas: small (400px), medium (800px), large (1200px)
                </p>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div>
            <Label htmlFor="image-url">URL da Imagem</Label>
            <Input
              id="image-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          {urlInput && (
            <div className="border rounded-lg p-4">
              <img
                src={urlInput}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <Label htmlFor="alt-url">Texto alternativo (alt) *</Label>
            <Input
              id="alt-url"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descrição detalhada da imagem (min. 10 caracteres)"
              minLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descreva o conteúdo da imagem para acessibilidade e SEO.
              Evite termos genéricos como "imagem" ou "foto".
            </p>
          </div>

          <Button
            onClick={handleInsertFromUrl}
            disabled={!urlInput || !altText || altText.length < 10}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Inserir Imagem
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
