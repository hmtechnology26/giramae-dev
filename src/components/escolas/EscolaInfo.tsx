
import React from 'react';
import { GraduationCap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EscolaInfoProps {
  mesmaEscola?: boolean;
  nomeEscola?: string;
  className?: string;
  tamanho?: 'sm' | 'md';
}

const EscolaInfo: React.FC<EscolaInfoProps> = ({
  mesmaEscola = false,
  nomeEscola,
  className = "",
  tamanho = 'sm'
}) => {
  if (!mesmaEscola && !nomeEscola) return null;

  const iconSize = tamanho === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = tamanho === 'sm' ? 'text-xs' : 'text-sm';

  if (mesmaEscola) {
    return (
      <Badge 
        variant="default" 
        className={`bg-green-100 text-green-800 border-green-200 ${className}`}
      >
        <Users className={`${iconSize} mr-1`} />
        <span className={textSize}>Mesma escola</span>
      </Badge>
    );
  }

  if (nomeEscola) {
    return (
      <div className={`flex items-center gap-1 text-gray-600 ${className}`}>
        <GraduationCap className={`${iconSize} flex-shrink-0`} />
        <span className={`${textSize} line-clamp-1`} title={nomeEscola}>
          {nomeEscola}
        </span>
      </div>
    );
  }

  return null;
};

export default EscolaInfo;
