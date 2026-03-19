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
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://giramae.com.br';

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/sitemap-posts.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <sitemap>
    <loc>${baseUrl}/sitemap-tags.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

</sitemapindex>`;

    return new Response(sitemapIndex, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap index:', error);
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
