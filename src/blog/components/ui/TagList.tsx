import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tag } from '@/blog/types';
import { cn } from '@/lib/utils';

interface TagListProps {
  tags: Tag[];
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  linkable?: boolean;
  className?: string;
}

export default function TagList({ 
  tags, 
  variant = 'outline', 
  linkable = true,
  className 
}: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => {
        const badge = (
          <Badge 
            key={tag.id} 
            variant={variant}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {tag.name}
          </Badge>
        );

        if (linkable) {
          return (
            <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
              {badge}
            </Link>
          );
        }

        return badge;
      })}
    </div>
  );
}
