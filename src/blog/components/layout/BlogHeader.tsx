import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Tag } from 'lucide-react';

export default function BlogHeader() {
  return (
    <header className="border-b bg-card fixed top-0 z-50 shadow-sm w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/giramae_logo.png" 
              alt="GiraMãe" 
              className="h-12 transition-transform"
            />
            <div className="flex flex-col">
              
              
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary ">
              <Home className="h-4 w-4 inline mr-1" />
              Início
            </Link>
            <Link to="/blog" className="text-sm hover:text-primary transition-colors">
              Todos os Posts
            </Link>
            <Link to="/blog/categorias" className="text-sm hover:text-primary transition-colors">
              <Tag className="h-4 w-4 inline mr-1" />
              Categorias
            </Link>
          </nav>

          
        </div>
      </div>
    </header>
  );
}
