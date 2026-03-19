import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CardMetricaProps {
  titulo: string;
  valor: string | number;
  icone: LucideIcon;
  descricao?: string;
  cor?: string;
  loading?: boolean;
}

export default function CardMetrica({ 
  titulo, 
  valor, 
  icone: Icon, 
  descricao, 
  cor = 'primary',
  loading = false
}: CardMetricaProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {titulo}
            </p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <h3 className="text-2xl font-bold">{valor}</h3>
            )}
            {descricao && (
              <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${cor}/10`}>
            <Icon className={`h-6 w-6 text-${cor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
