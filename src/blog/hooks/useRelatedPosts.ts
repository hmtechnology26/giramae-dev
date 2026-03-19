import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number;
  reason: string | null;
}

interface UseRelatedPostsReturn {
  posts: RelatedPost[];
  loading: boolean;
  error: Error | null;
}

export function useRelatedPosts(postId?: string): UseRelatedPostsReturn {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      setPosts([]);
      return;
    }

    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc('blog_get_related_posts', {
          p_post_id: postId
        });

        if (rpcError) throw rpcError;

        const mapped: RelatedPost[] = (data || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featuredImage: post.featured_image,
          featuredImageAlt: post.featured_image_alt,
          publishedAt: post.published_at,
          readingTimeMinutes: post.reading_time_minutes || 5,
          reason: post.reason
        }));

        setPosts(mapped);
      } catch (err) {
        console.error('Erro ao buscar posts relacionados:', err);
        setError(err instanceof Error ? err : new Error('Falha ao buscar posts relacionados'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [postId]);

  return { posts, loading, error };
}
