
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MousePointer, Target } from 'lucide-react';

const AnalyticsSegmentacao: React.FC = () => {
  // Dados simulados para demonstração
  const dadosPerformance = [
    { segmento: 'SP - Volta às Aulas', visualizacoes: 1200, conclusoes: 340, taxa: 28.3 },
    { segmento: 'RJ - Primeiras Compras', visualizacoes: 850, conclusoes: 210, taxa: 24.7 },
    { segmento: 'Nacional - Premium', visualizacoes: 350, conclusoes: 180, taxa: 51.4 },
    { segmento: 'Mães de Bebês', visualizacoes: 950, conclusoes: 290, taxa: 30.5 }
  ];

  const dadosEventos = [
    { evento: 'navigate_to_page', cliques: 450, conversoes: 120 },
    { evento: 'open_modal', cliques: 320, conversoes: 85 },
    { evento: 'external_link', cliques: 180, conversoes: 45 },
    { evento: 'trigger_notification', cliques: 90, conversoes: 25 }
  ];

  const dadosGeograficos = [
    { name: 'São Paulo', value: 35, color: '#8884d8' },
    { name: 'Rio de Janeiro', value: 25, color: '#82ca9d' },
    { name: 'Minas Gerais', value: 15, color: '#ffc658' },
    { name: 'Outros', value: 25, color: '#ff7300' }
  ];

  const dadosTemporal = [
    { periodo: 'Segunda', ativacao: 120, conclusao: 45 },
    { periodo: 'Terça', ativacao: 95, conclusao: 35 },
    { periodo: 'Quarta', ativacao: 110, conclusao: 50 },
    { periodo: 'Quinta', ativacao: 85, conclusao: 40 },
    { periodo: 'Sexta', ativacao: 150, conclusao: 75 },
    { periodo: 'Sábado', ativacao: 200, conclusao: 95 },
    { periodo: 'Domingo', ativacao: 180, conclusao: 80 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.4% vs. missões gerais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Alcançados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,350</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Executados</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,040</div>
            <p className="text-xs text-muted-foreground">
              275 conversões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 com alta performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance por Segmento */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segmento" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visualizacoes" fill="#8884d8" />
                <Bar dataKey="conclusoes" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eventos Mais Usados */}
        <Card>
          <CardHeader>
            <CardTitle>Performance de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dadosEventos.map((evento, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{evento.evento.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">
                      {evento.cliques} cliques • {evento.conversoes} conversões
                    </p>
                  </div>
                  <Badge variant="outline">
                    {Math.round((evento.conversoes / evento.cliques) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Geográfica */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosGeograficos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {dadosGeograficos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Padrão Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Padrão Temporal de Ativação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ativacao" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="conclusao" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">✅ Pontos Fortes</h4>
              <ul className="space-y-2 text-sm">
                <li>• Segmento "Nacional Premium" com alta conversão (51.4%)</li>
                <li>• Fins de semana são ideais para ativação</li>
                <li>• Eventos de navegação têm boa performance</li>
                <li>• São Paulo e Rio concentram 60% dos usuários</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-orange-700">⚠️ Oportunidades</h4>
              <ul className="space-y-2 text-sm">
                <li>• Expandir segmentação para outros estados</li>
                <li>• Criar missões específicas para dias úteis</li>
                <li>• Otimizar eventos de modal e notificação</li>
                <li>• Desenvolver segmentos para mães trabalhadoras</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSegmentacao;
