import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import SchoolSelect from '@/components/address/SchoolSelect';
import { DatePicker } from '@/components/ui/date-picker';

interface FilhosSectionProps {
  filhosForm: any[];
  novoFilho: any;
  enderecoForm: any;
  onFilhoChange: (index: number, field: string, value: any) => void;
  onNovoFilhoChange: (field: string, value: any) => void;
  onSalvarFilho: (filho: any, index: number) => void;
  onRemoverFilho: (filhoId: string) => void;
  onAdicionarFilho: () => void;
}

const FilhosSection: React.FC<FilhosSectionProps> = ({
  filhosForm,
  novoFilho,
  enderecoForm,
  onFilhoChange,
  onNovoFilhoChange,
  onSalvarFilho,
  onRemoverFilho,
  onAdicionarFilho
}) => {
  return (
    <div className="space-y-6">
      {filhosForm.map((filho, index) => (
        <Card key={filho.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{filho.nome}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoverFilho(filho.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={filho.nome}
                  onChange={(e) => onFilhoChange(index, 'nome', e.target.value)}
                />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <DatePicker
                  value={filho.data_nascimento}
                  onChange={(date) => onFilhoChange(index, 'data_nascimento', date)}
                  placeholder="Selecione a data de nascimento"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Sexo</Label>
                <Select
                  value={filho.sexo}
                  onValueChange={(value) => onFilhoChange(index, 'sexo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tamanho Roupas</Label>
                <Input
                  value={filho.tamanho_roupas}
                  onChange={(e) => onFilhoChange(index, 'tamanho_roupas', e.target.value)}
                  placeholder="Ex: 8, 10, M, G"
                />
              </div>
              <div>
                <Label>Tamanho Calçados</Label>
                <Input
                  value={filho.tamanho_calcados}
                  onChange={(e) => onFilhoChange(index, 'tamanho_calcados', e.target.value)}
                  placeholder="Ex: 35, 36, 37"
                />
              </div>
            </div>

            <div>
              <Label>Escola</Label>
              <SchoolSelect
                value={filho.escolas_inep}
                onChange={(escola) => {
                  onFilhoChange(index, 'escola_id', escola?.codigo_inep || null);
                  onFilhoChange(index, 'escolas_inep', escola);
                }}
                estadoFiltro={enderecoForm.estado}
                cidadeFiltro={enderecoForm.cidade}
              />
            </div>

            <Button
              onClick={() => onSalvarFilho(filho, index)}
              variant="outline"
              size="sm"
            >
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Filho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoFilho.nome}
                onChange={(e) => onNovoFilhoChange('nome', e.target.value)}
                placeholder="Nome do filho"
              />
            </div>
            <div>
              <Label>Data de Nascimento *</Label>
              <DatePicker
                value={novoFilho.data_nascimento}
                onChange={(date) => onNovoFilhoChange('data_nascimento', date)}
                placeholder="Selecione a data de nascimento"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sexo</Label>
              <Select
                value={novoFilho.sexo}
                onValueChange={(value) => onNovoFilhoChange('sexo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tamanho Roupas</Label>
              <Input
                value={novoFilho.tamanho_roupas}
                onChange={(e) => onNovoFilhoChange('tamanho_roupas', e.target.value)}
                placeholder="Ex: 8, 10, M, G"
              />
            </div>
            <div>
              <Label>Tamanho Calçados</Label>
              <Input
                value={novoFilho.tamanho_calcados}
                onChange={(e) => onNovoFilhoChange('tamanho_calcados', e.target.value)}
                placeholder="Ex: 35, 36, 37"
              />
            </div>
          </div>

          <div>
            <Label>Escola</Label>
            <SchoolSelect
              value={novoFilho.escola_selecionada}
              onChange={(escola) => {
                onNovoFilhoChange('escola_id', escola?.codigo_inep || null);
                onNovoFilhoChange('escola_selecionada', escola);
              }}
              estadoFiltro={enderecoForm.estado}
              cidadeFiltro={enderecoForm.cidade}
            />
          </div>

          <Button
            onClick={onAdicionarFilho}
            className="w-full"
            disabled={!novoFilho.nome || !novoFilho.data_nascimento}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Filho
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilhosSection;
