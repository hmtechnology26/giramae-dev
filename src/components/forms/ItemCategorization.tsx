// src/components/forms/ItemCategorization.tsx

import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

// Interface para os dados de tamanho (para tipagem)
interface Tamanho {
    id: string;
    valor: string;
    label_display: string;
    ordem: number;
    [key: string]: any; // Outras propriedades
}

interface ItemCategorizationProps {
    formData: {
        categoria_id: string;
        subcategoria: string;
        genero: string;
        tamanho_categoria: string;
        tamanho_valor: string;
        estado_conservacao: string;
    };
    onFieldChange: (field: string, value: any) => void;
    errors: any;
}

export const ItemCategorization: React.FC<ItemCategorizationProps> = ({
    formData,
    onFieldChange,
    errors
}) => {
    const { configuracoes } = useConfigCategorias();
    const { subcategorias, isLoading: isLoadingSubcategorias } = useSubcategorias();
    const { tiposTamanho, isLoading: isLoadingTamanhos } = useTiposTamanho(formData.categoria_id);

    const handleCategoriaChange = (categoria: string) => {
        onFieldChange('categoria_id', categoria);
        onFieldChange('subcategoria', '');
        onFieldChange('tamanho_categoria', '');
        onFieldChange('tamanho_valor', '');
    };

    // Handler de tamanho reescrito
    const handleTamanhoChange = (label: string) => {
        let tipoEncontrado = '';
        let valorEncontrado = '';

        if (tiposTamanho) {
            for (const tipoKey of Object.keys(tiposTamanho)) {
                const tamanhosDoTipo = tiposTamanho[tipoKey] || [];
                const tamanho = tamanhosDoTipo.find((t: Tamanho) => t.label_display === label);

                if (tamanho) {
                    tipoEncontrado = tipoKey;
                    valorEncontrado = tamanho.valor;
                    break;
                }
            }
        }

        onFieldChange('tamanho_categoria', tipoEncontrado);
        onFieldChange('tamanho_valor', valorEncontrado);
    };

    // Lógica de subcategorias
    const subcategoriasFiltradas = React.useMemo(() => {
        if (!Array.isArray(subcategorias) || !formData.categoria_id) return [];

        try {
            const filtradas = subcategorias.filter(sub =>
                sub && sub.categoria_pai === formData.categoria_id
            );

            if (!Array.isArray(filtradas)) return [];

            const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
                if (sub && sub.nome && !acc.some(item => item && item.nome === sub.nome)) {
                    acc.push(sub);
                }
                return acc;
            }, [] as typeof filtradas);

            return subcategoriasUnicas;
        } catch (error) {
            console.error('Erro ao filtrar subcategorias:', error);
            return [];
        }
    }, [subcategorias, formData.categoria_id]);

    const tamanhosDisponiveis = React.useMemo(() => {
        if (!tiposTamanho || typeof tiposTamanho !== 'object' || Object.keys(tiposTamanho).length === 0) {
            return [];
        }

        try {
            const todosTamanhos: Tamanho[] = [];

            Object.keys(tiposTamanho).forEach(tipoKey => {
                const tamanhosDoTipo = tiposTamanho[tipoKey];
                if (Array.isArray(tamanhosDoTipo)) {
                    todosTamanhos.push(...tamanhosDoTipo);
                }
            });

            if (todosTamanhos.length === 0) return [];

            const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
                if (tamanho && tamanho.label_display && !acc.some(item => item && item.label_display === tamanho.label_display)) {
                    acc.push(tamanho);
                }
                return acc;
            }, [] as Tamanho[]);

            return tamanhosUnicos.sort((a, b) => {
                const ordemA = a && typeof a.ordem === 'number' ? a.ordem : 0;
                const ordemB = b && typeof b.ordem === 'number' ? b.ordem : 0;
                return ordemA - ordemB;
            });
        } catch (error) {
            console.error('Erro ao processar tamanhos:', error);
            return [];
        }
    }, [tiposTamanho]);

    const getSelectedLabel = () => {
        if (!formData.tamanho_valor || !formData.tamanho_categoria || !tiposTamanho) {
            return undefined;
        }

        const tamanhosDoTipo = tiposTamanho[formData.tamanho_categoria];
        if (!Array.isArray(tamanhosDoTipo)) {
            return undefined;
        }

        const tamanho = tamanhosDoTipo.find((t: Tamanho) => t.valor === formData.tamanho_valor);

        return tamanho ? tamanho.label_display : undefined;
    };

    const selectedLabel = getSelectedLabel();

    return (
        <div className="space-y-8">
            {/* Categoria Principal */}
            <div className="space-y-3">
                <Label htmlFor="categoria" className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
                    Categoria <span className="text-primary">*</span>
                </Label>
                <Select value={formData.categoria_id} onValueChange={handleCategoriaChange}>
                    <SelectTrigger className="w-full h-12 border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all">
                        <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl max-h-80">
                        {configuracoes?.map(config => (
                            <SelectItem key={config.codigo} value={config.codigo} className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer">
                                <span className="flex items-center gap-3">
                                    <span className="text-xl opacity-80">{config.icone}</span>
                                    <span className="font-medium">{config.nome}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.categoria_id && <p className="text-destructive text-xs mt-1 font-medium">{errors.categoria_id}</p>}
            </div>

            {/* Subcategoria */}
            {formData.categoria_id && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Label htmlFor="subcategoria" className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
                        Subcategoria
                    </Label>
                    <Select
                        value={formData.subcategoria}
                        onValueChange={(value) => onFieldChange('subcategoria', value)}
                        disabled={isLoadingSubcategorias}
                    >
                        <SelectTrigger className="w-full h-12 border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all">
                            <SelectValue placeholder={
                                isLoadingSubcategorias ? "Carregando..." :
                                    subcategoriasFiltradas.length === 0 ? "Nenhuma subcategoria disponível" :
                                        "Selecione uma subcategoria"
                            } />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl max-h-80">
                            {subcategoriasFiltradas.map(sub => (
                                <SelectItem key={sub.id} value={sub.nome} className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer">
                                    <span className="flex items-center gap-3">
                                        <span className="text-xl opacity-80">{sub.icone}</span>
                                        <span className="font-medium">{sub.nome}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.subcategoria && <p className="text-destructive text-xs mt-1 font-medium">{errors.subcategoria}</p>}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Tamanho/Idade */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
                        {formData.categoria_id === 'calcados' ? 'Número' :
                            formData.categoria_id === 'brinquedos' ? 'Idade' :
                                formData.categoria_id === 'livros' ? 'Faixa Etária' : 'Tamanho'}
                        <span className="text-primary ml-1">*</span>
                    </Label>
                    <Select
                        value={selectedLabel}
                        onValueChange={handleTamanhoChange}
                        disabled={isLoadingTamanhos || !formData.categoria_id}
                    >
                        <SelectTrigger className="w-full h-12 border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all">
                            <SelectValue placeholder={
                                isLoadingTamanhos ? "Carregando..." :
                                    !formData.categoria_id ? "Escolha uma categoria" :
                                        tamanhosDisponiveis.length === 0 ? "Nenhum tamanho disponível" :
                                            "Selecione"
                            } />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl max-h-80">
                            {tamanhosDisponiveis?.map((t) => (
                                <SelectItem key={t.id} value={t.label_display} className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-center text-foreground">
                                    <span className="font-medium">{t.label_display}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.tamanho && <p className="text-destructive text-xs mt-1 font-medium">{errors.tamanho}</p>}
                </div>

                {/* Gênero */}
                <div className="space-y-3">
                    <Label htmlFor="genero" className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
                        Gênero <span className="text-primary">*</span>
                    </Label>
                    <Select value={formData.genero} onValueChange={(value) => onFieldChange('genero', value)}>
                        <SelectTrigger className="w-full h-12 border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl">
                            <SelectItem value="menino" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                                <span className="flex items-center gap-3">
                                    <span className="text-xl">👦</span>
                                    <span className="font-medium">Menino</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="menina" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                                <span className="flex items-center gap-3">
                                    <span className="text-xl">👧</span>
                                    <span className="font-medium">Menina</span>
                                </span>
                            </SelectItem>
                            <SelectItem value="unissex" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                                <span className="flex items-center gap-3">
                                    <span className="text-xl">👶</span>
                                    <span className="font-medium">Unissex</span>
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.genero && <p className="text-destructive text-xs mt-1 font-medium">{errors.genero}</p>}
                </div>
            </div>

            {/* Estado do Produto */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-foreground/70 ml-1 uppercase tracking-wider">
                    Estado do Produto <span className="text-primary">*</span>
                </Label>
                <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
                    <SelectTrigger className="w-full h-12 border-primary/10 focus:border-primary/30 focus:ring-primary/5 rounded-xl bg-white/50 text-base transition-all">
                        <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-primary/10 rounded-2xl shadow-2xl">
                        <SelectItem value="novo" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                            <span className="flex items-center gap-3">
                                <span className="text-xl">⭐</span>
                                <span className="font-medium">Novo</span>
                            </span>
                        </SelectItem>
                        {/* <SelectItem value="seminovo" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                            <span className="flex items-center gap-3">
                                <span className="text-xl">⭐</span>
                                <span className="font-medium">Seminovo</span>
                            </span>
                        </SelectItem> */}
                        <SelectItem value="usado" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                            <span className="flex items-center gap-3">
                                <span className="text-xl">👍</span>
                                <span className="font-medium">Usado</span>
                            </span>
                        </SelectItem>
                        {/* <SelectItem value="muito_usado" className="text-base py-3 hover:bg-primary/5 focus:bg-primary/5 transition-colors cursor-pointer text-foreground">
                            <span className="flex items-center gap-3">
                                <span className="text-xl">🔄</span>
                                <span className="font-medium">Muito Usado</span>
                            </span>
                        </SelectItem> */}
                    </SelectContent>
                </Select>
                {errors.estado_conservacao && <p className="text-destructive text-xs mt-1 font-medium">{errors.estado_conservacao}</p>}
            </div>
        </div>
    );
};
