
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, TrendingUp, Sparkles } from "lucide-react";

const EstatisticasPlataforma = () => {
  // Dados simulados - em produção viriam de uma API
  const stats = [
    {
      icon: Users,
      numero: "2.500+",
      label: "Mães Ativas",
      cor: "text-blue-600"
    },
    {
      icon: Heart,
      numero: "15.000+",
      label: "Trocas Realizadas",
      cor: "text-pink-600"
    },
    {
      icon: Sparkles,
      numero: "50.000+",
      label: "Girinhas em Circulação",
      cor: "text-yellow-600"
    },
    {
      icon: TrendingUp,
      numero: "95%",
      label: "Satisfação",
      cor: "text-green-600"
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-center text-indigo-700">
          🌟 A Comunidade GiraMãe Cresce a Cada Dia!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300">
                <Icon className={`h-8 w-8 ${stat.cor} mx-auto mb-2`} />
                <div className={`text-2xl font-bold ${stat.cor}`}>
                  {stat.numero}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstatisticasPlataforma;
