import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardGlobal } from '@/hooks/parcerias/useDashboardGlobal';
import CardsKPIs from '@/components/admin/parcerias/dashboard/CardsKPIs';
import TabelaProgramas from '@/components/admin/parcerias/dashboard/TabelaProgramas';
import AlertasCriticos from '@/components/admin/parcerias/dashboard/AlertasCriticos';
import GraficoEvolucao from '@/components/admin/parcerias/shared/GraficoEvolucao';

export default function ParceriasDashboard() {
  const navigate = useNavigate();
  const { kpis, programas, alertas, evolucao, loading } = useDashboardGlobal();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Gestão de Parcerias</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie programas sociais e beneficiários
            </p>
          </div>
          <Button onClick={() => navigate('/admin/parcerias/nova-parceria')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Parceria
          </Button>
        </div>

        {/* KPIs */}
        <CardsKPIs data={kpis} loading={loading} />

        {/* Alertas Críticos */}
        {alertas.length > 0 && <AlertasCriticos alertas={alertas} />}

        {/* Gráfico de Evolução */}
        {evolucao && evolucao.length > 0 && <GraficoEvolucao data={evolucao} />}

        {/* Tabela de Programas */}
        <TabelaProgramas programas={programas} loading={loading} />
      </div>
    </div>
  );
}
