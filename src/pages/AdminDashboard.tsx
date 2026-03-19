
import React, { useState } from 'react';
import AdminGuard from '@/components/auth/AdminGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Menu,
  BarChart3,
  Users,
  FolderOpen,
  Coins,
  CreditCard,
  Activity,
  Settings,
  Gift,
  Target,
  UserPlus,
  MapPin,
  Building2
} from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import UserManagement from '@/components/admin/UserManagement';
import MetricsOverview from '@/components/admin/MetricsOverview';
import ConfigCategorias from '@/components/admin/ConfigCategorias';
import ConfigCompraGirinhas from '@/components/admin/ConfigCompraGirinhas';
import ConfigMercadoPago from '@/components/admin/ConfigMercadoPago';
import EmissionChart from '@/components/admin/EmissionChart';
import PainelSaudeGirinha from '@/components/admin/PainelSaudeGirinha';
import SystemConfig from '@/components/admin/SystemConfig';
import MissoesAdmin from '@/components/admin/MissoesAdmin';
import ConfigBonusDiario from '@/components/admin/ConfigBonusDiario';
import ConfigIndicacoes from '@/components/admin/ConfigIndicacoes';
import LiberacaoCidades from '@/components/admin/LiberacaoCidades';
import ModePanel from '@/components/admin/ModePanel';
import AdminParcerias from '@/components/admin/AdminParcerias';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const adminTabs = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { value: 'moderacao', label: 'Moderação', icon: Shield },
    { value: 'users', label: 'Usuários', icon: Users },
    { value: 'categories', label: 'Categorias', icon: FolderOpen },
    { value: 'girinhas', label: 'Girinhas', icon: Coins },
    { value: 'mercadopago', label: 'Mercado Pago', icon: CreditCard },
    { value: 'saude', label: 'Painel Saúde', icon: Activity },
    { value: 'system', label: 'Sistema', icon: Settings },
    { value: 'bonus', label: 'Bônus', icon: Gift },
    { value: 'missoes', label: 'Missões', icon: Target },
    { value: 'indicacoes', label: 'Indicações', icon: UserPlus },
    { value: 'cidades', label: 'Cidades', icon: MapPin },
    { value: 'parcerias', label: 'Parcerias', icon: Building2 },
  ];

  const currentTab = adminTabs.find(tab => tab.value === activeTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  const TabNavigation = () => (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              className="w-full justify-start gap-2 text-left"
              onClick={() => handleTabChange(tab.value)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                    Painel de administração da plataforma
                  </p>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              {isMobile && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Menu className="h-4 w-4" />
                      {currentTab?.label}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <div className="flex items-center gap-2 pb-4 border-b">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Menu Admin</span>
                    </div>
                    <TabNavigation />
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <div className="w-64 bg-card border-r min-h-[calc(100vh-73px)]">
              <TabNavigation />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="overview" className="mt-0">
                <MetricsOverview />
              </TabsContent>

              <TabsContent value="moderacao" className="mt-0">
                <ModePanel />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UserManagement />
              </TabsContent>

              <TabsContent value="categories" className="mt-0">
                <ConfigCategorias />
              </TabsContent>

              <TabsContent value="girinhas" className="mt-0">
                <div className="grid gap-6">
                  <ConfigCompraGirinhas />
                  <EmissionChart />
                </div>
              </TabsContent>

              <TabsContent value="mercadopago" className="mt-0">
                <ConfigMercadoPago />
              </TabsContent>

              <TabsContent value="saude" className="mt-0">
                <PainelSaudeGirinha />
              </TabsContent>

              <TabsContent value="system" className="mt-0">
                <SystemConfig />
              </TabsContent>

              <TabsContent value="bonus" className="mt-0">
                <ConfigBonusDiario />
              </TabsContent>

              <TabsContent value="missoes" className="mt-0">
                <MissoesAdmin />
              </TabsContent>

              <TabsContent value="indicacoes" className="mt-0">
                <ConfigIndicacoes />
              </TabsContent>

              <TabsContent value="cidades" className="mt-0">
                <LiberacaoCidades />
              </TabsContent>

              <TabsContent value="parcerias" className="mt-0">
                <AdminParcerias />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
