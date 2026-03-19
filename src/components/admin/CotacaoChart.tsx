
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePrecoManual } from "@/hooks/usePrecoManual";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CotacaoChart = () => {
  const { precoManual, isLoading } = usePrecoManual();

  // ✅ CORRIGIDO: Para o sistema manual, vamos mostrar dados históricos simples
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    data: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'dd/MM', { locale: ptBR }),
    preco: precoManual, // Preço fixo para sistema manual
    volume: Math.floor(Math.random() * 100)
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Preço Manual</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gray-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preço Manual das Girinhas</CardTitle>
        <CardDescription>
          Sistema simplificado - Preço fixo controlado manualmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Preço Atual</p>
              <p className="text-2xl font-bold text-blue-900">
                R$ {precoManual.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">Status</p>
              <p className="text-lg font-semibold text-green-600">
                Manual
              </p>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                domain={[precoManual - 0.1, precoManual + 0.1]}
                tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Preço']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="preco" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Tipo</p>
            <p className="font-semibold">Manual</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Atual</p>
            <p className="font-semibold">R$ {precoManual.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Controle</p>
            <p className="font-semibold">Admin</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoChart;
