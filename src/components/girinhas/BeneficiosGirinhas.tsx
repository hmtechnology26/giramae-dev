
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Gift, Trophy, Sparkles, TrendingUp } from "lucide-react";

const BeneficiosGirinhas = () => {
  const beneficios = [
    {
      icon: Heart,
      titulo: "Trocas Justas",
      descricao: "Sistema transparente onde cada Girinha vale R$ 1,00",
      cor: "text-pink-500"
    },
    {
      icon: Gift,
      titulo: "Bônus Frequentes",
      descricao: "Ganhe Girinhas grátis em datas especiais e por atividade",
      cor: "text-purple-500"
    },
    {
      icon: Trophy,
      titulo: "Metas e Conquistas",
      descricao: "Complete desafios e ganhe distintivos especiais",
      cor: "text-yellow-500"
    },
    {
      icon: TrendingUp,
      titulo: "Descontos Progressivos",
      descricao: "Quanto mais Girinhas comprar, mais desconto você tem",
      cor: "text-green-500"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center text-purple-700">
          <Sparkles className="h-6 w-6" />
          Por que usar Girinhas?
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">
            Vantajoso!
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beneficios.map((beneficio, index) => {
            const Icon = beneficio.icon;
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105"
              >
                <Icon className={`h-6 w-6 ${beneficio.cor} flex-shrink-0 mt-1`} />
                <div>
                  <h4 className="font-semibold text-gray-800">{beneficio.titulo}</h4>
                  <p className="text-sm text-gray-600">{beneficio.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="font-bold text-green-700 text-lg">
            5 Girinhas GRÁTIS ao se cadastrar!
          </p>
          <p className="text-sm text-green-600">
            Comece a trocar imediatamente sem investir nada
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeneficiosGirinhas;
