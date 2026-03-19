import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import '@/blog/styles/prose-giramae.css';
import { parseOptimizedImageMarkdown, generateOptimizedImageAttrs } from '@/utils/optimizedImage';

// Importar componentes interativos
import CalculadoraGastosRoupas from '@/blog/components/interactive/CalculadoraGastosRoupas';
import SimuladorTamanhoRoupa from '@/blog/components/interactive/SimuladorTamanhoRoupa';
import CalculadoraEnxovalInteligente from '@/blog/components/interactive/CalculadoraEnxovalInteligente';

// Mapeamento de placeholders para componentes
const COMPONENT_MAP: Record<string, React.ComponentType> = {
  '[REACT_CALCULATOR]': CalculadoraGastosRoupas,
  '[REACT_SIZE_SIMULATOR]': SimuladorTamanhoRoupa,
  '[REACT_CALCULATOR:CalculadoraEnxovalInteligente]': CalculadoraEnxovalInteligente,
  // Adicione novos mapeamentos aqui
};

// Regex para encontrar placeholders (sem flag 'g' para o test)
const PLACEHOLDER_PATTERN = /\[REACT_[A-Z_]+(:[A-Za-z]+)?\]/;

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Verifica se há placeholders no conteúdo
  const hasPlaceholders = PLACEHOLDER_PATTERN.test(content);
  
  // Se não há placeholders, renderiza normalmente
  if (!hasPlaceholders) {
    return <MarkdownContent content={content} className={className} />;
  }

  // Divide o conteúdo e renderiza partes + componentes
  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    // Criar novo regex com flag 'g' para o loop
    const regex = /\[REACT_[A-Z_]+(:[A-Za-z]+)?\]/g;
    
    while ((match = regex.exec(content)) !== null) {
      // Markdown antes do placeholder
      if (match.index > lastIndex) {
        const markdownPart = content.slice(lastIndex, match.index);
        parts.push(
          <MarkdownContent key={`md-${key}`} content={markdownPart} className={className} />
        );
      }

      // Componente React correspondente
      const placeholder = match[0];
      const Component = COMPONENT_MAP[placeholder];
      
      if (Component) {
        parts.push(
          <div key={`component-${key}`} className="my-8">
            <Component />
          </div>
        );
      } else {
        console.warn(`Componente não encontrado para: ${placeholder}`);
      }

      lastIndex = match.index + match[0].length;
      key++;
    }

    // Markdown restante
    if (lastIndex < content.length) {
      parts.push(
        <MarkdownContent key="md-final" content={content.slice(lastIndex)} className={className} />
      );
    }

    return parts;
  };

  return <>{renderContent()}</>;
}

// Componente interno para renderizar markdown puro
function MarkdownContent({ content, className }: { content: string; className: string }) {
  return (
    <div className={`prose prose-giramae prose-lg max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          img: ({ src, alt, title }) => {
            // Tentar parsear como imagem otimizada
            const optimizedData = title ? parseOptimizedImageMarkdown(src || '', alt || '', title) : null;
            
            if (optimizedData) {
              // Renderizar com srcset otimizado
              const attrs = generateOptimizedImageAttrs(optimizedData);
              return (
                <img
                  {...attrs}
                  className="rounded-lg shadow-lg my-6 w-full"
                  style={{ aspectRatio: `${attrs.width} / ${attrs.height}` }}
                />
              );
            }
            
            // Fallback para imagens normais
            const altText = alt && alt.trim() 
              ? alt 
              : 'Imagem ilustrativa do post - Blog GiraMãe sobre maternidade e sustentabilidade';
            
            return (
              <img
                src={src}
                alt={altText}
                className="rounded-lg shadow-lg my-6 w-full"
                loading="lazy"
                decoding="async"
              />
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline font-medium"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mt-8 mb-4 text-primary">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-primary">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-4 mb-2 text-primary">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 bg-primary/10 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-t border-border">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
