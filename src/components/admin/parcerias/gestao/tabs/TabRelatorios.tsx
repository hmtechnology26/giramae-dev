import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Users, Coins, CheckCircle } from 'lucide-react';
import { useRelatorios } from '@/hooks/parcerias/useRelatorios';

interface TabRelatoriosProps {
  programaId: string;
}

export default function TabRelatorios({ programaId }: TabRelatoriosProps) {
  const { generateBeneficiariosCSV, generateCreditosCSV, generateValidacoesCSV } = useRelatorios(programaId);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Relatório de Beneficiários */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Beneficiários</CardTitle>
            </div>
            <CardDescription>
              Lista completa de todos os beneficiários aprovados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateBeneficiariosCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de Créditos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Créditos</CardTitle>
            </div>
            <CardDescription>
              Histórico completo de distribuição de girinhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateCreditosCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de Validações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Validações</CardTitle>
            </div>
            <CardDescription>
              Histórico de aprovações e rejeições
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateValidacoesCSV} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Os relatórios são gerados em formato CSV para fácil importação em Excel ou Google Sheets</p>
          <p>• Todos os dados são atualizados em tempo real</p>
          <p>• Use os filtros nas abas correspondentes para gerar relatórios personalizados</p>
          <p>• Para relatórios em PDF, entre em contato com o suporte técnico</p>
        </CardContent>
      </Card>
    </div>
  );
}
