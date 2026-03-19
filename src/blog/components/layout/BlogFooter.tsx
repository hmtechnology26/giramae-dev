import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MessageCircleHeart } from 'lucide-react';
import { blogConfig } from '@/blog/config/blogConfig';

export default function BlogFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="font-semibold mb-4">Sobre o Blog</h3>
            <p className="text-sm text-muted-foreground">
              {blogConfig.description}
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Todos os Posts
                </Link>
              </li>
              <li>
                <Link to="/blog/categorias" className="text-muted-foreground hover:text-primary transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  GiraMãe
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog/categoria/maternidade" className="text-muted-foreground hover:text-primary transition-colors">
                  Maternidade
                </Link>
              </li>
              <li>
                <Link to="/blog/categoria/economia" className="text-muted-foreground hover:text-primary transition-colors">
                  Economia
                </Link>
              </li>
              <li>
                <Link to="/blog/categoria/sustentabilidade" className="text-muted-foreground hover:text-primary transition-colors">
                  Sustentabilidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-semibold mb-4">Siga-nos</h3>
            <div className="flex gap-4">
              <a
                href={blogConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircleHeart className="h-5 w-5" />
              </a>
              <a
                href={blogConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              {/* <a
                href={blogConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a> */}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {blogConfig.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
