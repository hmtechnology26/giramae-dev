import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, BicepsFlexed, X, ChevronDown, Home, Plus, Package, Rss, Trophy, Megaphone, Users, Wallet, HeartHandshake, Heart, UserCheck, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SaldoHeader from './SaldoHeader';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { buildAvatarUrl } from "@/lib/cdn";
import UserSearch from '@/components/shared/UserSearch';

/* ---------------- NAVLINK COMPONENT ------------------ */

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all duration-300",
        isActive ? "text-primary font-bold" : "text-foreground/60 hover:text-primary"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", isActive && "text-glow")} />
      <span className="text-[12px] tracking-tight whitespace-nowrap">{children}</span>
    </Link>
  );
};


/* ---------------- DESKTOP NAVIGATION ------------------ */

const DesktopNav = () => {
  return (
    <nav className="flex items-center mx-2 shrink-0">
      <div className="flex items-center gap-2 lg:gap-2.5 whitespace-nowrap flex-nowrap shrink-0">
        <NavLink to="/feed" icon={Home}>Feed</NavLink>
        <NavLink to="/publicar" icon={Plus}>Publicar</NavLink>
        <NavLink to="/minhas-reservas" icon={Package}>Reservas</NavLink>

        <NavLink to="/carteira" icon={Wallet}>Carteira</NavLink>
        <NavLink to="/maes-seguidas" icon={UserCheck}>Mães</NavLink>

        <NavLink to="/missoes" icon={Trophy}>Missões</NavLink>
        <NavLink to="/indicacoes" icon={Users}>Indicações</NavLink>
        <NavLink to="/apoiadores" icon={BicepsFlexed}>Apoiadores</NavLink>
      </div>
    </nav>
  );
};

