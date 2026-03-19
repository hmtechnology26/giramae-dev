import { Post } from '@/blog/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { formatDateRelative } from '@/blog/lib/utils/formatDate';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  if (variant === 'compact') {
    return (
      <Link to={`/blog/${post.slug}`} className="group">
        <div className="flex gap-4 items-start hover:bg-muted/50 p-3 rounded-lg transition-colors">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <Link to={`/blog/${post.slug}`}>
        <CardHeader>
          {post.category && (
            <Badge className="mb-2 w-fit">{post.category.name}</Badge>
          )}
          <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.viewCount}
            </span>
          </div>
          <span>{formatDateRelative(post.publishedAt || post.createdAt)}</span>
        </CardFooter>
      </Link>
    </Card>
  );
}
