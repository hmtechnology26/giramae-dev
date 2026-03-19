import React, { useState } from 'react';
import { Users, Search, Shield, Activity, AlertTriangle, UserCheck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGerenciamentoUsuarios, UsuarioAdmin } from '@/hooks/useGerenciamentoUsuarios';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserActionsModal } from './UserActionsModal';

export const GerenciamentoUsuarios: React.FC = () => {
  const {
    usuarios,
    estatisticas,
    loading,
    fetchUsuarios,
    fetchEstatisticas,
    getStatusBadgeConfig,
    getReputationColor
  } = useGerenciamentoUsuarios();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchUsuarios(value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchUsuarios(searchTerm, value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Gerenciamento de Usuários
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitore e gerencie os usuários do marketplace, incluindo penalidades
        </p>
      </div>

      {/* Statistics Cards */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total_usuarios}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.usuarios_ativos} ativos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estatisticas.usuarios_ativos}</div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Suspensos</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estatisticas.usuarios_suspensos}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.usuarios_warned} advertidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violações</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estatisticas.penalidades_ativas}</div>
              <p className="text-xs text-muted-foreground">
                Penalidades ativas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="warned">Advertidos</SelectItem>
            <SelectItem value="suspenso">Suspensos</SelectItem>
            <SelectItem value="banido">Banidos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Select value="data_cadastro" onValueChange={(value) => fetchUsuarios(searchTerm, statusFilter, value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data_cadastro">Data de Cadastro</SelectItem>
            <SelectItem value="ultima_atividade">Última Atividade</SelectItem>
            <SelectItem value="penalidades">Penalidades Recentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários</CardTitle>
          <CardDescription>
            Lista de usuários com informações de atividade e penalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {usuarios.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
              <p>Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="divide-y">
              {usuarios.map((usuario) => {
                const statusConfig = getStatusBadgeConfig(usuario.status);
                
                return (
                  <div key={usuario.user_id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      {/* User Info */}
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{usuario.nome}</h4>
                            {usuario.username && (
                              <span className="text-sm text-muted-foreground">@{usuario.username}</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{usuario.total_itens_publicados || 0} itens</span>
                            <span>{usuario.total_reservas_feitas || 0} reservas</span>
                            <span className={getReputationColor(usuario.pontuacao_reputacao)}>
                              {usuario.pontuacao_reputacao}% reputação
                            </span>
                            {usuario.ultima_atividade && (
                              <span>
                                Ativo {formatDistanceToNow(new Date(usuario.ultima_atividade), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status and Actions */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusConfig.className}>
                          {statusConfig.text}
                        </Badge>
                        
                        {usuario.penalidades_ativas > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {usuario.penalidades_ativas}
                          </Badge>
                        )}
                        
                        {usuario.total_violacoes > 0 && (
                          <span className="text-xs text-orange-600 font-medium">
                            {usuario.total_violacoes} violações
                          </span>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(usuario);
                                setModalOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Ações de Moderação
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <UserActionsModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        usuario={selectedUser}
        onRefresh={() => {
          fetchUsuarios(searchTerm, statusFilter);
          fetchEstatisticas();
        }}
      />
    </div>
  );
};