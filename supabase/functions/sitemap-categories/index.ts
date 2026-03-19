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

    // Buscar categorias
    const { data: categories, error: categoriesError } = await supabase.rpc('blog_get_categories');
    
    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError);
      throw categoriesError;
    }

    const baseUrl = 'https://giramae.com.br';
    const today = new Date().toISOString().split('T')[0];

    // Gerar URLs das categorias
    const categoryUrls = (categories || []).map((cat: any) => `
  <url>
    <loc>${baseUrl}/blog/categoria/${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${categoryUrls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap de categorias:', error);
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
