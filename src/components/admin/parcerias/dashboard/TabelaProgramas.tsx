import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { ProgramaListItem } from '@/types/parcerias';
import EmptyState from '../shared/EmptyState';

interface TabelaProgramasProps {
  programas: ProgramaListItem[];
  loading?: boolean;
}

export default function TabelaProgramas({ programas, loading }: TabelaProgramasProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programas Ativos ({programas.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {programas.length === 0 ? (
          <EmptyState 
            titulo="Nenhum programa cadastrado"
            mensagem="Cadastre o primeiro programa para começar."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead className="hidden md:table-cell">Organização</TableHead>
                  <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
                  <TableHead>Beneficiários</TableHead>
                  <TableHead className="hidden sm:table-cell">Pendentes</TableHead>
                  <TableHead className="hidden md:table-cell">Créditos Mês</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programas.map((programa) => (
                  <TableRow key={programa.id}>
                    <TableCell className="font-medium">{programa.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{programa.organizacao_nome}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {programa.cidade}/{programa.estado}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{programa.total_beneficiarios}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {programa.validacoes_pendentes > 0 ? (
                        <Badge variant="destructive">{programa.validacoes_pendentes}</Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {programa.creditos_mes.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/parcerias/${programa.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
