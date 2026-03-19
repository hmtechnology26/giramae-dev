import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { useAtualizarItem, Item } from '@/hooks/useItensOptimized';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { uploadImage, generateImagePath } from '@/utils/supabaseStorage';
import { R2_BUCKETS } from '@/lib/cdn';
interface EditFormData {
  titulo: string;
  descricao: string;
  categoria_id: string;
  subcategoria: string;
  genero: 'menino' | 'menina' | 'unissex';
  tamanho_categoria: string;
  tamanho_valor: string;
  estado_conservacao: 'novo' | 'seminovo' | 'usado' | 'muito_usado';
  preco: string;
  imagens: File[];
  imagensExistentes: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

export const useEditarItemForm = (initialItem: Item | null) => {
  console.log('🔄 useEditarItemForm inicializado com item:', initialItem?.id);
  
  const { validarValorCategoria } = useConfigCategorias();
  const { mutate: atualizarItem, isPending: loading } = useAtualizarItem();
  const { subcategorias, isLoading: loadingSubcategorias } = useSubcategorias();
  const { tiposTamanho, isLoading: loadingTamanhos } = useTiposTamanho(initialItem?.categoria);
  
  console.log('📊 Estados de carregamento:', {
    loadingSubcategorias,
    loadingTamanhos,
    categoria: initialItem?.categoria,
    subcategoriasCount: subcategorias?.length,
    tiposTamanhoKeys: Object.keys(tiposTamanho || {})
  });

  const [formData, setFormData] = useState<EditFormData>({
    titulo: '',
    descricao: '',
    categoria_id: '',
    subcategoria: '',
    genero: 'unissex',
    tamanho_categoria: '',
    tamanho_valor: '',
    estado_conservacao: 'usado',
    preco: '',
    imagens: [],
    imagensExistentes: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Aguardar carregamento das opções para inicializar o formulário
  useEffect(() => {
    if (initialItem && !loadingSubcategorias && !loadingTamanhos && !isFormInitialized) {
      console.log('🔄 Inicializando form com dados completos do item:', initialItem.id);
      console.log('📏 Tamanhos disponíveis:', tiposTamanho);
      console.log('📏 Tamanho salvo do item:', {
        categoria: initialItem.tamanho_categoria,
        valor: initialItem.tamanho_valor
      });
      
      setFormData({
        titulo: initialItem.titulo || '',
        descricao: initialItem.descricao || '',
        categoria_id: initialItem.categoria || '',
        subcategoria: initialItem.subcategoria || '',
        genero: (initialItem.genero as 'menino' | 'menina' | 'unissex') || 'unissex',
        tamanho_categoria: initialItem.tamanho_categoria || '',
        tamanho_valor: initialItem.tamanho_valor || '',
        estado_conservacao: (initialItem.estado_conservacao as 'novo' | 'seminovo' | 'usado' | 'muito_usado') || 'usado',
        preco: initialItem.valor_girinhas?.toString() || '',
        imagens: [],
        imagensExistentes: Array.isArray(initialItem.fotos) ? initialItem.fotos : []
      });
      setErrors({});
      setIsFormInitialized(true);
    }
  }, [initialItem?.id, loadingSubcategorias, loadingTamanhos, isFormInitialized]);

  // Efeito adicional para garantir que o tamanho seja definido quando as opções estiverem prontas
  useEffect(() => {
    if (isFormInitialized && initialItem && tiposTamanho && Object.keys(tiposTamanho).length > 0) {
      const tamanhoSalvo = initialItem.tamanho_valor;
      
      if (tamanhoSalvo && formData.tamanho_valor !== tamanhoSalvo) {
        console.log('🔧 Ajustando tamanho após carregamento das opções:', tamanhoSalvo);
        
        // Verificar se o tamanho salvo existe nas opções disponíveis
        const todosOsTamanhos = Object.values(tiposTamanho).flat();
        const tamanhoEncontrado = todosOsTamanhos.find((t: any) => t.valor === tamanhoSalvo);
        
        if (tamanhoEncontrado) {
          setFormData(prev => ({
            ...prev,
            tamanho_categoria: initialItem.tamanho_categoria || Object.keys(tiposTamanho)[0] || '',
            tamanho_valor: tamanhoSalvo
          }));
          console.log('✅ Tamanho ajustado com sucesso:', tamanhoSalvo);
        } else {
          console.log('⚠️ Tamanho salvo não encontrado nas opções disponíveis:', tamanhoSalvo);
        }
      }
    }
  }, [isFormInitialized, initialItem, tiposTamanho, formData.tamanho_valor]);

  const resetForm = useCallback((item: Item) => {
    console.log('🔄 Resetando form com item:', item);
    setFormData({
      titulo: item.titulo || '',
      descricao: item.descricao || '',
      categoria_id: item.categoria || '',
      subcategoria: item.subcategoria || '',
      genero: (item.genero as 'menino' | 'menina' | 'unissex') || 'unissex',
      tamanho_categoria: item.tamanho_categoria || '',
      tamanho_valor: item.tamanho_valor || '',
      estado_conservacao: (item.estado_conservacao as 'novo' | 'seminovo' | 'usado' | 'muito_usado') || 'usado',
      preco: item.valor_girinhas?.toString() || '',
      imagens: [],
      imagensExistentes: Array.isArray(item.fotos) ? item.fotos : []
    });
    setErrors({});
    setIsFormInitialized(false); // Resetar para recarregar
  }, []);

  const updateFormData = useCallback((updates: Partial<EditFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Se a categoria mudou, mas não estamos atualizando o tamanho especificamente,
      // preservar os valores de tamanho existentes
      if (updates.categoria_id && !updates.tamanho_valor && !updates.tamanho_categoria) {
        // Manter os valores de tamanho atuais
        newData.tamanho_categoria = prev.tamanho_categoria;
        newData.tamanho_valor = prev.tamanho_valor;
      }
      
      return newData;
    });
    
    // Limpar erros dos campos que foram atualizados
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const removerImagemExistente = useCallback((urlImagem: string) => {
    console.log('🗑️ Removendo imagem existente:', urlImagem);
    setFormData(prev => ({
      ...prev,
      imagensExistentes: prev.imagensExistentes.filter(url => url !== urlImagem)
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors: ValidationErrors = {};

    // Campos obrigatórios básicos
    if (!formData.titulo?.trim()) {
      validationErrors.titulo = "O título do item é obrigatório.";
    } else if (formData.titulo.trim().length < 10) {
      validationErrors.titulo = "O título deve ter pelo menos 10 caracteres.";
    }

    if (!formData.categoria_id) {
      validationErrors.categoria_id = "A categoria é obrigatória.";
    }

    if (!formData.subcategoria) {
      validationErrors.subcategoria = "A subcategoria é obrigatória.";
    }

    if (!formData.genero) {
      validationErrors.genero = "O gênero é obrigatório.";
    }

    if (!formData.estado_conservacao) {
      validationErrors.estado_conservacao = "O estado de conservação é obrigatório.";
    }

    if (!formData.tamanho_valor) {
      validationErrors.tamanho = "O tamanho é obrigatório.";
    }

    // Validação de descrição
    if (!formData.descricao?.trim()) {
      validationErrors.descricao = "A descrição é obrigatória.";
    } else if (formData.descricao.trim().length < 20) {
      validationErrors.descricao = "A descrição deve ter pelo menos 20 caracteres.";
    }

    // Validação de preço
    if (!formData.preco) {
      validationErrors.preco = "O preço é obrigatório.";
    } else {
      const precoNumerico = parseFloat(formData.preco);
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        validationErrors.preco = "O preço deve ser um número maior que zero.";
      } else {
        const validacao = validarValorCategoria(formData.categoria_id, precoNumerico);
        if (!validacao.valido) {
          validationErrors.preco = validacao.mensagem;
        }
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validarValorCategoria]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return false;
    }

    setUploadingImages(true);

    try {
      let fotosFinais = [...formData.imagensExistentes];

      // Upload das novas imagens
      if (formData.imagens.length > 0) {
        console.log('📤 Fazendo upload de', formData.imagens.length, 'novas imagens...');
        
        for (let i = 0; i < formData.imagens.length; i++) {
          const foto = formData.imagens[i];
          console.log(`⬆️ Upload da imagem ${i + 1}/${formData.imagens.length}:`, foto.name);
          
          try {
            const fileName = generateImagePath(initialItem?.publicado_por || '', foto.name);
            
            // Upload retorna publicUrl diretamente (R2)
            const uploadResult = await uploadImage({
              bucket: R2_BUCKETS.itens,
              path: fileName,
              file: foto
            });

            console.log('✅ Upload result:', uploadResult);
            
            // Salvar apenas o path no banco (não URL completa)
            fotosFinais.push(uploadResult.path);
            console.log(`✅ Imagem ${i + 1} uploaded, path:`, uploadResult.path);
          } catch (uploadError: any) {
            console.error(`❌ Erro no upload da imagem ${i + 1}:`, uploadError);
            throw new Error(`Erro no upload da imagem ${i + 1}: ${uploadError.message}`);
          }
        }
      }

      return new Promise((resolve) => {
        const dadosAtualizados = {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria_id,
          subcategoria: formData.subcategoria,
          genero: formData.genero,
          tamanho_categoria: formData.tamanho_categoria,
          tamanho_valor: formData.tamanho_valor,
          estado_conservacao: formData.estado_conservacao,
          valor_girinhas: parseFloat(formData.preco),
          fotos: fotosFinais
        };

        console.log('💾 Salvando dados atualizados:', dadosAtualizados);

        atualizarItem(
          { itemId: initialItem?.id || '', dadosAtualizados },
          {
            onSuccess: () => {
              toast.success("Item atualizado com sucesso! 🎉");
              resolve(true);
            },
            onError: (error: any) => {
              console.error('❌ Erro ao atualizar item:', error);
              toast.error("Erro ao atualizar o item. Tente novamente.");
              resolve(false);
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Erro no processamento:', error);
      toast.error(error.message || "Erro ao processar as imagens.");
      return false;
    } finally {
      setUploadingImages(false);
    }
  }, [formData, validateForm, atualizarItem, initialItem?.id, initialItem?.publicado_por]);

  return {
    formData,
    updateFormData,
    removerImagemExistente,
    errors,
    loading: loading || uploadingImages,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    isFormInitialized,
    isLoadingOptions: loadingSubcategorias || loadingTamanhos
  };
};
