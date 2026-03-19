import { useState } from 'react';
import { useDistribuicao } from '@/hooks/parcerias/useDistribuicao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from '../../shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TabDistribuicaoProps {
  programaId: string;
}

export default function TabDistribuicao({ programaId }: TabDistribuicaoProps) {
  const { historicoMensal, dadosGrafico, loading, getDetalhesMes } = useDistribuicao(programaId);
  const [mesExpandido, setMesExpandido] = useState<string | null>(null);
  const [detalhesMes, setDetalhesMes] = useState<any[]>([]);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  const handleExpandir = async (mes: string) => {
    if (mesExpandido === mes) {
      setMesExpandido(null);
      setDetalhesMes([]);
    } else {
      setMesExpandido(mes);
      setLoadingDetalhes(true);
      try {
        const detalhes = await getDetalhesMes(mes);
        setDetalhesMes(detalhes);
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setLoadingDetalhes(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Distribuição */}
      {dadosGrafico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Girinhas (Últimos 12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="girinhas" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Distribuição</CardTitle>
        </CardHeader>
        <CardContent>
          {historicoMensal.length === 0 ? (
            <EmptyState 
              titulo="Nenhuma distribuição realizada"
              mensagem="Aguardando o primeiro processamento de créditos"
            />
          ) : (
            <div className="space-y-2">
              {historicoMensal.map((item: any) => (
                <Collapsible
                  key={item.mes_referencia}
                  open={mesExpandido === item.mes_referencia}
                  onOpenChange={() => handleExpandir(item.mes_referencia)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Mês Referência</p>
                            <p className="font-medium">
                              {new Date(item.mes_referencia).toLocaleDateString('pt-BR', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Beneficiários</p>
                            <p className="font-medium">{item.total_beneficiarios}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Distribuído</p>
                            <p className="font-medium">{item.total_girinhas.toLocaleString('pt-BR')} Girinhas</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="default">{item.status}</Badge>
                            {mesExpandido === item.mes_referencia ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t p-4">
                        {loadingDetalhes ? (
                          <Skeleton className="h-32 w-full" />
                        ) : detalhesMes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum detalhe disponível
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Beneficiário</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Valor</TableHead>
                                  <TableHead>Data</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {detalhesMes.map((detalhe) => (
                                  <TableRow key={detalhe.id}>
                                    <TableCell>{detalhe.profiles?.nome}</TableCell>
                                    <TableCell>{detalhe.profiles?.email}</TableCell>
                                    <TableCell>{detalhe.valor_creditado} Girinhas</TableCell>
                                    <TableCell>
                                      {detalhe.data_creditacao 
                                        ? new Date(detalhe.data_creditacao).toLocaleDateString('pt-BR')
                                        : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
