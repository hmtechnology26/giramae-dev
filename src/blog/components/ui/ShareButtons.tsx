import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground mr-2">Compartilhar:</span>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => openShare('facebook')}
        title="Compartilhar no Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => openShare('twitter')}
        title="Compartilhar no Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => openShare('linkedin')}
        title="Compartilhar no LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => openShare('whatsapp')}
        title="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        title="Copiar link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
