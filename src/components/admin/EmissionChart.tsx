import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LedgerTransacao {
  data_criacao: string;
  valor: number;
  tipo: string;
}

interface LedgerCarteira {
  total_recebido: number;
  saldo_atual: number;
}

const EmissionChart = () => {
  // Query para dados de emissão de Girinhas usando ledger_transacoes
  const { data: emissionData } = useQuery({
    queryKey: ['admin-emission-data'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('ledger_transacoes')
        .select('data_criacao, valor, tipo')
        .eq('tipo', 'purchase')
        .gt('valor', 0) // Apenas valores positivos (créditos)
        .order('data_criacao', { ascending: true });

      if (error) throw error;

      const groupedData = (data as LedgerTransacao[])?.reduce((acc, transacao) => {
        const date = format(new Date(transacao.data_criacao), 'yyyy-MM-dd');
        
        if (!acc[date]) {
          acc[date] = {
            data: format(new Date(transacao.data_criacao), 'dd/MM', { locale: ptBR }),
            girinhasEmitidas: 0,
            valorArrecadado: 0
          };
        }
        
        // Para compras (purchase), o valor representa as girinhas recebidas
        acc[date].girinhasEmitidas += Number(transacao.valor);
        // Assumindo que o valor em reais é igual ao valor em girinhas (1:1)
        acc[date].valorArrecadado += Number(transacao.valor);
        
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedData || {}).slice(-30);
    }
  });

  // Query para proporção Girinhas/Mães usando ledger_carteiras
  const { data: proportionData } = useQuery({
    queryKey: ['admin-girinhas-maes-proportion'],
    queryFn: async () => {
      const [
        { data: carteiras },
        { count: totalMaes }
      ] = await Promise.all([
        (supabase as any).from('ledger_carteiras').select('total_recebido, saldo_atual'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      const totalGirinhas = (carteiras as LedgerCarteira[])?.reduce((sum, c) => sum + Number(c.total_recebido || 0), 0) || 0;
      const totalEmCirculacao = (carteiras as LedgerCarteira[])?.reduce((sum, c) => sum + Number(c.saldo_atual || 0), 0) || 0;
      const proporacao = totalMaes ? (totalGirinhas / totalMaes).toFixed(2) : '0.00';

      return {
        totalGirinhas: Math.round(totalGirinhas),
        totalEmCirculacao: Math.round(totalEmCirculacao),
        totalMaes: totalMaes || 0,
        proporacao: Number(proporacao)
      };
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Emissão de Girinhas (Admin)</CardTitle>
          <CardDescription>
            Histórico de emissão nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="data" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} Girinhas`,
                    name === 'girinhasEmitidas' ? 'Girinhas Emitidas' : 'Valor Estimado'
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="girinhasEmitidas" 
                  fill="#3b82f6" 
                  name="girinhasEmitidas"
                />
                <Bar 
                  dataKey="valorArrecadado" 
                  fill="#10b981" 
                  name="valorArrecadado"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Girinhas</CardTitle>
          <CardDescription>
            Proporção e distribuição de Girinhas por usuária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {proportionData?.proporacao || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Girinhas por Mãe (média)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {proportionData?.totalGirinhas?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-blue-600">Total Recebido</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {proportionData?.totalEmCirculacao?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-green-600">Em Circulação</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {proportionData?.totalMaes?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-purple-600">Total de Usuárias</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Indicadores</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Circulação</span>
                  <span className="text-sm font-medium">
                    {proportionData?.totalGirinhas > 0 
                      ? `${((proportionData?.totalEmCirculacao / proportionData?.totalGirinhas) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{
                      width: `${proportionData?.totalGirinhas > 0 
                        ? Math.min(((proportionData?.totalEmCirculacao / proportionData?.totalGirinhas) * 100), 100)
                        : 0
                      }%`
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Girinhas Utilizadas</span>
                  <span className="text-sm font-medium">
                    {((proportionData?.totalGirinhas || 0) - (proportionData?.totalEmCirculacao || 0)).toLocaleString()} Girinhas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionChart;