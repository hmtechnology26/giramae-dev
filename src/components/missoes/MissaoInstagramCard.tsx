import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Instagram, CheckCircle, Clock, ExternalLink, Gift } from 'lucide-react';
import { useMissaoInstagram } from '@/hooks/useMissaoInstagram';
import { useQueryClient } from '@tanstack/react-query';

export const MissaoInstagramCard: React.FC<{
  onColetar?: (missaoId: string) => void;
  isCollecting?: boolean;
}> = ({ onColetar, isCollecting }) => {
  const queryClient = useQueryClient();
  const {
    verification,
    missao,
    isLoading,
    isVerified,
    isPending,
    isConnected,
    conectarInstagram
  } = useMissaoInstagram();

  const [instagramUsername, setInstagramUsername] = useState('');

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!missao) return null;

  const missaoStatus = missao.missoes_usuarios?.[0]?.status;
  const isMissaoCompleta = missaoStatus === 'completa';
  const isMissaoColetada = missaoStatus === 'coletada';

  const handleConectar = () => {
    if (!instagramUsername.trim()) return;
    conectarInstagram.mutate(instagramUsername);
  };

  const handleAbrirInstagram = () => {
    window.open('https://instagram.com/giramaeoficial', '_blank');
  };

  const handleColetar = async () => {
    if (!onColetar || !missao?.id) return;
    
    // Executar coleta
    await onColetar(missao.id);
    
    // Invalidar queries para atualizar UI
    queryClient.invalidateQueries({ queryKey: ['missao-instagram'] });
    queryClient.invalidateQueries({ queryKey: ['missoes'] });
    queryClient.invalidateQueries({ queryKey: ['instagram-verification'] });
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{missao.titulo}</CardTitle>
              <Badge variant={isVerified ? 'default' : 'secondary'} className="mt-1">
                +{missao.recompensa_girinhas} Girinhas
              </Badge>
            </div>
          </div>
          {isMissaoColetada && (
            <CheckCircle className="w-8 h-8 text-gray-400" />
          )}
          {isMissaoCompleta && !isMissaoColetada && (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{missao.descricao}</p>

        {/* Status: Não Conectado */}
        {!isConnected && !isMissaoColetada && (
          <div className="space-y-3">
            <div className="bg-card/80 rounded-lg p-4 space-y-3 border">
              <p className="font-semibold text-sm">📱 Passo 1: Informe seu Instagram</p>
              <div className="flex gap-2">
                <Input
                  placeholder="@seu_username"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  disabled={conectarInstagram.isPending}
                />
                <Button
                  onClick={handleConectar}
                  disabled={!instagramUsername.trim() || conectarInstagram.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {conectarInstagram.isPending ? 'Conectando...' : 'Conectar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status: Conectado mas não verificado */}
        {isConnected && !isVerified && !isMissaoCompleta && !isMissaoColetada && (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Instagram conectado: @{verification?.instagram_username}
                </p>
              </div>
            </div>

            <div className="bg-card/80 rounded-lg p-4 space-y-3 border">
              <p className="font-semibold text-sm">📸 Passo 2: Siga e Marque @giramaeoficial</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Siga nosso perfil @giramaeoficial no Instagram</li>
                <li>Publique uma story ou post mencionando @giramaeoficial</li>
                <li>A verificação será automática em alguns minutos</li>
              </ol>
              
              <Button
                onClick={handleAbrirInstagram}
                variant="outline"
                className="w-full"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Abrir Instagram
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {isPending && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">Aguardando verificação</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Marque @giramaeoficial em uma story para completar automaticamente
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status: Verificado e Completo */}
        {isMissaoCompleta && !isMissaoColetada && (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-200">Missão Completa!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Você completou todos os requisitos
                  </p>
                </div>
              </div>
              
              {onColetar && (
                <Button
                  size="sm"
                  onClick={handleColetar}
                  disabled={isCollecting}
                  className="w-full"
                >
                  {isCollecting ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                      Coletando...
                    </>
                  ) : (
                    <>
                      <Gift className="w-3 h-3 mr-1" />
                      Coletar {missao.recompensa_girinhas} Girinhas
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status: Coletada */}
        {isMissaoColetada && (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-gray-500" />
              <div>
                <p className="font-bold text-gray-700 dark:text-gray-300">Recompensa Coletada</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Você já coletou as {missao.recompensa_girinhas} Girinhas desta missão
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