/* ---------------------- HEADER ------------------------ */

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cadastroIncompleto, setCadastroIncompleto] = useState(false);
  const [loadingCadastroStatus, setLoadingCadastroStatus] = useState(true);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const shouldSkipProfile = location.pathname === '/cadastro';
  const { profile } = shouldSkipProfile ? { profile: null } : useProfile();

  /* ------ VERIFICAR STATUS DO CADASTRO ------ */
  useEffect(() => {
    const checkCadastroStatus = async () => {
      if (!user || shouldSkipProfile) {
        setLoadingCadastroStatus(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('cadastro_status')
          .eq('id', user.id)
          .maybeSingle();

        if (data) setCadastroIncompleto(data.cadastro_status === 'incompleto');
        else setCadastroIncompleto(true);
      } catch {
        setCadastroIncompleto(true);
      } finally {
        setLoadingCadastroStatus(false);
      }
    };

    checkCadastroStatus();
  }, [user, shouldSkipProfile]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profile?.avatar_url]);

  /* SE O HEADER NÃO DEVE APARECER */
  if (user && cadastroIncompleto && location.pathname === '/cadastro') return null;

  const shouldHideMenus = location.pathname === '/cadastro';

  /* LOGOUT */
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Até logo!');
      navigate('/auth');
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  const desktopNavItems = [
    { label: 'Meu Perfil', path: '/perfil', icon: User },
    { label: 'Carteira', path: '/carteira', icon: Wallet },
    { label: 'Favoritos', path: '/favoritos', icon: Heart },
    { label: 'Seguindo', path: '/maes-seguidas', icon: UserCheck },
    { label: 'Reservas', path: '/minhas-reservas', icon: Package },
    { label: 'Indicações', path: '/indicacoes', icon: Users },
    { label: 'Apoiadores', path: '/apoiadores', icon: HeartHandshake },
    { label: 'Blog', path: '/blog', icon: Rss },
    { label: 'Parcerias', path: '/parcerias', icon: HeartHandshake },];

  /* ------------------ HEADER DESLOGADO ------------------ */

  if (!user) {
    return (
      <header className="w-full fixed top-2 left-3 right-3 md:left-6 md:right-6 z-50 rounded-full mx-auto max-w-6xl transition-all duration-500">
        <div className="bg-white/60 backdrop-blur-3xl border border-white/80 rounded-full px-4 md:px-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center h-18 md:h-20">
            <Link to="/" className="flex items-center group transition-all duration-500">
              <img src="/giramae_logo.png" alt="Logo" className="h-[36px] md:h-[60px] w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            </Link>

            <div className="flex items-center gap-4 md:gap-6">
              <Link to="/login" className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all">Entrar</Link>
              <Link to="/auth">
                <Button className="founders-button rounded-full px-7 md:px-9 h-10 md:h-11 text-[11px] md:text-[12px] font-black uppercase tracking-[0.1em] shadow-xl shadow-primary/20">
                  Começar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* ------------------ HEADER LOGADO ------------------ */

  return (
    <>
      <header className="fixed top-1 left-3 right-3 md:left-6 md:right-6 z-40 rounded-full mx-auto max-w-7xl transition-all duration-500">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/90 rounded-full px-4 md:px-8 shadow-[0_32px_64px_-16px_rgba(235,51,148,0.12)]">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center h-20 gap-3">
              {/* -------------- LOGO -------------- */}
              <Link to="/feed" className="flex items-center transition-all duration-500 active:scale-95 group shrink-0 pr-2">
                <img src="/giramae_logo.png" alt="Logo" className="h-[48px] md:h-[54px] w-auto object-contain drop-shadow-sm group-hover:brightness-110 transition-all" />
              </Link>

              {/* -------------- MENU CENTRAL -------------- */}
              {!shouldHideMenus && (
                <div className="hidden md:flex items-center justify-end min-w-0 gap-2 lg:gap-3 justify-self-end">
                  <div className="min-w-0 overflow-hidden">
                    <DesktopNav />
                  </div>
                  <div className="w-[110px] lg:w-[125px] xl:w-[145px] 2xl:w-[170px] shrink-0">
                    <UserSearch
                      onSelectUser={(userId) => navigate(`/perfil/${userId}`)}
                      placeholder="Buscar mães..." className=" placeholder:text-[9px] text-[9px] -mr-4"
                    />
                  </div>
                </div>
              )}

              {/* -------------- LADO DIREITO -------------- */}
              <div className="hidden md:flex items-center space-x-3 xl:space-x-4 shrink-0 justify-self-end pl-2">
                {!shouldHideMenus && <SaldoHeader />}
                {!shouldHideMenus && <div className="scale-90"><NotificationBell /></div>}

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-muted rounded-full px-2 h-10">
                      {profile?.avatar_url && !avatarLoadError ? (
                        <img
                          src={buildAvatarUrl(profile.avatar_url)}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-primary/10 object-cover"
                          onError={() => setAvatarLoadError(true)}
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary/60" />
                      )}
                      <ChevronDown className="w-3 h-3 opacity-30" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="glass border-primary/5 mt-2 min-w-[200px] p-1.5 rounded-xl shadow-lg">
                    {!shouldHideMenus && (
                      <>
                        <DropdownMenuItem className="hover:bg-primary/5 cursor-pointer rounded-lg flex gap-3 py-2 text-sm" onClick={() => navigate('/perfil')}>
                          <User className="w-4 h-4 text-primary" />
                          <span>Meu Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-primary/5 cursor-pointer rounded-lg flex gap-3 py-2 text-sm" onClick={() => navigate('/configuracoes')}>
                          <Settings className="w-4 h-4 text-primary" />
                          <span>Configurações</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer rounded-lg flex gap-3 py-2 text-sm font-bold mt-1" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* -------------- MOBILE BUTTON -------------- */}
              <div className="md:hidden flex items-center gap-2">
                {!shouldHideMenus && <SaldoHeader />}
                {!shouldHideMenus && <div className="scale-90"><NotificationBell /></div>}
                {!shouldHideMenus ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 h-10 w-10"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10" onClick={handleSignOut}>
                    <X className="h-5 w-5 text-primary" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU - COMPACT */}
      {mobileMenuOpen && !shouldHideMenus && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/50 backdrop-blur-sm transition-all"
          onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed right-4 left-4 top-20 bottom-24 w-auto max-w-[calc(100vw-2rem)] glass-dark rounded-3xl shadow-xl overflow-hidden border border-primary/10 flex flex-col sm:left-auto sm:w-72 sm:max-w-none"
            onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-primary/5 flex items-center gap-4 bg-primary/5">
              {profile?.avatar_url && !avatarLoadError ? (
                <img
                  src={buildAvatarUrl(profile.avatar_url)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base text-foreground truncate">{profile?.nome || "Mamãe"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{profile?.email}</span>
              </div>
            </div>

            <nav className="p-4 space-y-3 flex-grow overflow-y-auto">
              <UserSearch
                mode="flow"
                onSelectUser={(userId) => {
                  setMobileMenuOpen(false);
                  navigate(`/perfil/${userId}`);
                }}
                placeholder="Buscar mães..."
              />

              <div className="space-y-1">
                {desktopNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 py-3 px-4 rounded-xl transition-all",
                        isActive ? "bg-primary text-white shadow-md shadow-primary/10" : "text-foreground/70 hover:bg-primary/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "opacity-100" : "opacity-40")} />
                      <span className="font-bold text-xs tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 mt-auto border-t border-primary/5 bg-background/40">
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="flex items-center gap-4 w-full py-3 px-4 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold text-xs">Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
