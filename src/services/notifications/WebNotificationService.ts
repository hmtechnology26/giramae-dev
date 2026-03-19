
import { supabase } from '@/integrations/supabase/client';
import { TemplateService } from './TemplateService';
import { ResendProvider } from './providers/ResendProvider';
import { 
  NotificationRequest, 
  NotificationChannel, 
  WebNotificationProvider,
  InAppNotification 
} from '@/types/notifications';

export class WebNotificationService {
  private templateService: TemplateService;
  private emailProvider?: ResendProvider;
  private inAppNotifications: InAppNotification[] = [];
  private listeners: ((notifications: InAppNotification[]) => void)[] = [];

  constructor() {
    this.templateService = new TemplateService();
  }

  setEmailProvider(provider: ResendProvider) {
    this.emailProvider = provider;
  }

  async enviarNotificacao(request: NotificationRequest): Promise<void> {
    try {
      const template = await this.templateService.getTemplate(request.templateType);
      if (!template) {
        throw new Error(`Template não encontrado: ${request.templateType}`);
      }

      const { title, body } = this.templateService.processTemplate(template, request.variables);
      const channels = request.channels || ['push', 'in_app'];

      for (const channel of channels) {
        try {
          await this.enviarPorCanal(channel, request.userId, title, body, request.userEmail);
          await this.logNotification(request.userId, request.templateType, channel, 'enviado', {
            title,
            body,
            variables: request.variables
          });
        } catch (error) {
          await this.logNotification(request.userId, request.templateType, channel, 'falhou', {
            title,
            body,
            variables: request.variables
          }, error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }

  private async enviarPorCanal(
    channel: NotificationChannel, 
    userId: string, 
    title: string, 
    body: string, 
    userEmail?: string
  ): Promise<void> {
    switch (channel) {
      case 'push':
        // Push notifications agora são enviadas via edge function
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: userId,
            type: 'push',
            title,
            message: body,
            send_push: true
          }
        });
        break;

      case 'email':
        if (this.emailProvider && userEmail) {
          await this.emailProvider.sendEmailNotification(userEmail, title, body);
        }
        break;

      case 'in_app':
        this.addInAppNotification({
          id: Math.random().toString(36),
          title,
          body,
          timestamp: new Date(),
          read: false
        });
        break;
    }
  }

  private async logNotification(
    userId: string,
    templateType: string,
    canal: NotificationChannel,
    status: string,
    dadosEnvio: any,
    erroMensagem?: string
  ): Promise<void> {
    try {
      await supabase
        .from('notification_logs')
        .insert({
          user_id: userId,
          template_tipo: templateType,
          canal,
          status,
          dados_envio: dadosEnvio,
          erro_mensagem: erroMensagem
        });
    } catch (error) {
      console.error('Erro ao salvar log de notificação:', error);
    }
  }

  private addInAppNotification(notification: InAppNotification): void {
    this.inAppNotifications.unshift(notification);
    this.notifyListeners();
  }

  getInAppNotifications(): InAppNotification[] {
    return this.inAppNotifications;
  }

  markAsRead(notificationId: string): void {
    const notification = this.inAppNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  subscribe(callback: (notifications: InAppNotification[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.inAppNotifications));
  }
}
