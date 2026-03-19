import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Calculator } from "lucide-react";
import { useConfigSistema } from "@/hooks/useConfigSistema";

const InfoTaxas = () => {
  const { taxaTransacao } = useConfigSistema();

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Info className="h-5 w-5" />
          Como funcionam as taxas
        </CardTitle>
      </CardHeader>
      <CardContent className="text-blue-700">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {taxaTransacao > 0 ? `Taxa de ${taxaTransacao}% sobre trocas` : 'Trocas sem taxa!'}
              </p>
              <p className="text-sm text-blue-600">
                {taxaTransacao > 0 
                  ? "Cobrada em Girinhas da usuária que recebe o item"
                  : "Aproveite: todas as trocas são gratuitas"
                }
              </p>
            </div>
          </div>
          
          {taxaTransacao > 0 && (
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="font-medium text-sm">Exemplo:</p>
              <p className="text-sm">
                Item de 20 Girinhas = Taxa de {(20 * taxaTransacao / 100).toFixed(1)} Girinhas
              </p>
            </div>
          )}
          
          <p className="text-xs text-blue-600">
            * As taxas ajudam a manter a plataforma funcionando e segura para todas as mães
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoTaxas;
