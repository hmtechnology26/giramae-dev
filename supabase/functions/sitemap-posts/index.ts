import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar posts publicados
    const { data: posts, error: postsError } = await supabase.rpc('blog_get_posts', {
      p_filters: { status: 'published' },
      p_pagination: { page: 1, page_size: 2000 }
    });

    if (postsError) {
      console.error('Erro ao buscar posts:', postsError);
      throw postsError;
    }

    const baseUrl = 'https://giramae.com.br';

    // Gerar URLs dos posts com imagens
    const postUrls = (posts || []).map((post: any) => {
      const lastmod = new Date(post.updated_at || post.created_at).toISOString().split('T')[0];
      const imageUrl = post.featured_image || post.cover_image || null;
      const imageTag = imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title><![CDATA[${post.title}]]></image:title>
    </image:image>` : '';

      return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${postUrls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap de posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
