import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
  // Article-specific props
  publishedDate?: string;
  modifiedDate?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "GiraMãe - Troca de Roupas Infantis entre Mães | Comunidade de Mães",
  description = "Plataforma de troca de roupas infantis entre mães. Economia circular com moeda virtual Girinhas. Brechó online sustentável para roupas, brinquedos e calçados infantis.",
  keywords = "troca roupas infantis, brechó online, economia circular mães, sustentabilidade infantil, roupas usadas criança, GiraMãe, Girinhas, Canoas RS",
  image = "https://giramae.com.br/og-image.jpg",
  url = "https://giramae.com.br",
  type = "website",
  noindex = false,
  structuredData,
  publishedDate,
  modifiedDate,
  authorName,
  category,
  tags
}) => {
  const fullTitle = title.includes('GiraMãe') ? title : `${title} | GiraMãe`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="GiraMãe" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article Meta Tags */}
      {type === 'article' && (
        <>
          {publishedDate && <meta property="article:published_time" content={publishedDate} />}
          {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
          {authorName && <meta property="article:author" content={authorName} />}
          {category && <meta property="article:section" content={category} />}
          {tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional Meta Tags */}
      <meta name="author" content={authorName || "GiraMãe"} />
      <meta name="theme-color" content="#E879F9" />
      <meta name="geo.region" content="BR-RS" />
      <meta name="geo.placename" content="Canoas" />
      <meta name="geo.position" content="-29.9177;-51.1794" />
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://mkuuwnqiaeguuexeeicw.supabase.co" />
      <link rel="dns-prefetch" href="https://lovable.dev" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
