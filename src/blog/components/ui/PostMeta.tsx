import { Clock, Eye, Calendar } from 'lucide-react';
import { formatDateRelative } from '@/blog/lib/utils/formatDate';
import { cn } from '@/lib/utils';

interface PostMetaProps {
  readingTimeMinutes: number;
  viewCount: number;
  date: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function PostMeta({ 
  readingTimeMinutes, 
  viewCount, 
  date,
  variant = 'default',
  className 
}: PostMetaProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div className={cn(
      'flex items-center gap-3 text-sm text-muted-foreground',
      isCompact && 'gap-2 text-xs',
      className
    )}>
      <span className="flex items-center gap-1">
        <Clock className={cn('h-3 w-3', isCompact && 'h-3 w-3')} />
        {readingTimeMinutes} min
      </span>
      
      <span className="flex items-center gap-1">
        <Eye className={cn('h-3 w-3', isCompact && 'h-3 w-3')} />
        {viewCount}
      </span>
      
      <span className="flex items-center gap-1">
        <Calendar className={cn('h-3 w-3', isCompact && 'h-3 w-3')} />
        {formatDateRelative(date)}
      </span>
    </div>
  );
}
