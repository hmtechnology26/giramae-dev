
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, X } from "lucide-react";

interface FilaEsperaCardProps {
  fila: {
    id: string;
    item_id: string;
    posicao: number;
    itens?: {
      titulo: string;
      fotos: string[] | null;
      valor_girinhas: number;
    } | null;
    profiles_vendedor?: {
      nome: string;
      avatar_url: string | null;
    } | null;
  };
  onSairDaFila: (itemId: string) => void;
}

const FilaEsperaCard = ({ fila, onSairDaFila }: FilaEsperaCardProps) => {
  const imagemItem = fila.itens?.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img 
              src={imagemItem} 
              alt={fila.itens?.titulo || "Item"} 
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-800 line-clamp-1">
                {fila.itens?.titulo || "Item não encontrado"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-500 text-white">Na Fila</Badge>
                <span className="text-sm text-primary font-medium">
                  {fila.itens?.valor_girinhas} Girinhas
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={fila.profiles_vendedor?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {fila.profiles_vendedor?.nome?.split(' ').map(n => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              Vendedor: {fila.profiles_vendedor?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              Você está na fila de espera
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-blue-600 mb-4">
          <Users className="w-4 h-4" />
          <span>{fila.posicao}º na fila</span>
        </div>

        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onSairDaFila(fila.item_id)}
          className="w-full"
        >
          <X className="w-4 h-4 mr-1" />
          Sair da fila
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilaEsperaCard;
