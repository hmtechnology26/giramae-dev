import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  titulo?: string;
  mensagem?: string;
}

export default function EmptyState({ 
  icon: Icon = Inbox, 
  titulo = "Nenhum dado encontrado",
  mensagem = "Não há informações para exibir no momento."
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {mensagem}
      </p>
    </div>
  );
}
