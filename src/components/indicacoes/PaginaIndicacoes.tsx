import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BadgeCheck,
  CheckCircle,
  Gift,
  Share2,
  Shirt,
  Trophy,
  TrendingUp,
  Users,
  Link,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { useTiposTransacao } from '@/hooks/useTiposTransacao';
import { toast } from 'sonner';

const parseBonus = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const InfoPill = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 px-4 py-3 shadow-[0_18px_45px_-30px_rgba(17,24,39,0.18)]">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">
        {label}
      </p>
      <p className="text-lg font-black text-foreground">{value}</p>
    </div>
  </div>
);

const PaginaIndicacoes = () => {
  const {
    indicacoes,
    indicados,
    loading,
    error,
    compartilharIndicacao,
    obterEstatisticas,
  } = useIndicacoes();
  const { obterConfigTipo } = useTiposTransacao();
  const [estatisticas, setEstatisticas] = React.useState<any>(null);

  React.useEffect(() => {
    const carregar = async () => {
      const stats = await obterEstatisticas();
      setEstatisticas(stats);
    };
    carregar();
  }, [obterEstatisticas]);

  const bonusCadastroIndicacao = parseBonus(
    obterConfigTipo('bonus_indicacao_cadastro')?.valor_padrao,
    10,
  );
  const bonusPrimeiroItem = parseBonus(
    obterConfigTipo('bonus_indicacao_primeiro_item')?.valor_padrao,
    10,
  );
  const bonusPrimeiraCompra = parseBonus(
    obterConfigTipo('bonus_indicacao_primeira_compra')?.valor_padrao,
    30,
  );
  const bonusCadastroIndicado = parseBonus(
    obterConfigTipo('bonus_indicacao_cadastro_indicado')?.valor_padrao,
    25,
  );
  const totalPossivel = bonusCadastroIndicacao + bonusPrimeiroItem + bonusPrimeiraCompra;

  const handleCompartilhar = async () => {
    try {
      await compartilharIndicacao();
      toast.success('Link copiado!', {
        description: 'Agora é só enviar para as amigas.',
      });
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <LoadingSpinner size="xl" text="Carregando indicações..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-[2rem] border border-red-200 bg-red-50/70">
        <CardContent className="py-8">
          <p className="text-center font-medium text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(251,113,133,0.14),rgba(255,255,255,0.92),rgba(251,191,36,0.12))] shadow-[0_28px_70px_-34px_rgba(244,63,94,0.28)]">
        <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-7 lg:py-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-pink-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-pink-700">
                Indique e ganhe
              </Badge>
              <Badge className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-800">
                3 etapas
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-foreground/70 shadow-sm">
                <Link className="h-3.5 w-3.5 text-pink-500" />
                Um link, três momentos de bônus
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
                Compartilhe seu link e acompanhe os ganhos.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-foreground/65 sm:text-base">
                Sua amiga entra pelo seu link e já recebe bônus.
                Você também ganha Girinhas quando ela concluir o cadastro, publicar o primeiro item e fizer a primeira compra.
              </p>
              <p className="text-sm font-semibold text-foreground/70">
                No cadastro, ela já começa com +{bonusCadastroIndicado} Girinhas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleCompartilhar}
                className="h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 px-5 font-bold text-white shadow-[0_18px_35px_-14px_rgba(244,63,94,0.55)] hover:from-pink-500 hover:via-rose-500 hover:to-amber-400"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Copiar link
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-white/80 bg-white/75 px-5 font-bold text-foreground/80 hover:bg-white"
                onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}
              >
                Ver minhas indicações
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPill label="Cadastro" value={`+${bonusCadastroIndicacao}`} icon={Gift} />
              <InfoPill label="Primeiro item" value={`+${bonusPrimeiroItem}`} icon={Shirt} />
              <InfoPill label="Primeira compra" value={`+${bonusPrimeiraCompra}`} icon={Trophy} />
            </div>
          </div>

          <div className="grid gap-3">
            <Card className="border-white/80 bg-white/85 shadow-[0_22px_60px_-30px_rgba(244,63,94,0.22)]">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 text-white">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-pink-600">
                      Ganho máximo
                    </p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-foreground">
                      +{totalPossivel} G$
                    </p>
                    <p className="text-sm text-foreground/60">
                      Se ela concluir as 3 etapas, esse é o total que você pode receber.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] bg-pink-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-700">
                    Conversão
                  </p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    1 G$ = R$ 1,00
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/90">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900">
                      Resumo rápido
                    </p>
                    <p className="text-sm text-emerald-900/70">
                      Você já gerou {estatisticas?.totalBonusRecebido ?? 0} Girinhas em bônus.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoPill label="Indicações" value={estatisticas?.totalIndicacoes ?? 0} icon={Users} />
        <InfoPill label="Girinhas pagas" value={estatisticas?.totalBonusRecebido ?? 0} icon={Gift} />
        <InfoPill label="Cadastros" value={estatisticas?.bonusCadastro ?? 0} icon={CheckCircle} />
        <InfoPill label="Primeiras compras" value={estatisticas?.bonusPrimeiraCompra ?? 0} icon={Trophy} />
      </div>

      <Card className="overflow-hidden border-white/80 bg-white/85 shadow-[0_24px_70px_-34px_rgba(17,24,39,0.18)]">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Minhas indicações
              </h2>
              <p className="text-sm text-foreground/55">
                Lista de amigas que entraram pelo seu link.
              </p>
            </div>
          </div>

          {indicacoes.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-foreground/10 bg-foreground/[0.02] px-6 py-8 text-center">
              <Users className="mx-auto h-10 w-10 text-foreground/20" />
              <p className="mt-3 text-base font-bold text-foreground">
                Você ainda não indicou ninguém
              </p>
              <p className="mt-1 text-sm text-foreground/55">
                Copie o link e comece a gerar bônus.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {indicacoes.map((indicacao) => (
                <div
                  key={indicacao.id}
                  className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={indicacao.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-pink-100 text-pink-700">
                        {indicacao.profiles?.nome?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">
                        {indicacao.profiles?.nome || 'Usuária'}
                      </p>
                      <p className="text-sm text-foreground/55">
                        Entrou em{' '}
                        {format(new Date(indicacao.created_at), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {indicacao.bonus_cadastro_pago && (
                      <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                        Cadastro
                      </Badge>
                    )}
                    {indicacao.bonus_primeiro_item_pago && (
                      <Badge className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-100">
                        Item
                      </Badge>
                    )}
                    {indicacao.bonus_primeira_compra_pago && (
                      <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 hover:bg-amber-100">
                        Compra
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {indicados.length > 0 && (
        <Card className="overflow-hidden border-white/80 bg-white/85 shadow-[0_24px_70px_-34px_rgba(59,130,246,0.14)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">
                  Quem me indicou
                </p>
                <p className="text-sm text-foreground/55">
                  {indicados.length > 0
                    ? `${indicados[0].profiles?.nome || 'Uma amiga'} te trouxe para o GiraMãe.`
                    : 'Nenhuma informação disponível.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaginaIndicacoes;
