import { ReactNode } from 'react';
import BlogHeader from './BlogHeader';
import BlogFooter from './BlogFooter';

interface BlogLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function BlogLayout({ children, sidebar }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BlogHeader />
      
      <main className="flex-1">
        {sidebar ? (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div>{children}</div>
              <aside className="hidden lg:block">{sidebar}</aside>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
