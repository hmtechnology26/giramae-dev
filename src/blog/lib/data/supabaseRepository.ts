// Supabase Blog Repository - Usa funções wrapper blog_*
import { BlogRepository, Post, Category, Author, Tag, PostFilters, PaginationOptions } from '@/blog/types';
import { supabase } from '@/integrations/supabase/client';

export class SupabaseBlogRepository implements BlogRepository {
  
  // ==================== POSTS ====================
  
  async getPosts(filters?: PostFilters, pagination?: PaginationOptions): Promise<Post[]> {
    try {
      const { data, error } = await supabase.rpc('blog_get_posts', {
        p_status: filters?.status || null,
        p_category_id: filters?.categoryId || null,
        p_author_id: filters?.authorId || null,
        p_search: filters?.search || null,
        p_tag_ids: filters?.tags || null,
        p_page: pagination?.page || 1,
        p_page_size: pagination?.pageSize || 10
      });

      if (error) throw error;
      
      // Buscar autor, categoria e tags para cada post
      const postsWithRelations = await Promise.all(
        (data || []).map(async (post: any) => {
          const [author, category, tags] = await Promise.all([
            post.author_id ? this.getAuthorById(post.author_id) : Promise.resolve(null),
            post.category_id ? this.getCategoryById(post.category_id) : Promise.resolve(null),
            this.getPostTags(post.id)
          ]);
          
          return this.mapToPost(post, author, category, tags);
        })
      );
      
      return postsWithRelations;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await this.getPosts({}, { page: 1, pageSize: 100 });
      return posts.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar post por ID:', error);
      return null;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const { data, error } = await supabase.rpc('blog_get_post_by_slug', {
        p_slug: slug
      }) as { data: any[], error: any };

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const post = data[0];
      
      const [author, category, tags] = await Promise.all([
        post.author_id ? this.getAuthorById(post.author_id) : Promise.resolve(null),
        post.category_id ? this.getCategoryById(post.category_id) : Promise.resolve(null),
        this.getPostTags(post.id)
      ]);
      
      return this.mapToPost(post, author, category, tags);
    } catch (error) {
      console.error('Erro ao buscar post por slug:', error);
      return null;
    }
  }

  async createPost(postData: Partial<Post>): Promise<Post> {
    try {
      const { data, error } = await supabase.rpc('blog_create_post', {
        p_title: postData.title!,
        p_slug: postData.slug!,
        p_excerpt: postData.excerpt!,
        p_content: postData.content!,
        p_status: postData.status || 'draft',
        p_author_id: postData.authorId || null,
        p_category_id: postData.categoryId || null,
        p_seo_title: postData.seoTitle || null,
        p_seo_description: postData.seoDescription || null,
        p_featured_image: postData.featuredImage || null
      }) as { data: any[], error: any };

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Nenhum post criado');
      
      const post = data[0];
      const [author, category] = await Promise.all([
        post.author_id ? this.getAuthorById(post.author_id) : Promise.resolve(null),
        post.category_id ? this.getCategoryById(post.category_id) : Promise.resolve(null)
      ]);
      
      return this.mapToPost(post, author, category, []);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  }

  async updatePost(postData: Partial<Post> & { id: string }): Promise<Post> {
    try {
      const { data, error } = await supabase.rpc('blog_update_post', {
        p_id: postData.id,
        p_title: postData.title || null,
        p_slug: postData.slug || null,
        p_excerpt: postData.excerpt || null,
        p_content: postData.content || null,
        p_status: postData.status || null,
        p_category_id: postData.categoryId || null,
        p_seo_title: postData.seoTitle || null,
        p_seo_description: postData.seoDescription || null,
        p_featured_image: postData.featuredImage || null
      }) as { data: any[], error: any };

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Post não encontrado');
      
      const post = data[0];
      const [author, category, tags] = await Promise.all([
        post.author_id ? this.getAuthorById(post.author_id) : Promise.resolve(null),
        post.category_id ? this.getCategoryById(post.category_id) : Promise.resolve(null),
        this.getPostTags(post.id)
      ]);
      
      return this.mapToPost(post, author, category, tags);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    throw new Error('Deleção de posts via interface admin não implementada ainda. Use SQL direto.');
  }

  async incrementViewCount(id: string): Promise<void> {
    try {
      await supabase.rpc('blog_increment_view_count', { p_post_id: id });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }

  // ==================== CATEGORIES ====================
  
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.rpc('blog_get_categories') as { data: any[], error: any };
      
      if (error) throw error;
      
      return (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        seoTitle: cat.seo_title,
        seoDescription: cat.seo_description,
        postCount: cat.post_count
      }));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase.rpc('blog_get_category_by_slug', {
        p_slug: slug
      }) as { data: any[], error: any };

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const cat = data[0];
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        seoTitle: cat.seo_title,
        seoDescription: cat.seo_description
      };
    } catch (error) {
      console.error('Erro ao buscar categoria por slug:', error);
      return null;
    }
  }

  private async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories();
      return categories.find(c => c.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  // ==================== AUTHORS ====================
  
  async getAuthors(): Promise<Author[]> {
    try {
      const { data, error } = await supabase.rpc('blog_get_authors') as { data: any[], error: any };
      
      if (error) throw error;
      
      return (data || []).map((author: any) => ({
        id: author.id,
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        avatarUrl: author.avatar_url,
        email: author.email
      }));
    } catch (error) {
      console.error('Erro ao buscar autores:', error);
      return [];
    }
  }

  async getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
      const { data, error } = await supabase.rpc('blog_get_author_by_slug', {
        p_slug: slug
      }) as { data: any[], error: any };

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const author = data[0];
      return {
        id: author.id,
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        avatarUrl: author.avatar_url,
        email: author.email
      };
    } catch (error) {
      console.error('Erro ao buscar autor por slug:', error);
      return null;
    }
  }

  private async getAuthorById(id: string): Promise<Author | null> {
    try {
      const authors = await this.getAuthors();
      return authors.find(a => a.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  // ==================== TAGS ====================
  
  async getTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase.rpc('blog_get_tags');
      
      if (error) throw error;
      
      return (data || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        postCount: tag.post_count
      }));
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      const { data, error } = await supabase.rpc('blog_get_tag_by_slug', {
        p_slug: slug
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const tag = data[0];
      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      };
    } catch (error) {
      console.error('Erro ao buscar tag por slug:', error);
      return null;
    }
  }
  
  private async getPostTags(postId: string): Promise<Tag[]> {
    try {
      const { data, error } = await supabase.rpc('blog_get_post_tags', {
        p_post_id: postId
      }) as { data: any[], error: any };

      if (error) throw error;
      
      return (data || []).map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      }));
    } catch (error) {
      console.error('Erro ao buscar tags do post:', error);
      return [];
    }
  }

  // ==================== HELPERS ====================
  
  private mapToPost(
    data: any,
    author?: Author | null,
    category?: Category | null,
    tags?: Tag[]
  ): Post {
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      authorId: data.author_id,
      author: author || undefined,
      categoryId: data.category_id,
      category: category || undefined,
      tags: tags || [],
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      seoKeywords: data.seo_keywords,
      canonicalUrl: data.canonical_url,
      featuredImage: data.featured_image,
      featuredImageAlt: data.featured_image_alt,
      ogImage: data.og_image,
      ogTitle: data.og_title,
      ogDescription: data.og_description,
      viewCount: data.view_count || 0,
      readingTimeMinutes: data.reading_time_minutes || 5,
      publishedAt: data.published_at,
      scheduledFor: data.scheduled_for,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
