import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import ItemModeracaoCardCompleto from '../ItemModeracaoCardCompleto';
import { ItemModeracaoData } from '@/hooks/useModeracaoItens';

interface ModerationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    pendentes: number;
    reportados: number;
    aprovados: number;
    rejeitados: number;
  };
  itensFiltrados: ItemModeracaoData[];
  onAprovar: (moderacaoId: string) => Promise<void>;
  onRejeitar: (moderacaoId: string, motivo: string, observacoes?: string) => Promise<void>;
  onAceitarDenuncia: (denunciaId: string, comentario: string, observacoes?: string) => Promise<void>;
  onRejeitarDenuncia: (denunciaId: string, observacoes: string) => Promise<void>;
  loading: boolean;
}

const ModerationTabs: React.FC<ModerationTabsProps> = ({
  activeTab,
  setActiveTab,
  stats,
  itensFiltrados,
  onAprovar,
  onRejeitar,
  onAceitarDenuncia,
  onRejeitarDenuncia,
  loading
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pendentes" className="gap-2">
          <Clock className="w-4 h-4" />
          Pendentes ({stats.pendentes})
        </TabsTrigger>
        <TabsTrigger value="reportados" className="gap-2">
          <AlertTriangle className="w-4 h-4" />
          Reportados ({stats.reportados})
        </TabsTrigger>
        <TabsTrigger value="aprovados" className="gap-2">
          <CheckCircle className="w-4 h-4" />
          Aprovados ({stats.aprovados})
        </TabsTrigger>
        <TabsTrigger value="rejeitados" className="gap-2">
          <XCircle className="w-4 h-4" />
          Rejeitados ({stats.rejeitados})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="space-y-6">
        {itensFiltrados.length > 0 ? (
          <div className="grid gap-4">
            {itensFiltrados.map((item) => (
              <ItemModeracaoCardCompleto
                key={item.item_id}
                item={item}
                onAprovar={onAprovar}
                onRejeitar={onRejeitar}
                onAceitarDenuncia={onAceitarDenuncia}
                onRejeitarDenuncia={onRejeitarDenuncia}
                loading={loading}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">
                Não há itens {activeTab} no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ModerationTabs;
