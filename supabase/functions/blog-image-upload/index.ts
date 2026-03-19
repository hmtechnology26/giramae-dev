import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const postSlug = formData.get('postSlug') as string || 'draft';
    const baseName = formData.get('baseName') as string;
    const altText = formData.get('alt') as string || '';
    const originalWidth = parseInt(formData.get('originalWidth') as string, 10);
    const originalHeight = parseInt(formData.get('originalHeight') as string, 10);

    // Receber as 3 variações já processadas
    const smallFile = formData.get('small') as File;
    const mediumFile = formData.get('medium') as File;
    const largeFile = formData.get('large') as File;

    if (!smallFile || !mediumFile || !largeFile) {
      throw new Error('Missing image variants');
    }

    console.log('Uploading image variants:', baseName);

    // Ambiente (prod/dev)
    const ambiente = Deno.env.get('DENO_DEPLOYMENT_ID') ? 'prod' : 'dev';

    // Upload das 3 variações
    const variants = [
      { size: 'small', file: smallFile },
      { size: 'medium', file: mediumFile },
      { size: 'large', file: largeFile },
    ];

    // Apenas retornar os paths, NÃO as URLs completas
    // Frontend vai construir URLs usando BLOG_IMAGES_CDN + path
    const uploadedVariants: Record<string, string> = {};

    for (const variant of variants) {
      const fileName = `${baseName}-${variant.size}.webp`;
      const filePath = `${ambiente}/blog/${postSlug}/${fileName}`;

      console.log(`Uploading ${variant.size} to: ${filePath}`);

      const arrayBuffer = await variant.file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, uint8Array, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 ano
          upsert: true,
        });

      if (uploadError) {
        console.error(`Error uploading ${variant.size}:`, uploadError);
        throw uploadError;
      }

      // Retornar apenas o path (não URL completa)
      // Frontend usará: BLOG_IMAGES_CDN + path
      uploadedVariants[variant.size] = filePath;
      console.log(`${variant.size} uploaded successfully, path: ${filePath}`);
    }

    // Retornar estrutura JSON com paths (não URLs)
    const response = {
      id: crypto.randomUUID(),
      alt: altText,
      variants: uploadedVariants,  // Agora contém paths, não URLs
      width: originalWidth,
      height: originalHeight,
      mime_type: 'image/webp',
      processed_at: new Date().toISOString(),
    };

    console.log('Upload completed successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
