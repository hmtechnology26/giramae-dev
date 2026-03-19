import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGeneros } from '@/hooks/useGeneros';

interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

interface TamanhoDisponivel {
  valor: string;
  label_display: string;
}

interface BasicFiltersProps {
  categoria: string;
  ordem: string;
  subcategoria: string;
  genero: string;
  tamanho: string;
  categorias: Categoria[];
  subcategorias: string[];
  tamanhosDisponiveis: TamanhoDisponivel[];
  onCategoriaChange: (value: string) => void;
  onOrdemChange: (value: string) => void;
  onSubcategoriaChange: (value: string) => void;
  onGeneroChange: (value: string) => void;
  onTamanhoChange: (value: string) => void;
}

export const BasicFilters: React.FC<BasicFiltersProps> = ({
  categoria,
  ordem,
  subcategoria,
  genero,
  tamanho,
  categorias,
  subcategorias,
  tamanhosDisponiveis,
  onCategoriaChange,
  onOrdemChange,
  onSubcategoriaChange,
  onGeneroChange,
  onTamanhoChange
}) => {
  const { data: generos = [] } = useGeneros();
  
  return (
    <div className="space-y-4">
      {/* Filtros Básicos - Layout em grid compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categoria */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Categoria</Label>
          <Select value={categoria} onValueChange={onCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.nome}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</Label>
          <Select value={ordem} onValueChange={onOrdemChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Segunda linha com Subcategoria, Gênero, Tamanho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subcategoria */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Subcategoria</Label>
          <Select value={subcategoria} onValueChange={onSubcategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="">Todas as subcategorias</SelectItem>
              {subcategorias.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gênero */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Gênero</Label>
          <Select value={genero} onValueChange={onGeneroChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {generos.map((gen) => (
                <SelectItem key={gen.codigo} value={gen.codigo}>
                  {gen.icone ? `${gen.icone} ${gen.nome}` : gen.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ✅ CORRIGIDO: Tamanho com altura máxima maior */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Tamanho</Label>
          <Select 
            value={tamanho} 
            onValueChange={onTamanhoChange}
            disabled={categoria === 'todas'}
          >
            <SelectTrigger>
              <SelectValue placeholder={categoria === 'todas' ? 'Selecione uma categoria' : 'Todos'} />
            </SelectTrigger>
            {/* 🔥 ALTURA AUMENTADA + SCROLL EXPLÍCITO */}
            <SelectContent className="max-h-[min(400px,80vh)] overflow-y-auto">
              <SelectItem value="todos">Todos os tamanhos</SelectItem>
              {tamanhosDisponiveis.map((tam) => (
                <SelectItem key={tam.valor} value={tam.valor}>
                  {tam.label_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
