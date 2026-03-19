import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Gift, 
  Share2, 
  TrendingUp, 
  Calendar,
  Trophy,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { useTiposTransacao } from '@/hooks/useTiposTransacao';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const PaginaIndicacoes = () => {
  const { 
    indicacoes, 
    indicados, 
    loading, 
    error, 
    compartilharIndicacao,
    obterEstatisticas 
  } = useIndicacoes();

  const { obterConfigTipo } = useTiposTransacao();
  const [estatisticas, setEstatisticas] = React.useState<any>(null);

  React.useEffect(() => {
    const carregarEstatisticas = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    carregarEstatisticas();
  }, [obterEstatisticas]);

  const handleCompartilhar = async () => {
    try {
      await compartilharIndicacao();
      toast.success('Link de indicação copiado!', {
        description: 'Compartilhe com suas amigas para ganharem bônus juntas!'
      });
    } catch (error) {
      toast.error('Erro ao compartilhar link');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <LoadingSpinner size="xl" text="Carregando indicações..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="premium-card rounded-[2.5rem] border border-red-500/20 bg-red-50/40">
        <CardContent className="pt-6">
          <p className="text-red-600 text-center font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">

      {/* Como funciona o sistema de indicações */}
      <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-purple-50/60 via-pink-50/50 to-orange-50/50 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-foreground font-black tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <span>Mãe, vem ver que vantagem! 💜</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Para você que indica */}
            <div className="premium-card bg-white/60 border border-purple-200/40 rounded-[2rem] p-6">
              <h3 className="font-black text-purple-700 mb-4 flex items-center gap-2 text-[11px] uppercase tracking-widest">
                <Users className="w-5 h-5" />
                Para você que indica:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_cadastro')?.valor_padrao || 10} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela se cadastrar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_primeiro_item')?.valor_padrao || 10} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela publicar o primeiro item</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">🛍️</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_primeira_compra')?.valor_padrao || 30} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">quando ela fizer a primeira compra</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 px-4 py-3 bg-purple-50/60 border border-purple-200/40 rounded-2xl">
                <p className="text-sm font-medium text-purple-700">
                  Total possível: até {
                    (parseFloat(String(obterConfigTipo('bonus_indicacao_cadastro')?.valor_padrao || '10')) +
                     parseFloat(String(obterConfigTipo('bonus_indicacao_primeiro_item')?.valor_padrao || '10')) +
                     parseFloat(String(obterConfigTipo('bonus_indicacao_primeira_compra')?.valor_padrao || '30'))).toFixed(0)
                  } Girinhas por amiga!
                </p>
              </div>
            </div>

            {/* Para sua amiga */}
            <div className="premium-card bg-white/60 border border-pink-200/40 rounded-[2rem] p-6">
              <h3 className="font-black text-pink-700 mb-4 flex items-center gap-2 text-[11px] uppercase tracking-widest">
                <Gift className="w-5 h-5" />
                Para sua amiga:
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <p className="font-medium text-gray-800">
                      +{obterConfigTipo('bonus_indicacao_cadastro_indicado')?.valor_padrao || 25} Girinhas
                    </p>
                    <p className="text-sm text-gray-600">de boas-vindas no cadastro</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-2xl">💝</div>
                  <div>
                    <p className="font-medium text-gray-800">Entrada VIP</p>
                    <p className="text-sm text-gray-600">direto na comunidade mais querida das mães</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 px-4 py-3 bg-pink-50/60 border border-pink-200/40 rounded-2xl">
                <p className="text-sm font-medium text-pink-700">
                  Ela já começa com {obterConfigTipo('bonus_indicacao_cadastro_indicado')?.valor_padrao || 25} Girinhas! 💖
                </p>
              </div>
            </div>
          </div>

          <div className="premium-card mt-2 p-6 bg-gradient-to-r from-yellow-50/70 to-orange-50/60 rounded-[2rem] border border-white/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">✨</div>
              <p className="font-semibold text-orange-800">Dica de mãe experiente:</p>
            </div>
            <p className="text-orange-700">
              Quanto mais amigas você indicar, mais Girinhas você ganha!
              Compartilha nos grupos das mães, no WhatsApp da escola...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="premium-card rounded-[2rem] border border-white/60 bg-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.totalIndicacoes}</p>
                  <p className="text-gray-600 text-sm">Indicações Feitas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card rounded-[2rem] border border-white/60 bg-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.totalBonusRecebido}</p>
                  <p className="text-gray-600 text-sm">Girinhas Ganhas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card rounded-[2rem] border border-white/60 bg-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.bonusCadastro}</p>
                  <p className="text-gray-600 text-sm">Cadastros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card rounded-[2rem] border border-white/60 bg-white/40">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{estatisticas.bonusPrimeiraCompra}</p>
                  <p className="text-gray-600 text-sm">Primeiras Compras</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compartilhar Link */}
      <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-gradient-to-r from-purple-50/60 to-pink-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <span>Compartilhar Link de Indicação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/60 font-medium mb-4">
            Compartilhe seu link de indicação e ganhe bônus quando suas amigas se juntarem ao GiraMãe!
          </p>
          <Button onClick={handleCompartilhar} className="founders-button w-full md:w-auto px-8 h-12 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
            <Copy className="w-4 h-4 mr-2" />
            Compartilhar Link
          </Button>
        </CardContent>
      </Card>

      {/* Minhas Indicações */}
      <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            Minhas Indicações ({indicacoes.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {indicacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Nenhuma indicação ainda</p>
              <p>Compartilhe seu link para começar a indicar amigas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {indicacoes.map((indicacao) => (
                <div 
                  key={indicacao.id} 
                  className="premium-card bg-white/40 border border-white/60 rounded-[2rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Avatar + Nome */}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={indicacao.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {indicacao.profiles?.nome?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{indicacao.profiles?.nome || 'Usuário'}</p>
                      <p className="text-sm text-gray-600">
                        Indicado em {format(new Date(indicacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Badges (AQUI É A MODIFICAÇÃO) */}
                  <div className="flex flex-col items-start gap-1">
                      {indicacao.bonus_cadastro_pago && (
                        <Badge 
                          variant="default" 
                          className="w-fit text-[11px] px-2 py-1 flex items-center gap-1">
                          Cadastro<span>✓</span>
                        </Badge>
                      )}
                    
                      {indicacao.bonus_primeiro_item_pago && (
                        <Badge 
                          variant="secondary" 
                          className="w-fit text-[11px] px-2 py-1 flex items-center gap-1">
                          1º Item<span>✓</span>
                        </Badge>
                      )}
                    
                      {indicacao.bonus_primeira_compra_pago && (
                        <Badge 
                          variant="outline" 
                          className="w-fit text-[11px] px-2 py-1 flex items-center gap-1">
                          1ª Compra<span>✓</span>
                        </Badge>
                      )}
                    </div>

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quem me indicou */}
      {indicados.length > 0 && (
        <Card className="premium-card rounded-[2.5rem] border border-white/60 bg-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-black tracking-tight text-foreground">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              Quem me indicou
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {indicados.map((indicacao) => (
                <div key={indicacao.id} className="premium-card bg-white/40 border border-white/60 rounded-[2rem] p-5 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={indicacao.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {indicacao.profiles?.nome?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{indicacao.profiles?.nome || 'Usuário'}</p>
                    <p className="text-sm text-gray-600">
                      Te indicou em {format(new Date(indicacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default PaginaIndicacoes;
