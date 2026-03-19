import { useParams, Link } from 'react-router-dom';
import { usePost } from '@/blog/hooks/usePost';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import CategoryBadge from '@/blog/components/ui/CategoryBadge';
import TagList from '@/blog/components/ui/TagList';
import PostMeta from '@/blog/components/ui/PostMeta';
import AuthorCard from '@/blog/components/ui/AuthorCard';
import RelatedPosts from '@/blog/components/ui/RelatedPosts';
import ShareButtons from '@/blog/components/ui/ShareButtons';
import TableOfContents from '@/blog/components/ui/TableOfContents';
import MarkdownRenderer from '@/blog/components/ui/MarkdownRenderer';
import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/blog/components/ui/Breadcrumbs';
import { useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePost(slug || '');
  const [startTime] = useState(Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);

  // ✅ ANALYTICS: Visualização do post
  useEffect(() => {
    if (post) {
      analytics.blog.viewPost(post.id, post.title, post.category?.name || 'sem-categoria');
    }
  }, [post]);

  // ✅ ANALYTICS: Rastreamento de scroll
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const depth = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      setScrollDepth(Math.max(scrollDepth, depth));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepth]);

  // ✅ ANALYTICS: Engagement ao sair
  useEffect(() => {
    return () => {
      if (post) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        analytics.blog.engagement(post.id, timeSpent, scrollDepth);
      }
    };
  }, [post, startTime, scrollDepth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <SEOHead noindex />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>
      </>
    );
  }

  // Structured Data para BlogPosting (Google Best Practices)
  const imageUrl = post.featuredImage || post.ogImage || 'https://giramae.com.br/og-blog.jpg';
  
  const structuredData = [
    // BlogPosting Schema
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      },
      "datePublished": post.publishedAt || post.createdAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": post.author?.name || 'Equipe GiraMãe',
        "url": post.author ? `https://giramae.com.br/blog/autor/${post.author.slug}` : 'https://giramae.com.br/sobre'
      },
      "publisher": {
        "@type": "Organization",
        "name": "GiraMãe",
        "url": "https://giramae.com.br",
        "logo": {
          "@type": "ImageObject",
          "url": "https://giramae.com.br/logo.png",
          "width": 600,
          "height": 60
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://giramae.com.br/blog/${post.slug}`
      },
      "inLanguage": "pt-BR",
      "wordCount": post.content.split(/\s+/).length,
      "keywords": post.tags?.map(t => t.name).join(', ') || post.seoKeywords?.join(', '),
      ...(post.category && {
        "articleSection": post.category.name
      })
    },
    // BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://giramae.com.br"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://giramae.com.br/blog"
        },
        ...(post.category ? [{
          "@type": "ListItem",
          "position": 3,
          "name": post.category.name,
          "item": `https://giramae.com.br/blog/categoria/${post.category.slug}`
        }] : []),
        {
          "@type": "ListItem",
          "position": post.category ? 4 : 3,
          "name": post.title,
          "item": `https://giramae.com.br/blog/${post.slug}`
        }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        keywords={post.seoKeywords?.join(', ')}
        image={imageUrl}
        url={`https://giramae.com.br/blog/${post.slug}`}
        type="article"
        structuredData={structuredData}
        publishedDate={post.publishedAt || post.createdAt}
        modifiedDate={post.updatedAt}
        authorName={post.author?.name || 'Equipe GiraMãe'}
        category={post.category?.name}
        tags={post.tags?.map(t => t.name)}
      />
      
      <BlogLayout sidebar={<TableOfContents content={post.content} />}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          ...(post.category ? [{
            name: post.category.name,
            url: `/blog/categoria/${post.category.slug}`
          }] : []),
          { name: post.title }
        ]} />
        
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>

      {/* Content Container */}
      <article className="space-y-8">
        {/* Category Badge */}
        {post.category && (
          <CategoryBadge category={post.category} />
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-muted-foreground">{post.excerpt}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 pb-8 border-b">
          {post.author && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}
          <PostMeta 
            readingTimeMinutes={post.readingTimeMinutes}
            viewCount={post.viewCount}
            date={post.publishedAt || post.createdAt}
          />
        </div>

        {/* Content */}
        <Card className="p-8">
          <MarkdownRenderer content={post.content} />
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Tags:</h3>
            <TagList tags={post.tags} />
          </div>
        )}

        {/* Share Buttons */}
        <ShareButtons 
          title={post.title}
          url={`${window.location.origin}/blog/${post.slug}`}
          description={post.excerpt}
        />

        {/* Author Card */}
        {post.author && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre o Autor</h3>
            <AuthorCard author={post.author} />
          </div>
        )}

        {/* Related Posts */}
        <RelatedPosts postId={post.id} />
      </article>
    </BlogLayout>
    </>
  );
}
