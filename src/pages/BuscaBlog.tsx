import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usePosts } from '@/blog/hooks/usePosts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import BlogLayout from '@/blog/components/layout/BlogLayout';
import BlogSidebar from '@/blog/components/layout/BlogSidebar';
import CategoryBadge from '@/blog/components/ui/CategoryBadge';
import PostMeta from '@/blog/components/ui/PostMeta';
import SEOHead from '@/components/seo/SEOHead';
import { seoConfig } from '@/blog/config/seoConfig';

export default function BuscaBlog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const { posts, loading, hasMore, loadMore } = usePosts(
    {
      status: 'published',
      search: searchQuery || undefined,
    },
    20
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  // Estrutura de dados para JSON-LD
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Resultados de busca: ${searchQuery}`,
    "url": `https://giramae.com.br/buscar?q=${encodeURIComponent(searchQuery)}`,
    "inLanguage": "pt-BR"
  };

  const pageTitle = searchQuery 
    ? `Busca: ${searchQuery} | Blog GiraMãe`
    : 'Buscar no Blog | GiraMãe';
    
  const pageDescription = searchQuery
    ? `Resultados de busca para "${searchQuery}" no Blog GiraMãe`
    : 'Busque artigos sobre maternidade, economia e sustentabilidade no Blog GiraMãe';

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={seoConfig.keywords.join(', ')}
        url={`https://giramae.com.br/buscar${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
        type="website"
        structuredData={structuredData}
      />
      
      <BlogLayout sidebar={<BlogSidebar />}>
        {/* Header */}
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Buscar no Blog'}
          </h1>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `Encontramos ${posts.length} ${posts.length === 1 ? 'resultado' : 'resultados'}`
              : 'Digite algo para buscar artigos'
            }
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="q"
                  placeholder="Digite sua busca..."
                  defaultValue={searchQuery}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button type="submit">
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && searchQuery && posts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos posts que correspondam à sua busca "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchParams({})}>
                Limpar busca
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    {post.category && (
                      <CategoryBadge category={post.category} className="mb-2" />
                    )}
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  </CardContent>

                  <CardFooter>
                    <PostMeta 
                      readingTimeMinutes={post.readingTimeMinutes}
                      viewCount={post.viewCount}
                      date={post.publishedAt || post.createdAt}
                      variant="compact"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Carregar mais resultados
                </Button>
              </div>
            )}
          </>
        )}

        {/* Initial State - No search yet */}
        {!searchQuery && posts.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comece sua busca</h3>
              <p className="text-muted-foreground">
                Digite algo no campo acima para encontrar artigos sobre maternidade, economia e sustentabilidade
              </p>
            </CardContent>
          </Card>
        )}
      </BlogLayout>
    </>
  );
}
