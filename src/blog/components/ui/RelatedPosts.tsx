import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDateRelative } from '@/blog/lib/utils/formatDate';
import { truncate } from '@/blog/lib/utils/truncate';
import { useRelatedPosts } from '@/blog/hooks/useRelatedPosts';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedPostsProps {
  postId: string;
}

export default function RelatedPosts({ postId }: RelatedPostsProps) {
  const { posts, loading } = useRelatedPosts(postId);

  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Leia também</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Leia também</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                {post.reason && (
                  <Badge variant="secondary" className="w-fit mb-2">
                    {post.reason}
                  </Badge>
                )}
                <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {truncate(post.excerpt || '', 100)}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTimeMinutes} min
                  </span>
                  {post.publishedAt && (
                    <span>{formatDateRelative(post.publishedAt)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
