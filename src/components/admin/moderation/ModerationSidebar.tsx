import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield,
  BarChart3,
  Flag,
  Users,
  History,
  Settings
} from 'lucide-react';

interface ModerationSidebarProps {
  stats: {
    pendentes: number;
    reportados: number;
    aprovados: number;
    rejeitados: number;
  };
  activeView: string;
  onViewChange: (view: string) => void;
}

const ModerationSidebar: React.FC<ModerationSidebarProps> = ({ stats, activeView, onViewChange }) => {
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', value: 'dashboard' },
    { icon: Shield, label: 'Revisar Itens', value: 'revisar', count: stats.pendentes },
    { icon: Flag, label: 'Denúncias', value: 'denuncias', count: stats.reportados },
    { icon: Users, label: 'Usuários', value: 'usuarios' },
    { icon: History, label: 'Histórico', value: 'historico' },
    { icon: Settings, label: 'Configurações', value: 'configuracoes' },
  ];

  return (
    <div className="w-64 bg-card border-r p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg">ModePanel</h1>
          <p className="text-sm text-muted-foreground">Sistema de Moderação</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          NAVEGAÇÃO
        </h2>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.value}
              variant={activeView === item.value ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => onViewChange(item.value)}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <Badge 
                  variant={item.count > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {item.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Status do Sistema */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Itens Pendentes</span>
            <Badge variant="secondary">{stats.pendentes}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Denúncias Ativas</span>
            <Badge variant="destructive">{stats.reportados}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Usuários Suspensos</span>
            <Badge variant="outline">3</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModerationSidebar;