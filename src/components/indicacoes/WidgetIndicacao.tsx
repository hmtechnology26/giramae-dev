
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { Users, Gift, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const WidgetIndicacao = () => {
  const { indicacoes, compartilharIndicacao } = useIndicacoes();

  const totalGanho = indicacoes.reduce((total, indicacao) => {
    let bonus = 0;
    if (indicacao.bonus_cadastro_pago) bonus += 5;
    if (indicacao.bonus_primeiro_item_pago) bonus += 5;
    if (indicacao.bonus_primeira_compra_pago) bonus += 5;
    return total + bonus;
  }, 0);

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Users className="h-5 w-5" />
          Sistema de Indicações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{indicacoes.length}</div>
            <div className="text-sm text-gray-600">Indicações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{totalGanho}</div>
            <div className="text-sm text-gray-600">Girinhas ganhas</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={compartilharIndicacao}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          
          <Link to="/indicacoes">
            <Button variant="outline" className="w-full" size="sm">
              Ver Detalhes
            </Button>
          </Link>
        </div>

        <div className="bg-white p-3 rounded-lg border border-purple-100">
          <div className="text-xs text-purple-700 font-medium mb-2">Ganhe até 15 Girinhas:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Gift className="h-3 w-3 text-green-500" />
              <span>+5 no cadastro</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-3 w-3 text-blue-500" />
              <span>+5 no 1º item</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-3 w-3 text-purple-500" />
              <span>+5 na 1ª compra</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WidgetIndicacao;
