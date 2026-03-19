// src/components/item/LogisticaBadges.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ItemFeed } from '@/hooks/useFeedInfinito';
import { Truck, Car, MapPin, School } from 'lucide-react';

interface LogisticaBadgesProps {
  item: ItemFeed;
  className?: string;
}

const LogisticaBadges: React.FC<LogisticaBadgesProps> = ({ item, className = "" }) => {
  const badges = [];

  // 🚚 Entrega disponível (prioridade máxima)
  if (item.logistica?.entrega_disponivel) {
    badges.push({
      icon: <Truck className="w-3 h-3" />,
      label: 'Entrega grátis',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-200'
    });
  }
  
  // 🚗 Busca disponível (só se não tem entrega)
  else if (item.logistica?.busca_disponivel) {
    badges.push({
      icon: <Car className="w-3 h-3" />,
      label: 'Você pode buscar',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    });
  }

  // 🏫 Escola em comum (sempre prioritário)
  if (item.escola_comum) {
    badges.unshift({ // Adiciona no início
      icon: <School className="w-3 h-3" />,
      label: 'Mesma escola',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    });
  }

  // 📍 Distância (sempre mostrar se disponível)
  if (item.logistica?.distancia_km !== null && item.logistica?.distancia_km !== undefined) {
    badges.push({
      icon: <MapPin className="w-3 h-3" />,
      label: `${item.logistica.distancia_km}km`,
      variant: 'outline' as const,
      className: 'bg-gray-50 text-gray-600 border-gray-200'
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((badge, index) => (
        <Badge 
          key={index}
          variant={badge.variant}
          className={`text-xs px-2 py-1 flex items-center gap-1 ${badge.className}`}
        >
          {badge.icon}
          {badge.label}
        </Badge>
      ))}
    </div>
  );
};

export default LogisticaBadges;

// ✅ Hook para filtros de logística no frontend
export const useLogisticaFilters = () => {
  const [modalidadeLogistica, setModalidadeLogistica] = React.useState<'todas' | 'entrega' | 'busca'>('todas');

  const opcoes = [
    { value: 'todas', label: 'Todas as opções', icon: '🔄' },
    { value: 'entrega', label: 'Só com entrega', icon: '🚚' },
    { value: 'busca', label: 'Posso buscar', icon: '🚗' },
  ];

  return {
    modalidadeLogistica,
    setModalidadeLogistica,
    opcoes
  };
};

// ✅ Componente FiltroLogistica para usar nos filtros
export const FiltroLogistica: React.FC<{
  value: 'todas' | 'entrega' | 'busca';
  onChange: (value: 'todas' | 'entrega' | 'busca') => void;
  className?: string;
}> = ({ value, onChange, className = "" }) => {
  const { opcoes } = useLogisticaFilters();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Modalidade de Entrega
      </label>
      <div className="grid grid-cols-1 gap-2">
        {opcoes.map((opcao) => (
          <label key={opcao.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="modalidade"
              value={opcao.value}
              checked={value === opcao.value}
              onChange={(e) => onChange(e.target.value as 'todas' | 'entrega' | 'busca')}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-sm text-gray-700 flex items-center gap-2">
              <span>{opcao.icon}</span>
              {opcao.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};