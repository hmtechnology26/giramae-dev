import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractHeadings } from '@/blog/lib/utils/markdown';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Array<{ level: number; text: string; id: string }>>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Neste artigo</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {headings.map(({ level, text, id }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'block text-sm py-1 transition-colors hover:text-primary',
                level === 2 && 'pl-0',
                level === 3 && 'pl-4',
                level >= 4 && 'pl-8',
                activeId === id ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {text}
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
