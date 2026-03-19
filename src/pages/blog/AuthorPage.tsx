import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from '@/blog/hooks/usePosts';
import { getBlogRepository } from '@/blog/lib/data';
import { Author } from '@/blog/types';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import PostCard from '@/blog/components/ui/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const { posts, loading: postsLoading, hasMore } = usePosts(
    {
      status: 'published',
      authorId: author?.id,
    },
    12
  );

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const repository = getBlogRepository();
        const result = await repository.getAuthorBySlug(slug!);
        setAuthor(result);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!author) {
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Autor não encontrado</h1>
          <p className="text-muted-foreground">O autor que você está procurando não existe.</p>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout sidebar={<BlogSidebar />}>
      {/* Perfil do Autor */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={author.avatarUrl} alt={author.name} />
              <AvatarFallback>{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
              {author.bio && (
                <p className="text-muted-foreground mb-4">{author.bio}</p>
              )}
              
              <div className="flex gap-4 text-sm">
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts do Autor */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Posts de {author.name}
        </h2>
        <p className="text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''} publicado{posts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </BlogLayout>
  );
}
