export type NotificationType = 
  | 'nova_mensagem'
  | 'item_reservado' 
  | 'reserva_expirando'
  | 'reserva_confirmada'
  | 'reserva_cancelada'
  | 'girinhas_expirando'
  | 'girinhas_recebidas'
  | 'missao_completada'
  | 'sistema'
  | 'boas_vindas'
  | 'item_disponivel'
  | 'item_rejeitado'
  | 'item_aprovado';

export type NotificationChannel = 'push' | 'email' | 'in_app';

export type NotificationStatus = 'enviado' | 'falhou' | 'pendente';

export interface NotificationTemplate {
  id: string;
  tipo: NotificationType;
  titulo: string;
  corpo: string;
  variaveis: Record<string, string>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  template_tipo: NotificationType;
  canal: NotificationChannel;
  status: NotificationStatus;
  dados_envio: Record<string, any>;
  erro_mensagem?: string;
  created_at: string;
}

export interface WebNotificationProvider {
  sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
  sendEmailNotification?(email: string, subject: string, body: string): Promise<void>;
  registerUser(userId: string, metadata?: any): Promise<void>;
}

export interface NotificationRequest {
  userId: string;
  templateType: NotificationType;
  variables: Record<string, any>;
  channels?: NotificationChannel[];
  userEmail?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface NotificationPreferences {
  mensagens: boolean;
  reservas: boolean;
  girinhas: boolean;
  sistema: boolean;
  push_enabled: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}
