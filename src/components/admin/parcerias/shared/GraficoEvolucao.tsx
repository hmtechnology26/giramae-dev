import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EvolucaoTemporal } from '@/types/parcerias';
import EmptyState from './EmptyState';
import { TrendingUp } from 'lucide-react';

interface GraficoEvolucaoProps {
  data: EvolucaoTemporal[];
}

export default function GraficoEvolucao({ data }: GraficoEvolucaoProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            icon={TrendingUp}
            titulo="Sem dados de evolução"
            mensagem="Aguardando dados históricos para exibir gráficos"
          />
        </CardContent>
      </Card>
    );
  }

  const dadosFormatados = data.map(item => ({
    mes: new Date(item.mes).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    beneficiarios: item.novos_beneficiarios,
    girinhas: item.creditos_distribuidos
  }));

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {/* Gráfico de Beneficiários */}
      <Card>
        <CardHeader>
          <CardTitle>Novos Beneficiários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosFormatados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="beneficiarios" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Beneficiários"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Girinhas */}
      <Card>
        <CardHeader>
          <CardTitle>Girinhas Distribuídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosFormatados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="girinhas" 
                  fill="hsl(var(--primary))"
                  name="Girinhas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
