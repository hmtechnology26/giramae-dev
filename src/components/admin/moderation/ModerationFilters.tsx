import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ModerationFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const ModerationFilters: React.FC<ModerationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por título ou vendedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            <SelectItem value="roupas">Roupas</SelectItem>
            <SelectItem value="calcado">Calçados</SelectItem>
            <SelectItem value="brinquedos">Brinquedos</SelectItem>
            <SelectItem value="livros">Livros</SelectItem>
            <SelectItem value="acessorios">Acessórios</SelectItem>
            <SelectItem value="higiene">Higiene</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModerationFilters;