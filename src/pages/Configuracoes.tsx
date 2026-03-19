
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, User, Shield, TestTube, Building2, Map } from 'lucide-react';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { OneSignalSettings } from '@/components/notifications/OneSignalSettings';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useJornadas } from '@/hooks/useJornadas';
import { toast } from 'sonner';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import { useParceriasSociais } from '@/hooks/parcerias/useParceriasSociais';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { pageTitle } from '@/lib/pageTitle';
import SEOHead from '@/components/seo/SEOHead';

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { sendTestNotification } = useNotificationSystem();
  const { organizacoes, loading: loadingParcerias } = useParceriasSociais();
  const { jornadaAtiva, toggleJornadaAtiva, progressoPercentual, jornadasConcluidas, totalJornadas } = useJornadas();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'perfil';
  });

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar as configurações.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            </div>
          </div>
        </div>
        <QuickNav />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-25 to-blue-50 font-sans">
      <SEOHead title={pageTitle.configuracoes()} />
      <Header />

      <main className="container mx-auto pt-40 pb-24 px-4 max-w-4xl">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">
                Painel de <span className="text-glow text-primary italic">Ajustes</span>
              </h1>
              <p className="text-foreground/40 font-black uppercase tracking-widest text-[10px] mt-2 ml-1">Personalize sua experiência premium no GiraMãe</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/40 backdrop-blur-xl border border-white/60 p-1.5 rounded-[2rem] gap-1 shadow-lg h-16">
            <TabsTrigger value="perfil" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="parcerias" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Conexões</span>
            </TabsTrigger>
            <TabsTrigger value="privacidade" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.nome || 'Avatar'}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.nome || 'Nome não informado'}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile?.username ? `@${profile.username}` : 'Username não definido'}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => window.location.href = '/perfil/editar'}>
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card de Jornadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Jornada de Descobertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mostrar checklist de jornadas</p>
                    <p className="text-sm text-muted-foreground">
                      Complete tarefas e ganhe Girinhas
                    </p>
                  </div>
                  <Switch
                    checked={jornadaAtiva}
                    onCheckedChange={toggleJornadaAtiva}
                  />
                </div>

                {jornadaAtiva && totalJornadas > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{jornadasConcluidas}/{totalJornadas} ({progressoPercentual}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressoPercentual}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            {/* Seção para escolher QUAIS notificações receber */}
            <NotificationPreferences />

            {/* Seção para gerenciar a ENTREGA das notificações (push) */}
            <OneSignalSettings />

            {/* Seção de teste do sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Teste do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Teste se o sistema de notificações está funcionando corretamente.
                </p>
                <Button onClick={handleTestNotification} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Enviar Notificação de Teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parcerias" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Parcerias Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Comprove sua participação em programas sociais e receba benefícios em Girinhas
                </p>

                {loadingParcerias ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : organizacoes.length > 0 ? (
                  <div className="space-y-3">
                    {organizacoes.slice(0, 3).map((org) => (
                      <div key={org.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          {org.logo_url && (
                            <img src={org.logo_url} alt={org.nome} className="w-8 h-8 rounded object-cover" />
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{org.nome}</h4>
                            <p className="text-xs text-muted-foreground">{org.programas.length} programa(s)</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {org.programas.slice(0, 2).map((programa) => (
                            <Badge key={programa.id} variant="outline" className="text-xs">
                              {programa.nome}
                              {programa.status_usuario === 'aprovado' && ' ✅'}
                              {programa.status_usuario === 'pendente' && ' ⏳'}
                            </Badge>
                          ))}
                          {org.programas.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{org.programas.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t">
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/parcerias">
                          Ver Todas as Parcerias
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma parceria disponível no momento
                    </p>
                    <Button asChild variant="outline" className="mt-3">
                      <Link to="/parcerias">
                        Explorar Parcerias
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacidade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Seus dados estão protegidos:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Usamos criptografia para proteger suas informações</li>
                    <li>Seus dados pessoais não são compartilhados com terceiros</li>
                    <li>Você pode excluir sua conta a qualquer momento</li>
                    <li>Todas as transações são seguras e monitoradas</li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" size="sm">
                    Excluir Conta
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <QuickNav />
    </div>
  );
};

export default Configuracoes;
