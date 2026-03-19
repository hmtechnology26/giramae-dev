
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch
}) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar itens..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button onClick={onSearch} className="bg-gradient-to-r from-primary to-pink-500 px-6">
        Buscar
      </Button>
    </div>
  );
};
