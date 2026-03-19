import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Author } from '@/blog/types';
import { Link } from 'react-router-dom';

interface AuthorCardProps {
  author: Author;
  showBio?: boolean;
  linkable?: boolean;
}

export default function AuthorCard({ 
  author, 
  showBio = true,
  linkable = true 
}: AuthorCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.avatarUrl} alt={author.name} />
            <AvatarFallback>
              {author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{author.name}</h3>
            {showBio && author.bio && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (linkable) {
    return (
      <Link to={`/blog/autor/${author.slug}`}>
        {content}
      </Link>
    );
  }

  return content;
}
