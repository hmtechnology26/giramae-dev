
import { WebNotificationProvider } from '@/types/notifications';

export class ResendProvider implements WebNotificationProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendPushNotification(): Promise<void> {
    throw new Error('ResendProvider não suporta push notifications');
  }

  async sendEmailNotification(email: string, subject: string, body: string): Promise<void> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: 'GiraMãe <noreply@giramae.com>',
          to: [email],
          subject: subject,
          html: `<p>${body}</p>`
        })
      });

      if (!response.ok) {
        throw new Error(`Erro Resend: ${response.status}`);
      }

      console.log('Email enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async registerUser(): Promise<void> {
    // Não há registro específico para email
  }
}
