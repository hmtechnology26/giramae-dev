
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Megaphone, Users, UserCheck, UserX } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'active' | 'specific'>('all');
  const [actionUrl, setActionUrl] = useState('');
  const [actionText, setActionText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.rpc('send_admin_notification', {
        p_title: title,
        p_message: message,
        p_target_type: targetType,
        p_action_url: actionUrl || null,
        p_action_text: actionText || null
      });

      if (error) {
        console.error('Erro ao enviar notificação:', error);
        toast.error('Erro ao enviar notificação');
        return;
      }

      toast.success(`Notificação enviada para ${data} usuários!`);
      
      // Limpar formulário
      setTitle('');
      setMessage('');
      setActionUrl('');
      setActionText('');
      
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  const getTargetIcon = () => {
    switch(targetType) {
      case 'all': return <Users className="w-4 h-4" />;
      case 'active': return <UserCheck className="w-4 h-4" />;
      case 'specific': return <UserX className="w-4 h-4" />;
    }
  };

  const getTargetDescription = () => {
    switch(targetType) {
      case 'all': return 'Todos os usuários cadastrados';
      case 'active': return 'Usuários ativos (últimos 30 dias)';
      case 'specific': return 'Usuários específicos (em desenvolvimento)';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Envio de Notificações em Massa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Título da Notificação</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nova funcionalidade disponível!"
              maxLength={255}
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem completa que os usuários verão..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="target">Público-Alvo</Label>
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {getTargetIcon()}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Todos os usuários
                  </div>
                </SelectItem>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Usuários ativos
                  </div>
                </SelectItem>
                <SelectItem value="specific" disabled>
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    Usuários específicos (em breve)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">{getTargetDescription()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actionText">Texto do Botão (opcional)</Label>
              <Input
                id="actionText"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Ex: Ver mais"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="actionUrl">URL de Ação (opcional)</Label>
              <Input
                id="actionUrl"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="Ex: /nova-funcionalidade"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSendNotification}
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full"
          >
            {sending ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Atenção</h4>
          <p className="text-sm text-yellow-700">
            Esta ação enviará notificações para múltiplos usuários. Certifique-se de que o conteúdo 
            está correto antes de enviar. As notificações aparecerão no feed de cada usuário e 
            podem gerar notificações push.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
