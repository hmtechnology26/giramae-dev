import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/blog/hooks/useCategories';
import { useTags } from '@/blog/hooks/useTags';
import { Link } from 'react-router-dom';

export default function BlogSidebar() {
  const { categories } = useCategories();
  const { tags } = useTags();

  return (
    <div className="space-y-6">
      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/blog/categoria/${category.slug}`}
                  className="text-sm hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span>{category.name}</span>
                  {category.postCount && (
                    <Badge variant="secondary" className="ml-2">
                      {category.postCount}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tags Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter (placeholder) */}
      {/* <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-lg">Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 opacity-90">
            Receba dicas de economia e sustentabilidade direto no seu email!
          </p>
          <Link
            to="/#newsletter"
            className="inline-block bg-background text-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Inscrever-se
          </Link>
        </CardContent>
      </Card> */}
    </div>
  );
}
