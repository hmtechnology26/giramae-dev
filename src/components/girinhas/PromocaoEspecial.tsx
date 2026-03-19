
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar, Heart, Sparkles } from "lucide-react";

const PromocaoEspecial = () => {
  const hoje = new Date();
  const diaMae = new Date(hoje.getFullYear(), 4, 14); // 14 de maio
  const natal = new Date(hoje.getFullYear(), 11, 25); // 25 de dezembro
  
  const isProximoDiaMae = Math.abs(hoje.getTime() - diaMae.getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isProximoNatal = Math.abs(hoje.getTime() - natal.getTime()) < 14 * 24 * 60 * 60 * 1000;

  if (!isProximoDiaMae && !isProximoNatal) {
    // Mostrar promoção geral quando não há datas especiais
    return (
      <Card className="bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-100 border-pink-300 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-yellow-400/20 animate-pulse"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-pink-700 text-center justify-center">
            <Sparkles className="h-6 w-6 animate-spin" />
            🎉 Sistema de Girinhas Ativo!
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-bounce">
              Ganhe Bônus!
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-center space-y-4">
            <div className="bg-white/80 p-4 rounded-lg">
              <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="font-bold text-purple-700 text-lg">
                🎁 5 Girinhas GRÁTIS ao se cadastrar!
              </p>
              <p className="text-sm text-purple-600">
                Comece a trocar sem gastar nada
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-100 p-3 rounded-lg text-center">
                <p className="font-semibold text-green-700">🏆 Complete Trocas</p>
                <p className="text-sm text-green-600">+1 Girinha por troca</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg text-center">
                <p className="font-semibold text-blue-700">🎯 Conquiste Metas</p>
                <p className="text-sm text-blue-600">Até +50 Girinhas</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg text-center">
                <p className="font-semibold text-orange-700">👥 Indique Amigas</p>
                <p className="text-sm text-orange-600">+2 Girinhas por indicação</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 animate-pulse"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-pink-700">
          <Gift className="h-5 w-5" />
          Promoção Especial
          <Badge variant="secondary" className="bg-pink-100 text-pink-800 animate-pulse">
            Tempo Limitado!
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {isProximoDiaMae && (
          <div className="flex items-center gap-3 mb-4 bg-white/60 p-4 rounded-lg">
            <Heart className="h-8 w-8 text-pink-500" />
            <div>
              <p className="font-semibold text-pink-700 text-lg">💝 Especial Dia das Mães</p>
              <p className="text-sm text-pink-600">
                Todas as mães ativas ganharão 10 Girinhas no Dia das Mães!
              </p>
            </div>
          </div>
        )}
        
        {isProximoNatal && (
          <div className="flex items-center gap-3 bg-white/60 p-4 rounded-lg">
            <Calendar className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 text-lg">🎄 Especial Natal</p>
              <p className="text-sm text-green-600">
                20 Girinhas de presente para todas as mães no Natal!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromocaoEspecial;
