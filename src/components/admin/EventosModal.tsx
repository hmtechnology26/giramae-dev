
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MousePointer, ExternalLink, Bell, Settings, Plus, Trash2 } from 'lucide-react';

interface EventosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventosChange: (eventos: any[]) => void;
  eventosIniciais?: any[];
}

const EventosModal: React.FC<EventosModalProps> = ({
  open,
  onOpenChange,
  onEventosChange,
  eventosIniciais = []
}) => {
  const [eventos, setEventos] = useState(eventosIniciais);
  const [novoEvento, setNovoEvento] = useState({
    tipo_evento: '',
    titulo: '',
    parametros: {} as Record<string, any>
  });

  const tiposEvento = [
    {
      value: 'navigate_to_page',
      label: 'Navegar para Página',
      icon: MousePointer,
      description: 'Redireciona o usuário para uma página específica',
      parametros: ['url', 'titulo']
    },
    {
      value: 'open_modal',
      label: 'Abrir Modal',
      icon: Settings,
      description: 'Abre um modal com conteúdo personalizado',
      parametros: ['titulo', 'conteudo', 'tipo']
    },
    {
      value: 'external_link',
      label: 'Link Externo',
      icon: ExternalLink,
      description: 'Abre um link externo em nova aba',
      parametros: ['url', 'titulo']
    },
    {
      value: 'trigger_notification',
      label: 'Enviar Notificação',
      icon: Bell,
      description: 'Envia uma notificação push para o usuário',
      parametros: ['titulo', 'mensagem', 'tipo']
    }
  ];

  const paginasDisponiveis = [
    { value: '/feed', label: 'Feed Principal' },
    { value: '/comprar-girinhas', label: 'Comprar Girinhas' },
    { value: '/carteira', label: 'Carteira' },
    { value: '/publicar-item', label: 'Publicar Item' },
    { value: '/perfil', label: 'Meu Perfil' },
    { value: '/missoes', label: 'Missões' },
    { value: '/indicacoes', label: 'Indicações' }
  ];

  const handleAdicionarEvento = () => {
    if (!novoEvento.tipo_evento) return;

    const evento = {
      id: Date.now().toString(),
      ...novoEvento,
      ativo: true
    };

    setEventos([...eventos, evento]);
    setNovoEvento({ tipo_evento: '', titulo: '', parametros: {} });
  };

  const handleRemoverEvento = (index: number) => {
    setEventos(eventos.filter((_, i) => i !== index));
  };

  const handleParametroChange = (parametro: string, valor: string) => {
    setNovoEvento({
      ...novoEvento,
      parametros: {
        ...novoEvento.parametros,
        [parametro]: valor
      }
    });
  };

  const aplicarEventos = () => {
    onEventosChange(eventos);
    onOpenChange(false);
  };

  const tipoSelecionado = tiposEvento.find(t => t.value === novoEvento.tipo_evento);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MousePointer className="w-5 h-5" />
            Configurar Eventos e Ações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de eventos configurados */}
          {eventos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eventos Configurados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventos.map((evento, index) => {
                  const tipo = tiposEvento.find(t => t.value === evento.tipo_evento);
                  const IconComponent = tipo?.icon || MousePointer;
                  
                  return (
                    <div key={evento.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{evento.titulo || tipo?.label}</p>
                          <p className="text-sm text-gray-600">
                            {tipo?.description}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {Object.entries(evento.parametros || {}).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value as string}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoverEvento(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Formulário para novo evento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Novo Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de evento */}
              <div>
                <Label htmlFor="tipo_evento">Tipo de Evento</Label>
                <Select 
                  value={novoEvento.tipo_evento} 
                  onValueChange={(value) => setNovoEvento({ ...novoEvento, tipo_evento: value, parametros: {} })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map(tipo => {
                      const IconComponent = tipo.icon;
                      return (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{tipo.label}</p>
                              <p className="text-xs text-gray-600">{tipo.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Título do evento */}
              <div>
                <Label htmlFor="titulo_evento">Título do Evento</Label>
                <Input
                  id="titulo_evento"
                  placeholder="Ex: Acesse sua carteira"
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
                />
              </div>

              {/* Parâmetros específicos do tipo */}
              {tipoSelecionado && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Configurações Específicas</Label>
                  
                  {novoEvento.tipo_evento === 'navigate_to_page' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="url">Página de Destino</Label>
                        <Select onValueChange={(value) => handleParametroChange('url', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a página" />
                          </SelectTrigger>
                          <SelectContent>
                            {paginasDisponiveis.map(pagina => (
                              <SelectItem key={pagina.value} value={pagina.value}>
                                {pagina.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="url_custom">Ou URL personalizada</Label>
                        <Input
                          id="url_custom"
                          placeholder="/categoria/roupas?promo=volta-aulas"
                          value={(novoEvento.parametros as any).url || ''}
                          onChange={(e) => handleParametroChange('url', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {novoEvento.tipo_evento === 'open_modal' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="modal_titulo">Título do Modal</Label>
                        <Input
                          id="modal_titulo"
                          placeholder="Oferta Especial!"
                          value={(novoEvento.parametros as any).titulo || ''}
                          onChange={(e) => handleParametroChange('titulo', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="modal_conteudo">Conteúdo do Modal</Label>
                        <Textarea
                          id="modal_conteudo"
                          placeholder="Parabéns! Você ganhou 10% de desconto..."
                          value={(novoEvento.parametros as any).conteudo || ''}
                          onChange={(e) => handleParametroChange('conteudo', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {novoEvento.tipo_evento === 'external_link' && (
                    <div>
                      <Label htmlFor="link_url">URL Externa</Label>
                      <Input
                        id="link_url"
                        placeholder="https://exemplo.com/promocao"
                        value={(novoEvento.parametros as any).url || ''}
                        onChange={(e) => handleParametroChange('url', e.target.value)}
                      />
                    </div>
                  )}

                  {novoEvento.tipo_evento === 'trigger_notification' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="notif_titulo">Título da Notificação</Label>
                        <Input
                          id="notif_titulo"
                          placeholder="Nova missão disponível!"
                          value={(novoEvento.parametros as any).titulo || ''}
                          onChange={(e) => handleParametroChange('titulo', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notif_mensagem">Mensagem</Label>
                        <Textarea
                          id="notif_mensagem"
                          placeholder="Complete agora e ganhe 5 Girinhas"
                          value={(novoEvento.parametros as any).mensagem || ''}
                          onChange={(e) => handleParametroChange('mensagem', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleAdicionarEvento}
                disabled={!novoEvento.tipo_evento || !novoEvento.titulo}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Evento
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicarEventos}>
              Aplicar Eventos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventosModal;
