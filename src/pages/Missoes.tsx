import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users, Gift, Clock, CheckCircle, Star, Zap, Eye, EyeOff } from 'lucide-react';
import { useMissoes } from '@/hooks/useMissoes';
import { useMissoesSegmentadas } from '@/hooks/useMissoesSegmentadas';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import Footer from '@/components/shared/Footer';
import { MissaoInstagramCard } from '@/components/missoes/MissaoInstagramCard';
import { analytics } from '@/lib/analytics';
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

const MissionCard: React.FC<{ missao: any; onColetar: (id: string) => void; isCollecting: boolean }> = ({
  missao,
  onColetar,
  isCollecting
}) => {
  const getIconByCategory = (categoria: string) => {
    switch (categoria) {
      case 'perfil': return Star;
      case 'publicacao': return Target;
      case 'venda': return Gift;
      case 'compra': return Gift;
      case 'indicacao': return Users;
      default: return Trophy;
    }
  };

  const Icon = getIconByCategory(missao.categoria);
  const progressPercentual = Math.round((missao.progresso_atual / missao.progresso_necessario) * 100);
  const isColetada = missao.status === 'coletada';

  return (
    <div className={`premium-card bg-white/40 backdrop-blur-xl border-white/60 rounded-[2.5rem] p-6 shadow-xl transition-all duration-500 hover:scale-[1.02] ${isColetada ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${missao.status === 'completa' ? 'bg-emerald-50 text-emerald-600' :
          missao.status === 'coletada' ? 'bg-foreground/5 text-foreground/20' : 'bg-primary/5 text-primary'
          }`}>
          <Icon className="w-8 h-8" />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-black text-foreground tracking-tight truncate">{missao.titulo}</h3>
            <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/10 text-primary font-black uppercase text-[8px] tracking-widest bg-primary/5 shrink-0">
              +{missao.recompensa_girinhas} G$
            </Badge>
          </div>
          <p className="text-xs font-medium text-foreground/40 leading-relaxed italic line-clamp-2">"{missao.descricao}"</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30">
              <span>{missao.progresso_atual} / {missao.progresso_necessario}</span>
              <span>{progressPercentual}%</span>
            </div>
            <div className="w-full bg-foreground/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${missao.status === 'completa' ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(progressPercentual, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-4 border-l border-primary/5">
          {missao.status === 'completa' ? (
            <Button
              size="sm"
              onClick={() => onColetar(missao.id)}
              disabled={isCollecting}
              className="founders-button px-6 h-14 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
            >
              {isCollecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex flex-col items-center">
                  <Gift className="w-5 h-5 mb-1" />
                  Coletar
                </div>
              )}
            </Button>
          ) : isColetada ? (
            <div className="flex flex-col items-center text-foreground/20">
              <CheckCircle className="w-6 h-6 mb-1" />
              <span className="text-[8px] font-black uppercase tracking-widest">Coletada</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-primary/40">
              <Clock className="w-6 h-6 mb-1" />
              <span className="text-[8px] font-black uppercase tracking-widest">Ativa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MissaoSegmentadaCard: React.FC<{ missao: any; onColetar: (id: string) => void; onExecutarAcao: (missaoId: string, eventoId: string) => void; isCollecting: boolean }> = ({
  missao,
  onColetar,
  onExecutarAcao,
  isCollecting
}) => {
  const progressPercentual = Math.round((missao.progresso_atual / missao.progresso_necessario) * 100);
  const temEventos = missao.acoes_eventos && missao.acoes_eventos.length > 0;
  const isColetada = missao.status === 'coletada';

  return (
    <div className={`premium-card bg-purple-50/30 backdrop-blur-xl border-purple-200/50 rounded-[2.5rem] p-6 shadow-xl border-l-[6px] border-l-purple-500 transition-all duration-500 hover:scale-[1.02] ${isColetada ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
          <Zap className="w-8 h-8" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-foreground tracking-tight">{missao.titulo}</h3>
              <Badge className="bg-purple-500/10 text-purple-600 border-none rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Especial</Badge>
            </div>
            <p className="text-xs font-medium text-foreground/40 italic">"{missao.descricao}"</p>
          </div>

          {temEventos && !isColetada && (
            <div className="flex flex-wrap gap-2">
              {missao.acoes_eventos.slice(0, 2).map((evento: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl border-purple-200 text-purple-600 font-bold text-[10px] uppercase tracking-widest hover:bg-purple-50 transition-colors"
                  onClick={() => onExecutarAcao(missao.id, evento.id)}
                >
                  {evento.tipo_evento === 'navigate_to_page' && '🔗'}
                  {evento.tipo_evento === 'external_link' && '🌐'}
                  {evento.tipo_evento === 'trigger_notification' && '🔔'}
                  {evento.tipo_evento === 'open_modal' && '📋'}
                  <span className="ml-2">{evento.parametros?.titulo || evento.tipo_evento}</span>
                </Button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-purple-400">
              <span>{missao.progresso_atual} / {missao.progresso_necessario}</span>
              <span>{progressPercentual}%</span>
            </div>
            <div className="w-full bg-purple-200/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                style={{ width: `${Math.min(progressPercentual, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 pl-4 border-l border-purple-100 flex flex-col items-center gap-3">
          <Badge className="bg-purple-100 text-purple-600 border-none px-3 py-1 font-black text-[10px]">+{missao.recompensa_girinhas} G$</Badge>

          {missao.status === 'completa' ? (
            <Button
              onClick={() => onColetar(missao.id)}
              disabled={isCollecting}
              className="founders-button bg-purple-600 px-6 h-14 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-200"
            >
              {isCollecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex flex-col items-center">
                  <Gift className="w-5 h-5 mb-1" />
                  Coletar
                </div>
              )}
            </Button>
          ) : isColetada ? (
            <div className="flex flex-col items-center text-foreground/20">
              <CheckCircle className="w-6 h-6 mb-1" />
              <span className="text-[8px] font-black uppercase tracking-widest">Finalizada</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-purple-300">
              <Zap className="w-6 h-6 mb-1 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest">Ativa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Missoes: React.FC = () => {
  const [mostrarColetadas, setMostrarColetadas] = useState(false);

  const {
    missoes: missoesSimples,
    isLoading: loadingSimples,
    coletarRecompensa
  } = useMissoes();

  const {
    missoes: missoesSegmentadas,
    isLoading: loadingSegmentadas,
    executarAcao,
    coletarRecompensaSegmentada
  } = useMissoesSegmentadas();

  const todasMissoes = [...missoesSimples, ...missoesSegmentadas];
  const missoesFiltradas = mostrarColetadas
    ? todasMissoes
    : todasMissoes.filter(m => m.status !== 'coletada');

  const totalAtivas = todasMissoes.filter(m => m.status !== 'coletada').length;
  const totalColetadas = todasMissoes.filter(m => m.status === 'coletada').length;

  const isLoading = loadingSimples || loadingSegmentadas;

  const handleColetarRecompensa = async (missaoId: string) => {
    const missaoSegmentada = missoesSegmentadas.find(m => m.id === missaoId);
    const missao = missaoSegmentada || missoesSimples.find(m => m.id === missaoId);

    if (missao) {
      analytics.missions.complete(
        missao.id,
        missao.tipo_missao || 'regular',
        0
      );
    }

    if (missaoSegmentada) {
      await coletarRecompensaSegmentada.mutateAsync(missaoId);
    } else {
      await coletarRecompensa.mutateAsync(missaoId);
    }
  };

  const handleExecutarAcao = async (missaoId: string, eventoId: string) => {
    await executarAcao.mutateAsync({ missaoId, eventoId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.missoes()} />
      <Header />

      <main className="container mx-auto pt-32 pb-24 px-4 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm mb-4">
            <Trophy className="w-4 h-4" /> Centro de Conquistas
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
            Missões <span className="text-glow text-primary italic">GiraMãe</span>
          </h1>
          <p className="text-foreground/40 font-medium max-w-lg mx-auto leading-relaxed">Complete desafios, espalhe o amor em nossa rede e ganhe Girinhas para seus próximos garimpos!</p>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <p className="text-4xl font-black text-foreground tracking-tighter">{totalAtivas}</p>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Disponíveis</p>
            </div>
            <div className="w-px h-12 bg-primary/10" />
            <div className="text-center">
              <p className="text-4xl font-black text-emerald-600 tracking-tighter">{totalColetadas}</p>
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Completas</p>
            </div>
          </div>
        </div>

        {totalColetadas > 0 && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setMostrarColetadas(!mostrarColetadas)}
              className="group flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/40 border border-white/60 rounded-full transition-all duration-300"
            >
              {mostrarColetadas ? <EyeOff className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" /> : <Eye className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />}
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors">
                {mostrarColetadas ? 'Ocultar completadas' : 'Ver completadas'}
              </span>
            </button>
          </div>
        )}

        <div className="space-y-6">
          {missoesFiltradas.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl border border-dashed border-primary/20 rounded-[3rem] py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-12 h-12 text-primary/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground tracking-tight">Tudo em dia por aqui!</h3>
                <p className="text-sm font-medium text-foreground/30 max-w-xs mx-auto">Você já completou todos os desafios ativos. Fique de olho, novas missões surgem a qualquer momento!</p>
              </div>
              {totalColetadas > 0 && !mostrarColetadas && (
                <Button variant="outline" className="rounded-full px-8 h-12 border-primary/10 text-primary uppercase font-black text-[10px] tracking-widest" onClick={() => setMostrarColetadas(true)}>
                  Rever Minhas Conquistas
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {missoesFiltradas.map(missao => {
                const isSegmentada = missoesSegmentadas.some(m => m.id === missao.id);
                const isInstagram = missao.titulo?.toLowerCase().includes('instagram') ||
                  missao.tipo_missao === 'social';

                if (isInstagram && missao.titulo?.toLowerCase().includes('instagram')) {
                  return (
                    <div key={missao.id} className="transition-transform duration-500 hover:scale-[1.02]">
                      <MissaoInstagramCard
                        onColetar={handleColetarRecompensa}
                        isCollecting={coletarRecompensa.isPending || coletarRecompensaSegmentada.isPending}
                      />
                    </div>
                  );
                }

                if (isSegmentada) {
                  return (
                    <div key={missao.id} className="transition-transform duration-500 hover:scale-[1.02]">
                      <MissaoSegmentadaCard
                        missao={missao}
                        onColetar={handleColetarRecompensa}
                        onExecutarAcao={handleExecutarAcao}
                        isCollecting={coletarRecompensaSegmentada.isPending}
                      />
                    </div>
                  );
                }

                return (
                  <div key={missao.id} className="transition-transform duration-500 hover:scale-[1.02]">
                    <MissionCard
                      missao={missao}
                      onColetar={handleColetarRecompensa}
                      isCollecting={coletarRecompensa.isPending}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <QuickNav />
      <Footer />
    </div>
  );
};

export default () => (
  <AuthGuard>
    <Missoes />
  </AuthGuard>
);
