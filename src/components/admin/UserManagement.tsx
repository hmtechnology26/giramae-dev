import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, MoreHorizontal, Wallet, MessageCircle, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

// Interfaces corrigidas para trabalhar com o sistema ledger
interface UserProfile extends Profile {
  carteiras?: {
    saldo_atual: number;
    total_recebido: number;
    total_gasto: number;
  }[];
  transacoes?: {
    transacao_id: string;
    data_criacao: string;
  }[];
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Query para buscar usuárias - CORRIGIDA
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, filterStatus],
    queryFn: async () => {
      console.log('🔍 Fetching users data with corrected ledger queries...');
      
      // Buscar profiles primeiro
      let profileQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        profileQuery = profileQuery.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error: profileError } = await profileQuery.limit(50);
      
      if (profileError) {
        console.error('❌ Error fetching profiles:', profileError);
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('ℹ️ No profiles found');
        return [];
      }

      console.log(`✅ Found ${profiles.length} profiles`);

      // Buscar saldos usando view ledger para cada usuário  
      const userIds = profiles.map(p => p.id);
      const saldosPromises = profiles.map(async (p) => {
        try {
          const { data, error } = await (supabase as any)
            .from('ledger_carteiras')
            .select('user_id, saldo_atual, total_recebido, total_gasto')
            .eq('user_id', p.id)
            .single();
          
          if (error) {
            console.warn(`⚠️ No ledger data for user ${p.id}:`, error.message);
            return null;
          }
          
          return data;
        } catch (err) {
          console.warn(`⚠️ Error fetching ledger data for user ${p.id}:`, err);
          return null;
        }
      });
      
      const saldosResults = await Promise.allSettled(saldosPromises);

      // Buscar transações usando view ledger - CORRIGIDO
      const { data: transacoes, error: transacoesError } = await (supabase as any)
        .from('ledger_transacoes')
        .select('user_id, transacao_id, data_criacao')
        .in('user_id', userIds)
        .order('data_criacao', { ascending: false })
        .limit(100); // Limit para evitar queries muito pesadas

      if (transacoesError) {
        console.warn('⚠️ Error fetching transactions:', transacoesError);
      } else {
        console.log(`✅ Found ${transacoes?.length || 0} transactions`);
      }

      // Combinar dados
      const usersWithData: UserProfile[] = profiles.map((profile, index) => {
        const saldoResult = saldosResults[index];
        const saldoData = saldoResult.status === 'fulfilled' ? saldoResult.value : null;
        return {
          ...profile,
          carteiras: saldoData ? [{
            saldo_atual: saldoData.saldo_atual || 0,
            total_recebido: saldoData.total_recebido || 0,
            total_gasto: saldoData.total_gasto || 0
          }] : [],
          transacoes: transacoes?.filter(t => t.user_id === profile.id).slice(0, 5) || []
        };
      });

      console.log('✅ Users data processed successfully:', usersWithData.length);
      return usersWithData;
    },
    refetchInterval: 30000,
  });

  // Query para estatísticas de usuárias - CORRIGIDA
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      try {
        const [
          { count: totalUsers },
          { count: activeUsers },
          { data: topUsers }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          (supabase as any)
            .from('ledger_transacoes')
            .select('user_id', { count: 'exact', head: true })
            .gte('data_criacao', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('profiles')
            .select('nome')
            .limit(5)
        ]);

        return {
          total: totalUsers || 0,
          active: activeUsers || 0,
          topUsers: topUsers || []
        };
      } catch (error) {
        console.error('❌ Error fetching user stats:', error);
        return {
          total: 0,
          active: 0,
          topUsers: []
        };
      }
    }
  });

  const getStatusBadge = (user: UserProfile) => {
    const lastTransaction = user.transacoes?.[0];
    const isActive = lastTransaction && 
      new Date(lastTransaction.data_criacao) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return isActive ? 
      <Badge variant="default" className="bg-green-500">Ativa</Badge> :
      <Badge variant="secondary">Inativa</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando usuárias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de usuárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registradas na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuárias Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.total ? Math.round((userStats.active / userStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Engajamento geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Usuárias</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as usuárias da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Total Recebido</TableHead>
                  <TableHead>Reputação</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{user.nome?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.nome || 'Nome não informado'}</div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username || 'sem-username'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {user.carteiras?.[0]?.saldo_atual?.toFixed(0) || '0'} Girinhas
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.carteiras?.[0]?.total_recebido?.toFixed(0) || '0'} Girinhas
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        ⭐ {user.reputacao || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Wallet className="mr-2 h-4 w-4" />
                            Ver Carteira
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspender Conta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;