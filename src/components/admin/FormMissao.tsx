
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { MissaoAdmin } from '@/hooks/useMissoesAdmin';

interface FormMissaoProps {
  missao?: MissaoAdmin;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const FormMissao: React.FC<FormMissaoProps> = ({ missao, onSubmit, isLoading }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: missao || {
      titulo: '',
      descricao: '',
      tipo_missao: 'basic' as const,
      categoria: 'perfil',
      icone: 'trophy',
      recompensa_girinhas: 10,
      validade_recompensa_meses: 12,
      limite_por_usuario: 1,
      condicoes: { tipo: 'perfil_completo', quantidade: 1 },
      ativo: true
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            {...register('titulo', { required: 'Título é obrigatório' })}
            placeholder="Ex: Primeira Venda"
          />
          {errors.titulo && (
            <p className="text-sm text-red-600 mt-1">{errors.titulo.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipo_missao">Tipo de Missão</Label>
          <Select onValueChange={(value: 'basic' | 'engagement' | 'social') => setValue('tipo_missao', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
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
          {...register('descricao', { required: 'Descrição é obrigatória' })}
          placeholder="Descreva o que o usuário precisa fazer"
        />
        {errors.descricao && (
          <p className="text-sm text-red-600 mt-1">{errors.descricao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select onValueChange={(value) => setValue('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perfil">Perfil</SelectItem>
              <SelectItem value="publicacao">Publicação</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="compra">Compra</SelectItem>
              <SelectItem value="indicacao">Indicação</SelectItem>
              <SelectItem value="avaliacao">Avaliação</SelectItem>
              <SelectItem value="seguidor">Seguidor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recompensa_girinhas">Recompensa (Girinhas)</Label>
          <Input
            id="recompensa_girinhas"
            type="number"
            {...register('recompensa_girinhas', { 
              required: 'Recompensa é obrigatória',
              min: { value: 1, message: 'Mínimo 1 Girinha' }
            })}
          />
          {errors.recompensa_girinhas && (
            <p className="text-sm text-red-600 mt-1">{errors.recompensa_girinhas.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_condicao">Tipo de Condição</Label>
          <Select onValueChange={(value) => setValue('condicoes.tipo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendas_realizadas">Vendas Realizadas</SelectItem>
              <SelectItem value="compras_realizadas">Compras Realizadas</SelectItem>
              <SelectItem value="itens_publicados">Itens Publicados</SelectItem>
              <SelectItem value="seguidores">Seguidores</SelectItem>
              <SelectItem value="indicacoes_ativas">Indicações Ativas</SelectItem>
              <SelectItem value="avaliacoes_5_estrelas">Avaliações 5 Estrelas</SelectItem>
              <SelectItem value="perfil_completo">Perfil Completo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantidade">Quantidade Necessária</Label>
          <Input
            id="quantidade"
            type="number"
            {...register('condicoes.quantidade', { 
              required: 'Quantidade é obrigatória',
              min: { value: 1, message: 'Mínimo 1' }
            })}
          />
          {errors.condicoes?.quantidade && (
            <p className="text-sm text-red-600 mt-1">{errors.condicoes.quantidade.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validade_recompensa_meses">Validade Recompensa (meses)</Label>
          <Input
            id="validade_recompensa_meses"
            type="number"
            {...register('validade_recompensa_meses')}
            defaultValue={12}
          />
        </div>

        <div>
          <Label htmlFor="limite_por_usuario">Limite por Usuário</Label>
          <Input
            id="limite_por_usuario"
            type="number"
            {...register('limite_por_usuario')}
            defaultValue={1}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          {...register('ativo')}
        />
        <Label htmlFor="ativo">Missão Ativa</Label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {missao ? 'Atualizar Missão' : 'Criar Missão'}
      </Button>
    </form>
  );
};

export default FormMissao;
