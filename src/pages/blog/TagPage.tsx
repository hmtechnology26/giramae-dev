import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from '@/blog/hooks/usePosts';
import { useTags } from '@/blog/hooks/useTags';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import PostCard from '@/blog/components/ui/PostCard';
import Breadcrumbs from '@/blog/components/ui/Breadcrumbs';
import SEOHead from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  
  const { tags, loading: tagsLoading } = useTags();
  const tag = tags.find(t => t.slug === slug);
  
  const { posts, loading, hasMore } = usePosts(
    {
      status: 'published',
      tags: tag ? [tag.id] : [],
    },
    12
  );

  if (tagsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tag) {
    return (
      <>
        <SEOHead noindex />
        <BlogLayout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Tag não encontrada</h1>
            <p className="text-muted-foreground">A tag que você está procurando não existe.</p>
          </div>
        </BlogLayout>
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Tag: ${tag.name} | Blog GiraMãe`,
    "description": `Posts marcados com ${tag.name} no Blog GiraMãe`,
    "url": `https://giramae.com.br/blog/tag/${tag.slug}`,
    "isPartOf": {
      "@type": "Blog",
      "name": "Blog GiraMãe",
      "url": "https://giramae.com.br/blog"
    }
  };

  return (
    <>
      <SEOHead
        title={`Tag: ${tag.name} | Blog GiraMãe`}
        description={`Todos os posts com a tag ${tag.name} no Blog GiraMãe`}
        url={`https://giramae.com.br/blog/tag/${tag.slug}`}
        type="website"
        structuredData={structuredData}
      />
      
      <BlogLayout sidebar={<BlogSidebar />}>
        <Breadcrumbs items={[{ name: `Tag: ${tag.name}` }]} />
      {/* Header da Tag */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Posts com a tag</h1>
          <Badge className="text-xl px-4 py-2">{tag.name}</Badge>
        </div>
        <p className="text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''} encontrado{posts.length !== 1 ? 's' : ''}
        </p>
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
