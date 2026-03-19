import { Building2, Package, Users, Clock, Coins, TrendingUp } from 'lucide-react';
import CardMetrica from '../shared/CardMetrica';
import type { KPIsGlobais } from '@/types/parcerias';

interface CardsKPIsProps {
  data?: KPIsGlobais;
  loading?: boolean;
}

export default function CardsKPIs({ data, loading }: CardsKPIsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <CardMetrica
        titulo="Organizações"
        valor={data?.total_organizacoes || 0}
        icone={Building2}
        cor="blue"
        loading={loading}
      />
      <CardMetrica
        titulo="Programas"
        valor={data?.total_programas || 0}
        icone={Package}
        cor="purple"
        loading={loading}
      />
      <CardMetrica
        titulo="Beneficiários"
        valor={data?.total_beneficiarios || 0}
        icone={Users}
        cor="green"
        loading={loading}
      />
      <CardMetrica
        titulo="Validações Pendentes"
        valor={data?.validacoes_pendentes || 0}
        icone={Clock}
        cor="orange"
        loading={loading}
      />
      <CardMetrica
        titulo="Girinhas Mês"
        valor={data?.girinhas_mes_atual?.toLocaleString('pt-BR') || '0'}
        icone={Coins}
        cor="yellow"
        loading={loading}
      />
      <CardMetrica
        titulo="Girinhas Total"
        valor={data?.girinhas_total?.toLocaleString('pt-BR') || '0'}
        icone={TrendingUp}
        cor="emerald"
        loading={loading}
      />
    </div>
  );
}
