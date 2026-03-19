import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Category } from '@/blog/types';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Category;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  linkable?: boolean;
  className?: string;
}

export default function CategoryBadge({ 
  category, 
  variant = 'default', 
  linkable = true,
  className 
}: CategoryBadgeProps) {
  const badge = (
    <Badge 
      variant={variant} 
      className={cn('w-fit', className)}
    >
      {category.name}
    </Badge>
  );

  if (linkable) {
    return (
      <Link to={`/blog/categoria/${category.slug}`} className="inline-block">
        {badge}
      </Link>
    );
  }

  return badge;
}
