import React, { useEffect, useState } from 'react';
import { Coins, BadgeCheck, PartyPopper, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const BONUS_AMOUNT = 25;
const STORAGE_PREFIX = 'welcome-bonus-seen';
const CONFETTI_PIECES = [
  'left-4 top-6 h-3 w-3 bg-pink-400',
  'right-8 top-10 h-2.5 w-2.5 bg-amber-400',
  'left-10 bottom-8 h-2 w-2 bg-emerald-400',
  'right-20 bottom-6 h-3 w-3 bg-fuchsia-400',
  'left-1/2 top-4 h-2.5 w-2.5 -translate-x-1/2 bg-rose-400',
];

const WelcomeBonusModal: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [nome, setNome] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const avaliarElegibilidade = async () => {
      if (authLoading) return;

      if (!user?.id) {
        if (isMounted) {
          setOpen(false);
          setChecking(false);
          setClaiming(false);
          setNome('');
        }
        return;
      }

      if (isMounted) {
        setChecking(true);
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('ritual_completo, nome')
          .eq('id', user.id)
          .single();

        if (error || !profile || !isMounted) {
          return;
        }

        setNome(profile.nome || user.user_metadata?.full_name || 'mamãe');

        const jaMostrou =
          Boolean(profile.ritual_completo) ||
          localStorage.getItem(`${STORAGE_PREFIX}:${user.id}`) === '1';

        if (jaMostrou) {
          return;
        }

        if (isMounted) {
          setClaiming(true);
        }

        const { data: bonusExistente } = await (supabase as any)
          .from('ledger_transacoes')
          .select('transacao_id')
          .eq('user_id', user.id)
          .eq('tipo', 'bonus_cadastro')
          .limit(1);

        if (!bonusExistente || bonusExistente.length === 0) {
          const { error: bonusError } = await (supabase as any).rpc(
            'ledger_bonus_cadastro',
            { p_user_id: user.id },
          );

          if (bonusError) {
            throw bonusError;
          }
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ritual_completo: true,
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        localStorage.setItem(`${STORAGE_PREFIX}:${user.id}`, '1');

        if (isMounted) {
          setOpen(true);
        }
      } catch (error) {
        console.error('Erro ao preparar bônus de boas-vindas:', error);
      } finally {
        if (isMounted) {
          setClaiming(false);
          setChecking(false);
        }
      }
    };

    avaliarElegibilidade();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.id, user?.user_metadata?.full_name]);

  if (authLoading || !user || checking || claiming) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-1rem)] overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[640px]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-[0_35px_90px_-20px_rgba(236,72,153,0.38)] sm:rounded-[2.25rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_55%)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 via-amber-400 to-fuchsia-400" />
          {CONFETTI_PIECES.map((piece, index) => (
            <span
              key={`${piece}-${index}`}
              className={`absolute z-0 hidden rounded-full opacity-80 ${piece} animate-bounce sm:block`}
              style={{ animationDelay: `${index * 140}ms` }}
            />
          ))}

          <DialogHeader className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <Badge className="w-fit rounded-full border border-pink-200 bg-pink-100 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-pink-700 shadow-sm sm:px-4 sm:text-[10px] sm:tracking-[0.24em]">
                  Presente liberado
                </Badge>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 text-white shadow-[0_18px_35px_-12px_rgba(244,63,94,0.7)] sm:h-14 sm:w-14 sm:rounded-3xl">
                    <PartyPopper className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500 sm:text-xs sm:tracking-[0.2em]">
                    <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Boas-vindas especiais
                  </div>
                </div>
                <DialogTitle className="max-w-md text-2xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">
                  Bem-vinda, {nome}!
                </DialogTitle>
                <DialogDescription className="max-w-[34rem] text-xs leading-relaxed text-foreground/65 sm:text-sm">
                  Seu cadastro foi concluído com sucesso e agora você começa com um crédito de boas-vindas para explorar a plataforma com mais liberdade.
                </DialogDescription>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/75 p-2 text-foreground/40 shadow-sm transition-all hover:bg-white hover:text-foreground hover:shadow-md sm:p-2.5"
                aria-label="Fechar modal de boas-vindas"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="relative z-10 px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr] md:gap-4">
              <div className="rounded-[1.25rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_45px_-24px_rgba(236,72,153,0.35)] backdrop-blur-sm sm:rounded-[1.75rem] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200 sm:h-14 sm:w-14 sm:rounded-[1.25rem]">
                    <PartyPopper className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 sm:text-xs sm:tracking-[0.24em]">
                      Você ganhou
                    </p>
                    <p className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                      {BONUS_AMOUNT} Girinhas
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 p-3 text-white shadow-lg shadow-pink-200 sm:mt-5 sm:rounded-[1.5rem] sm:p-4">
                  <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 sm:h-8 sm:w-8" />
                    <div>
                      <p className="text-xs font-semibold opacity-90 sm:text-sm">
                        Cada Girinha equivale a
                      </p>
                      <p className="text-2xl font-black tracking-tight sm:text-3xl">
                        R$ 1,00
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-[1rem] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-amber-900 sm:mt-4 sm:rounded-[1.25rem] sm:px-4 sm:py-3 sm:text-sm">
                  <span className="font-black">Crédito inicial ativado:</span> use suas Girinhas para reservar, negociar e aproveitar melhor a comunidade.
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-4 shadow-[0_18px_45px_-24px_rgba(16,185,129,0.35)] sm:rounded-[1.75rem] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 sm:h-11 sm:w-11">
                    <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <p className="text-xs font-bold text-emerald-900 sm:text-sm">
                    Seu saldo já foi atualizado
                  </p>
                </div>
                <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-emerald-950/80 sm:mt-4 sm:space-y-3 sm:text-sm">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                    Comece explorando o feed com seu bônus disponível.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                    Cada Girinha representa R$ 1,00 dentro do sistema.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                    Esse presente aparece só uma vez, no seu primeiro acesso.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row">
              <Button
                onClick={() => setOpen(false)}
                className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 px-4 text-sm font-bold text-white shadow-[0_18px_35px_-14px_rgba(244,63,94,0.75)] transition-transform hover:scale-[1.01] hover:from-pink-500 hover:via-rose-500 hover:to-amber-400 sm:h-12 sm:text-base"
              >
                Começar a explorar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBonusModal;
