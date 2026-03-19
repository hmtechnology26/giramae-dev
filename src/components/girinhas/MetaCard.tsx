
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Award, Crown } from "lucide-react";
import { Tables } from '@/integrations/supabase/types';

type MetaUsuario = Tables<'metas_usuarios'>;

interface MetaCardProps {
  meta: MetaUsuario;
  trocasRealizadas: number;
  progresso: number;
}

const iconMap = {
  bronze: Trophy,
  prata: Star,
  ouro: Award,
  diamante: Crown
};

const colorMap = {
  bronze: 'text-orange-600',
  prata: 'text-gray-500',
  ouro: 'text-yellow-500',
  diamante: 'text-purple-600'
};

const MetaCard = ({ meta, trocasRealizadas, progresso }: MetaCardProps) => {
  const Icon = iconMap[meta.tipo_meta as keyof typeof iconMap] || Trophy;
  const iconColor = colorMap[meta.tipo_meta as keyof typeof colorMap] || 'text-gray-500';

  return (
    <Card className={`${meta.conquistado ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          Distintivo {meta.tipo_meta.charAt(0).toUpperCase() + meta.tipo_meta.slice(1)}
          {meta.conquistado && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Conquistado!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {meta.trocas_necessarias} trocas necessárias
            </p>
            <p className="text-sm font-medium">
              Progresso: {trocasRealizadas}/{meta.trocas_necessarias}
            </p>
          </div>
          
          <Progress value={progresso} className="h-2" />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Recompensa: {meta.girinhas_bonus} Girinhas
            </p>
            {meta.conquistado && meta.data_conquista && (
              <p className="text-xs text-green-600">
                Conquistado em {new Date(meta.data_conquista).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaCard;
