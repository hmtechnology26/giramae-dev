
import React, { useState } from 'react';
import { Check, ChevronsUpDown, School, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEscolas, type EscolaEssencial } from '@/hooks/useEscolas';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';

interface SchoolSelectProps {
  value?: EscolaEssencial | null;
  onChange: (escola: EscolaEssencial | null) => void;
  placeholder?: string;
  disabled?: boolean;
  estadoFiltro?: string;
  cidadeFiltro?: string;
}

const SchoolSelect: React.FC<SchoolSelectProps> = ({
  value,
  onChange,
  placeholder = "Selecione uma escola...",
  disabled = false,
  estadoFiltro,
  cidadeFiltro
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarTodasEscolas, setMostrarTodasEscolas] = useState(false);
  
  const { getEscolasDosMeusFilhos } = useFilhosPorEscola();
  const escolasDosMeusFilhos = getEscolasDosMeusFilhos();
  
  // Hook para buscar outras escolas quando necessário
  const { escolas, isLoading } = useEscolas({
    searchTerm: mostrarTodasEscolas && searchTerm.length >= 3 ? searchTerm : undefined,
    uf: estadoFiltro,
    municipio: cidadeFiltro
  });

  const handleSelect = (escola: EscolaEssencial) => {
    onChange(escola);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const formatSchoolDisplay = (escola: EscolaEssencial) => {
    const nome = escola.escola || 'Escola sem nome';
    const municipio = escola.municipio || '';
    const uf = escola.uf || '';
    
    if (municipio && uf) {
      return `${nome} - ${municipio}/${uf}`;
    }
    
    return nome;
  };

  const handleToggleTodasEscolas = () => {
    setMostrarTodasEscolas(!mostrarTodasEscolas);
    setSearchTerm('');
  };

  // Filtrar escolas baseado no estado atual
  let escolasParaMostrar: EscolaEssencial[] = [];
  
  if (!mostrarTodasEscolas) {
    // Converter escolas dos filhos para o tipo essencial
    escolasParaMostrar = escolasDosMeusFilhos.map(escola => ({
      codigo_inep: escola.codigo_inep,
      escola: escola.escola || '',
      municipio: escola.municipio || '',
      uf: escola.uf || '',
      endereco: escola.endereco || '',
      categoria_administrativa: escola.categoria_administrativa || ''
    }));
  } else {
    // Mostrar resultado da busca geral
    escolasParaMostrar = escolas || [];
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {value ? formatSchoolDisplay(value) : placeholder}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {value && !disabled && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-50" align="start">
          <Command>
            {mostrarTodasEscolas && (
              <CommandInput
                placeholder="Buscar escola (mín. 3 caracteres)..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            )}
            <CommandList className="max-h-[300px]">
              {!mostrarTodasEscolas ? (
                <>
                  {/* Mostrar escolas dos filhos */}
                  <CommandGroup heading="Escolas dos seus filhos">
                    {escolasParaMostrar.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum filho com escola cadastrada
                      </div>
                    ) : (
                      escolasParaMostrar.map((escola) => (
                        <CommandItem
                          key={escola.codigo_inep}
                          onSelect={() => handleSelect(escola)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value?.codigo_inep === escola.codigo_inep ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{escola.escola}</span>
                            <span className="text-sm text-muted-foreground">
                              {escola.municipio}/{escola.uf}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                  
                  {/* Opção para buscar outras escolas */}
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleToggleTodasEscolas}
                      className="cursor-pointer text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Buscar outra escola</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : (
                <>
                  {/* Voltar para escolas dos filhos */}
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleToggleTodasEscolas}
                      className="cursor-pointer text-muted-foreground"
                    >
                      <School className="mr-2 h-4 w-4" />
                      <span>← Voltar para escolas dos filhos</span>
                    </CommandItem>
                  </CommandGroup>

                  {/* Resultado da busca geral */}
                  {searchTerm.length < 3 ? (
                    <CommandEmpty>Digite pelo menos 3 caracteres para buscar</CommandEmpty>
                  ) : isLoading ? (
                    <CommandEmpty>Carregando escolas...</CommandEmpty>
                  ) : escolasParaMostrar.length === 0 ? (
                    <CommandEmpty>Nenhuma escola encontrada</CommandEmpty>
                  ) : (
                    <CommandGroup heading={`${escolasParaMostrar.length} escola(s) encontrada(s)`}>
                      {escolasParaMostrar.map((escola) => (
                        <CommandItem
                          key={escola.codigo_inep}
                          onSelect={() => handleSelect(escola)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value?.codigo_inep === escola.codigo_inep ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{escola.escola}</span>
                            <span className="text-xs text-muted-foreground">
                              {escola.municipio}/{escola.uf}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SchoolSelect;
