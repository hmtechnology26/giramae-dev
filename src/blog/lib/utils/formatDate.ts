import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateRelative(date: string): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function formatDate(date: string): string {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
}
