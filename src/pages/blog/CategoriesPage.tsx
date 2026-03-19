import { Link } from 'react-router-dom';
import { useCategories } from '@/blog/hooks/useCategories';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import Breadcrumbs from '@/blog/components/ui/Breadcrumbs';
import SEOHead from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderOpen } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Categorias | Blog GiraMãe",
    "description": "Explore todas as categorias do Blog GiraMãe",
    "url": "https://giramae.com.br/blog/categorias",
    "isPartOf": {
      "@type": "Blog",
      "name": "Blog GiraMãe",
      "url": "https://giramae.com.br/blog"
    }
  };

  return (
    <>
      <SEOHead
        title="Categorias | Blog GiraMãe"
        description="Explore todas as categorias do Blog GiraMãe e encontre conteúdo relevante sobre maternidade, trocas e economia circular."
        url="https://giramae.com.br/blog/categorias"
        type="website"
        structuredData={structuredData}
      />
      
      <BlogLayout sidebar={<BlogSidebar />}>
        <Breadcrumbs items={[{ name: 'Categorias' }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Categorias do Blog</h1>
          <p className="text-xl text-muted-foreground">
            Explore nossos conteúdos organizados por categoria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/blog/categoria/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </div>
                    {category.postCount !== undefined && (
                      <Badge variant="secondary">
                        {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
          </div>
        )}
      </BlogLayout>
    </>
  );
}
