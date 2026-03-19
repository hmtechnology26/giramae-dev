# Configuração do Google Search Console

## Passo 1: Verificar Propriedade no Google Search Console

1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Clique em "Adicionar Propriedade"
3. Escolha "Prefixo de URL" e insira: `https://giramae.com.br`
4. Escolha um método de verificação:

### Opção A: Meta Tag (Recomendado)
- Copie a meta tag fornecida
- Adicione no arquivo `public/index.html` dentro da tag `<head>`:
```html
<meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
```

### Opção B: Arquivo HTML
- Baixe o arquivo HTML fornecido
- Coloque em `public/googlee990d0368394ce1d.html` (já existe um arquivo de exemplo)

### Opção C: Google Analytics
- Se já tem GA4 configurado, pode usar essa opção

## Passo 2: Submeter Sitemap

Após verificação aprovada:

1. No painel do GSC, vá em "Sitemaps"
2. Adicione: `https://giramae.com.br/sitemap.xml`
3. Clique em "Enviar"

**IMPORTANTE**: O sitemap precisa ser gerado dinamicamente com os posts do blog.
Use a função `generateBlogSitemap()` em `src/utils/generateSitemap.ts`

### Automatizar Geração do Sitemap

Opção 1: **Edge Function (Recomendado)**
Criar edge function que regenera sitemap a cada publicação de post.

Opção 2: **Build Script**
Adicionar script no `package.json` para gerar antes do build:
```json
"scripts": {
  "generate-sitemap": "node scripts/generateSitemap.js",
  "build": "npm run generate-sitemap && vite build"
}
```

## Passo 3: Configurar Google Analytics 4

1. Acesse [Google Analytics](https://analytics.google.com)
2. Crie uma propriedade GA4
3. Copie o ID de medição (formato: G-XXXXXXXXXX)
4. Adicione o script no `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Passo 4: Monitorar Core Web Vitals

No Google Search Console, acesse:
- **Experiência** → Core Web Vitals
- **Desempenho** → Consultas de pesquisa
- **Cobertura** → Páginas indexadas

### Métricas Importantes:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Melhorar Core Web Vitals:
1. Otimizar imagens (webp, lazy loading)
2. Minificar CSS/JS
3. Usar CDN para assets
4. Implementar cache de browser

## Passo 5: Rich Results Test

Teste se os structured data estão corretos:
1. Acesse [Rich Results Test](https://search.google.com/test/rich-results)
2. Insira URL do post: `https://giramae.com.br/blog/seu-post`
3. Verifique se aparecem:
   - BlogPosting schema
   - Breadcrumbs
   - Author info
   - Published date

## Checklist Pós-Configuração

- [ ] Propriedade verificada no GSC
- [ ] Sitemap.xml submetido e indexado
- [ ] Google Analytics 4 configurado
- [ ] Structured data validados (Rich Results Test)
- [ ] Core Web Vitals monitorados
- [ ] Primeiros 5 posts publicados com SEO otimizado
- [ ] Meta descriptions únicas em todos os posts
- [ ] Alt text descritivo em todas as imagens
- [ ] Internal linking entre posts relacionados

## Tempo de Indexação

- **Sitemap**: 24-48 horas para primeira indexação
- **Posts novos**: 1-7 dias
- **Rankeamento**: 2-6 meses para keywords competitivas

## Recursos Úteis

- [Documentação GSC](https://support.google.com/webmasters)
- [Schema.org Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
