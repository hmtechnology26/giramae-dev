import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertTriangle, Clock, Gift, Trophy, Star, CheckCircle } from "lucide-react";
import { useGirinhasExpiracaoSegura } from "@/hooks/useGirinhasExpiracaoSegura";
import ExtensaoValidadeSegura from "./ExtensaoValidadeSegura";

const ValidadeGirinhasSegura = () => {
  const { expiracao, loading } = useGirinhasExpiracaoSegura();

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Controle Seguro de Validade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando validades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getCorPorDias = (dias: number) => {
    if (dias <= 7) return "text-red-600 bg-red-50";
    if (dias <= 30) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getIconePorDias = (dias: number) => {
    if (dias <= 7) return <AlertTriangle className="w-4 h-4" />;
    if (dias <= 30) return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-green-600" />;
      case 'missao':
        return <Trophy className="w-4 h-4 text-purple-600" />;
      case 'missao_recompensa':
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatarTipo = (tipo: string) => {
    const tipos = {
      'compra': 'Compra',
      'bonus': 'Bônus',
      'missao': 'Missão',
      'missao_recompensa': 'Recompensa'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  // Calcular estatísticas com dados seguros
  const transacoesElegiveis = expiracao.detalhes_expiracao.filter(item => 
    item.dias_restantes <= 7 && item.pode_estender && !item.ja_estendida
  );
  const transacoesJaEstendidas = expiracao.detalhes_expiracao.filter(item => item.ja_estendida);

  return (
    <div className="space-y-4">
      {/* Alerta de Girinhas expirando com dados seguros */}
      {expiracao.total_expirando_7_dias > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ <strong>{expiracao.total_expirando_7_dias.toFixed(0)} Girinhas</strong> expiram nos próximos 7 dias! 
            Use antes de perder ou estenda a validade.
          </AlertDescription>
        </Alert>
      )}

      {expiracao.total_expirando_30_dias > 0 && expiracao.total_expirando_7_dias === 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            📅 <strong>{expiracao.total_expirando_30_dias.toFixed(0)} Girinhas</strong> expiram nos próximos 30 dias.
          </AlertDescription>
        </Alert>
      )}

      {/* Widgets de extensão para transações elegíveis */}
      {transacoesElegiveis.map((item) => (
        <ExtensaoValidadeSegura
          key={item.transacao_id}
          transacaoId={item.transacao_id}
          valorGirinhas={item.valor}
          diasRestantes={item.dias_restantes}
          jaEstendida={item.ja_estendida}
          podeEstender={item.pode_estender}
          tipo={item.tipo}
        />
      ))}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Controle Seguro de Validade das Girinhas
          </CardTitle>
          {transacoesJaEstendidas.length > 0 && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {transacoesJaEstendidas.length} transação{transacoesJaEstendidas.length !== 1 ? 'ões' : ''} já estendida{transacoesJaEstendidas.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {expiracao.detalhes_expiracao.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma Girinha com validade encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Compre Girinhas ou complete missões para ver as informações de validade aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* ✅ CABEÇALHO DESKTOP APENAS (hidden sm:grid) */}
              <div className="hidden sm:grid grid-cols-6 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
                <span>Tipo</span>
                <span>Data</span>
                <span>Quantidade</span>
                <span>Expira em</span>
                <span>Status</span>
                <span>Extensão</span>
              </div>
              
              {expiracao.detalhes_expiracao
                .sort((a, b) => a.dias_restantes - b.dias_restantes)
                .map((item, index) => (
                <div key={index}>
                  {/* ✅ LAYOUT MOBILE (padrão) */}
                  <div className="block sm:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                    {/* Header do card mobile */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIconePorTipo(item.tipo)}
                        <span className="font-medium text-gray-800">
                          {formatarTipo(item.tipo)}
                        </span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-medium flex items-center gap-1 ${getCorPorDias(item.dias_restantes)}`}
                      >
                        {getIconePorDias(item.dias_restantes)}
                        {item.dias_restantes <= 7 ? 'Urgente' : 
                         item.dias_restantes <= 30 ? 'Atenção' : 'Normal'}
                      </Badge>
                    </div>

                    {/* Informações principais */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Quantidade</span>
                        <span className="font-medium text-gray-800">
                          {Number(item.valor).toFixed(0)} Girinhas
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Expira em</span>
                        <span className="font-medium text-gray-800">
                          {item.dias_restantes} dia{item.dias_restantes !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Data</span>
                        <span className="text-gray-700">
                          {formatarData(item.data_compra)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Extensão</span>
                        {item.ja_estendida ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Estendida
                          </Badge>
                        ) : item.pode_estender ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Elegível
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            N/A
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ LAYOUT DESKTOP (hidden no mobile, grid no sm+) */}
                  <div className="hidden sm:grid grid-cols-6 gap-2 items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      {getIconePorTipo(item.tipo)}
                      <span className="text-sm font-medium text-gray-700">
                        {formatarTipo(item.tipo)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {formatarData(item.data_compra)}
                    </span>
                    <span className="font-medium text-gray-800">
                      {Number(item.valor).toFixed(0)} Girinhas
                    </span>
                    <span className="text-sm">
                      {item.dias_restantes} dia{item.dias_restantes !== 1 ? 's' : ''}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-medium flex items-center gap-1 ${getCorPorDias(item.dias_restantes)}`}
                    >
                      {getIconePorDias(item.dias_restantes)}
                      {item.dias_restantes <= 7 ? 'Urgente' : 
                       item.dias_restantes <= 30 ? 'Atenção' : 'Normal'}
                    </Badge>
                    <div className="text-xs">
                      {item.ja_estendida ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Estendida
                        </Badge>
                      ) : item.pode_estender ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          Elegível
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          N/A
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {expiracao.proxima_expiracao && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Próxima expiração:</strong> {formatarData(expiracao.proxima_expiracao)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                🔒 Sistema seguro: extensões rastreadas e limitadas a uma por transação
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidadeGirinhasSegura;
