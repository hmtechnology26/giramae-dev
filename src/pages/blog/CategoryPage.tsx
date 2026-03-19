import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from '@/blog/hooks/usePosts';
import { useCategories } from '@/blog/hooks/useCategories';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import PostCard from '@/blog/components/ui/PostCard';
import Breadcrumbs from '@/blog/components/ui/Breadcrumbs';
import SEOHead from '@/components/seo/SEOHead';
import { Loader2 } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  
  const { categories, loading: categoriesLoading } = useCategories();
  const category = categories.find(c => c.slug === slug);
  
  const { posts, loading, hasMore } = usePosts(
    {
      status: 'published',
      categoryId: category?.id,
    },
    12
  );

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <>
        <SEOHead noindex />
        <BlogLayout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground">A categoria que você está procurando não existe.</p>
          </div>
        </BlogLayout>
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} | Blog GiraMãe`,
    "description": category.seoDescription || category.description || `Posts sobre ${category.name}`,
    "url": `https://giramae.com.br/blog/categoria/${category.slug}`,
    "isPartOf": {
      "@type": "Blog",
      "name": "Blog GiraMãe",
      "url": "https://giramae.com.br/blog"
    }
  };

  return (
    <>
      <SEOHead
        title={category.seoTitle || `${category.name} | Blog GiraMãe`}
        description={category.seoDescription || category.description || `Todos os posts sobre ${category.name} no Blog GiraMãe`}
        url={`https://giramae.com.br/blog/categoria/${category.slug}`}
        type="website"
        structuredData={structuredData}
      />
      
      <BlogLayout sidebar={<BlogSidebar />}>
        <Breadcrumbs items={[{ name: category.name }]} />
      {/* Header da Categoria */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      </BlogLayout>
    </>
  );
}
