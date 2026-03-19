
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Calendar, Zap, Target, Clock } from 'lucide-react';
import SegmentacaoModal from './SegmentacaoModal';
import EventosModal from './EventosModal';
import { MissaoAdmin } from '@/hooks/useMissoesAdmin';

interface MissaoSegmentadaFormProps {
  missao?: MissaoAdmin;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const MissaoSegmentadaForm: React.FC<MissaoSegmentadaFormProps> = ({
  missao,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    titulo: missao?.titulo || '',
    descricao: missao?.descricao || '',
    tipo_missao: missao?.tipo_missao || 'basic',
    categoria: missao?.categoria || '',
    recompensa_girinhas: missao?.recompensa_girinhas || 10,
    validade_recompensa_meses: missao?.validade_recompensa_meses || 12,
    limite_por_usuario: missao?.limite_por_usuario || 1,
    condicoes: missao?.condicoes || { tipo: 'perfil_completo', quantidade: 1 },
    criterios_segmentacao: missao?.criterios_segmentacao || {},
    configuracao_temporal: missao?.configuracao_temporal || {},
    acoes_eventos: missao?.acoes_eventos || [],
    data_inicio: missao?.data_inicio || '',
    data_fim: missao?.data_fim || '',
    ativo: missao?.ativo !== false
  });

  const [segmentacaoModalOpen, setSegmentacaoModalOpen] = useState(false);
  const [eventosModalOpen, setEventosModalOpen] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCondicaoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      condicoes: { ...prev.condicoes, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const countCriterios = Object.keys(formData.criterios_segmentacao).length;
  const countEventos = formData.acoes_eventos.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título da Missão</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ex: Primeira Venda em SP"
                required
              />
            </div>
            <div>
              <Label htmlFor="tipo_missao">Tipo de Missão</Label>
              <Select 
                value={formData.tipo_missao} 
                onValueChange={(value) => handleInputChange('tipo_missao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básica</SelectItem>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva o que o usuário precisa fazer para completar esta missão"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perfil">Perfil</SelectItem>
                  <SelectItem value="publicacao">Publicação</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recompensa">Recompensa (Girinhas)</Label>
              <Input
                id="recompensa"
                type="number"
                min="1"
                value={formData.recompensa_girinhas}
                onChange={(e) => handleInputChange('recompensa_girinhas', parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="validade">Validade (meses)</Label>
              <Input
                id="validade"
                type="number"
                min="1"
                max="24"
                value={formData.validade_recompensa_meses}
                onChange={(e) => handleInputChange('validade_recompensa_meses', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condições de Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Condições para Conclusão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_condicao">Tipo de Condição</Label>
              <Select 
                value={formData.condicoes.tipo} 
                onValueChange={(value) => handleCondicaoChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas_realizadas">Vendas Realizadas</SelectItem>
                  <SelectItem value="compras_realizadas">Compras Realizadas</SelectItem>
                  <SelectItem value="itens_publicados">Itens Publicados</SelectItem>
                  <SelectItem value="seguidores">Seguidores</SelectItem>
                  <SelectItem value="perfil_completo">Perfil Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantidade">Quantidade Necessária</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={formData.condicoes.quantidade}
                onChange={(e) => handleCondicaoChange('quantidade', parseInt(e.target.value))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segmentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Segmentação de Usuários
            {countCriterios > 0 && (
              <Badge variant="secondary">
                {countCriterios} critério{countCriterios > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {countCriterios > 0 
                ? `Configurada segmentação com ${countCriterios} critério${countCriterios > 1 ? 's' : ''}`
                : 'Nenhuma segmentação configurada (todos os usuários elegíveis)'
              }
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSegmentacaoModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Segmentação
            </Button>
          </div>
          
          {countCriterios > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.criterios_segmentacao).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  return (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {Array.isArray(value) ? value.join(', ') : value.toString()}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos e Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Eventos e Ações
            {countEventos > 0 && (
              <Badge variant="secondary">
                {countEventos} evento{countEventos > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {countEventos > 0 
                ? `Configurados ${countEventos} evento${countEventos > 1 ? 's' : ''} personalizados`
                : 'Nenhum evento personalizado configurado'
              }
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEventosModalOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Eventos
            </Button>
          </div>
          
          {countEventos > 0 && (
            <div className="mt-3 space-y-2">
              {formData.acoes_eventos.map((evento: any, index: number) => (
                <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                  <p className="text-sm font-medium">{evento.titulo}</p>
                  <p className="text-xs text-gray-600">{evento.tipo_evento}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Período de Vigência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Período de Vigência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange('data_inicio', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => handleInputChange('data_fim', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {missao ? 'Atualizar Missão Segmentada' : 'Criar Missão Segmentada'}
      </Button>

      {/* Modais */}
      <SegmentacaoModal
        open={segmentacaoModalOpen}
        onOpenChange={setSegmentacaoModalOpen}
        onSegmentacaoChange={(criterios) => handleInputChange('criterios_segmentacao', criterios)}
        criteriosIniciais={formData.criterios_segmentacao}
      />

      <EventosModal
        open={eventosModalOpen}
        onOpenChange={setEventosModalOpen}
        onEventosChange={(eventos) => handleInputChange('acoes_eventos', eventos)}
        eventosIniciais={formData.acoes_eventos}
      />
    </form>
  );
};

export default MissaoSegmentadaForm;
