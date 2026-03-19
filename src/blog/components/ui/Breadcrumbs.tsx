import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Schema.org Structured Data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://giramae.com.br"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://giramae.com.br/blog"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 3,
        "name": item.name,
        ...(item.url && { "item": `https://giramae.com.br${item.url}` })
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex mt-5 items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link 
              to="/" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </li>
          
          <li>
            <ChevronRight className="h-4 w-4" />
          </li>
          
          <li>
            <Link 
              to="/blog" 
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {item.url ? (
                <Link 
                  to={item.url} 
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
