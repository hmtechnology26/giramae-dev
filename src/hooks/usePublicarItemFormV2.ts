import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { usePublicarItem } from '@/hooks/useItensOptimized';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';

interface SimpleFormData {
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
}

interface ValidationErrors {
  [key: string]: string;
}

interface UsePublicarItemFormOptions {
  status?: 'disponivel' | 'inativo';
  onSuccess?: () => void;
  isMission?: boolean;
  currentItem?: number;
}

export const usePublicarItemFormV2 = (options: UsePublicarItemFormOptions = {}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { configuracoes, validarValorCategoria } = useConfigCategorias();
  const { mutate: publicarItem, isPending: loading } = usePublicarItem();
  
  const { status = 'disponivel', onSuccess, isMission = false, currentItem = 1 } = options;

  const [formData, setFormData] = useState<SimpleFormData>({
    titulo: '',
    descricao: '',
    categoria_id: '',
    subcategoria: '',
    genero: 'unissex',
    tamanho_categoria: '',
    tamanho_valor: '',
    estado_conservacao: 'usado',
    preco: '',
    imagens: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Função para resetar o formulário completamente
  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria_id: '',
      subcategoria: '',
      genero: 'unissex',
      tamanho_categoria: '',
      tamanho_valor: '',
      estado_conservacao: 'usado',
      preco: '',
      imagens: []
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<SimpleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Limpar erros dos campos que foram atualizados
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
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
        // Validar se o preço está na faixa da categoria
        const validacao = validarValorCategoria(formData.categoria_id, precoNumerico);
        if (!validacao.valido) {
          validationErrors.preco = validacao.mensagem;
        }
      }
    }

    // Validação de imagens
    if (!formData.imagens || formData.imagens.length === 0) {
      validationErrors.imagens = "Pelo menos uma foto é obrigatória.";
    } else if (formData.imagens.length > 5) {
      validationErrors.imagens = "Máximo de 5 fotos permitidas.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return;
    }

    try {
      const itemData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria_id, // Usar o código diretamente
        subcategoria: formData.subcategoria,
        genero: formData.genero,
        tamanho_categoria: formData.tamanho_categoria,
        tamanho_valor: formData.tamanho_valor,
        estado_conservacao: formData.estado_conservacao,
        valor_girinhas: parseFloat(formData.preco),
        publicado_por: user?.id,
        status: status
      };

      publicarItem(
        { itemData, fotos: formData.imagens },
        {
          onSuccess: () => {
            toast.success("Item publicado com sucesso! 🎉");
            
            // ✅ CORRIGIDO: Reset automático do formulário após sucesso
            resetForm();
            
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/feed');
            }
          },
          onError: (error: any) => {
            console.error('Erro ao publicar item:', error);
            toast.error("Erro ao publicar o item. Tente novamente.");
          }
        }
      );
    } catch (error: any) {
      console.error("Erro ao criar item:", error);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  return {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    isMission,
    currentItem
  };
};
