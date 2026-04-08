
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrecoManual } from "@/hooks/usePrecoManual";
import { TrendingUp } from "lucide-react";

const CotacaoWidget = () => {
  const { precoManual, isLoading } = usePrecoManual();

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg flex flex-col justify-between">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2">
            
            Preço das Girinhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg flex flex-col justify-between">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2">
          <img src="/girinha_sem_fundo.png" alt="girinha" className="h-10 w-auto"/>
          <div className="flex flex-col">
         <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] leading-none mb-1">Preço das Girinhas</span>
          <span className="text-xs font-bold text-primary/60">Preço Fixo controlado manualmente</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">
              R$ {precoManual.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Estável</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Tipo</p>
              <p className="font-semibold">Manual</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-green-600">Ativo</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-600">
              💡 O preço é definido manualmente pela administração para garantir estabilidade e transparência.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoWidget;
