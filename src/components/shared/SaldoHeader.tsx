import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useCarteira } from '@/hooks/useCarteira';
import { Skeleton } from '@/components/ui/skeleton';

const SaldoHeader: React.FC = () => {
  const { saldo, loading } = useCarteira();

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-2 md:px-4 py-1 text-pink-50 rounded-full min-w-[84px] md:min-w-[110px]">
        <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-600" />
        <Skeleton className="h-3.5 w-9 md:w-16" />
      </div>
    );
  }

  return (
    <Link 
      to="/carteira" 
      data-tour="wallet-button"
      className="flex items-center gap-1 px-2 md:px-6 ml-0 md:ml-5 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full transition-all group min-w-[88px] md:min-w-[130px]"
      title="Ver Carteira Completa"
    >
      <img 
        src="/girinha_sem_fundo.png" 
        alt="Girinha" 
        className="w-3.5 h-4 md:w-5 md:h-6 object-contain group-hover:animate-pulse"
      />
      
      <div className="flex flex-col leading-tight">
        <span className="text-[8px] md:text-[10px] text-gray-500 font-bold">
          G$
        </span>
        <span className="text-[10px] md:text-sm font-bold text-pink-700">
          {saldo.toFixed(2)}
        </span>
      </div>
    </Link>
  );
};

export default SaldoHeader;
