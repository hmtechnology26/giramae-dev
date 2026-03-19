import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import DadosPessoaisSection from '@/components/perfil/sections/DadosPessoaisSection';
import EnderecoSection from '@/components/perfil/sections/EnderecoSection';
import FilhosSection from '@/components/perfil/sections/FilhosSection';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadImage } from '@/utils/supabaseStorage';
import { R2_BUCKETS } from '@/lib/cdn';
import type { Address } from '@/hooks/useAddress';

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, filhos, loading, updateProfile, deleteFilho } = useProfile();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    numero_whatsapp: '',
    data_nascimento: '',
    username: '',
    interesses: [] as string[],
    categorias_favoritas: [] as string[],
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
  });
  
  const [enderecoForm, setEnderecoForm] = useState<Address>({
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    ponto_referencia: ''
  });
  
  const [filhosForm, setFilhosForm] = useState<any[]>([]);
  const [novoFilho, setNovoFilho] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    tamanho_roupas: '',
    tamanho_calcados: '',
    escola_id: null,
    escola_selecionada: null as any
  });
  
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [saving, setSaving] = useState(false);

  // Função para processar dados antes de enviar ao Supabase
  const processFormDataForDatabase = (data: any) => {
    const processedData = { ...data };
    
    // Converter strings vazias em null para campos de data
    if (processedData.data_nascimento === '') {
      processedData.data_nascimento = null;
    }
    
    // Converter outras strings vazias em null para campos opcionais
    const nullableStringFields = [
      'bio', 
      'profissao', 
      'instagram', 
      'sobrenome',
      'numero_whatsapp',
      'complemento', 
      'ponto_referencia'
    ];
    
    nullableStringFields.forEach(field => {
      if (processedData[field] === '') {
        processedData[field] = null;
      }
    });
    
    return processedData;
  };

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        sobrenome: profile.sobrenome || '',
        bio: profile.bio || '',
        profissao: profile.profissao || '',
        instagram: profile.instagram || '',
        telefone: profile.telefone || '',
        numero_whatsapp: profile.numero_whatsapp || '',
        data_nascimento: profile.data_nascimento || '',
        username: profile.username || '',
        interesses: profile.interesses || [],
        categorias_favoritas: profile.categorias_favoritas || [],
        aceita_entrega_domicilio: profile.aceita_entrega_domicilio || false,
        raio_entrega_km: profile.raio_entrega_km || 5,
        ponto_retirada_preferido: profile.ponto_retirada_preferido || ''
      });
      
      setEnderecoForm({
        cep: profile.cep || '',
        endereco: profile.endereco || '',
        numero: profile.numero || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        complemento: profile.complemento || '',
        ponto_referencia: profile.ponto_referencia || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (filhos) {
      setFilhosForm(filhos.map(filho => ({
        id: filho.id,
        nome: filho.nome,
        data_nascimento: filho.data_nascimento,
        sexo: filho.sexo || '',
        tamanho_roupas: filho.tamanho_roupas || '',
        tamanho_calcados: filho.tamanho_calcados || '',
        escola_id: filho.escola_id,
        escolas_inep: filho.escolas_inep
      })));
    }
  }, [filhos]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInteresseToggle = (interesse: string) => {
    setFormData(prev => ({
      ...prev,
      interesses: prev.interesses.includes(interesse)
        ? prev.interesses.filter(i => i !== interesse)
        : [...prev.interesses, interesse]
    }));
  };

  const handleCategoriaToggle = (categoria: string) => {
    setFormData(prev => ({
      ...prev,
      categorias_favoritas: prev.categorias_favoritas.includes(categoria)
        ? prev.categorias_favoritas.filter(c => c !== categoria)
        : [...prev.categorias_favoritas, categoria]
    }));
  };

  const handleFilhoChange = (index: number, field: string, value: any) => {
    setFilhosForm(prev => {
      const newFilhos = [...prev];
      newFilhos[index] = { ...newFilhos[index], [field]: value };
      return newFilhos;
    });
  };

  const handleNovoFilhoChange = (field: string, value: any) => {
    setNovoFilho(prev => ({ ...prev, [field]: value }));
  };

  const handleAdicionarFilho = async () => {
    if (!novoFilho.nome || !novoFilho.data_nascimento) {
      toast.error('Nome e data de nascimento são obrigatórios');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('filhos')
        .insert({
          mae_id: user?.id,
          nome: novoFilho.nome,
          data_nascimento: novoFilho.data_nascimento,
          sexo: novoFilho.sexo || null,
          tamanho_roupas: novoFilho.tamanho_roupas || null,
          tamanho_calcados: novoFilho.tamanho_calcados || null,
          escola_id: novoFilho.escola_id
        })
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (
            codigo_inep,
            escola,
            municipio,
            uf,
            endereco,
            categoria_administrativa
          )
        `)
        .single();

      if (error) throw error;

      const filhoComEscola = {
        ...data,
        escola: data.escolas_inep,
        escolas_inep: data.escolas_inep
      };

      setFilhosForm(prev => [...prev, filhoComEscola]);
      setNovoFilho({
        nome: '',
        data_nascimento: '',
        sexo: '',
        tamanho_roupas: '',
        tamanho_calcados: '',
        escola_id: null,
        escola_selecionada: null
      });
      
      toast.success('Filho adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar filho:', error);
      toast.error('Erro ao adicionar filho');
    }
  };

  const handleRemoverFilho = async (filhoId: string) => {
    if (confirm('Tem certeza que deseja remover este filho?')) {
      const success = await deleteFilho(filhoId);
      if (success) {
        setFilhosForm(prev => prev.filter(f => f.id !== filhoId));
        toast.success('Filho removido com sucesso!');
      }
    }
  };

  const handleSalvarFilho = async (filho: any, index: number) => {
    try {
      const { error } = await supabase
        .from('filhos')
        .update({
          nome: filho.nome,
          data_nascimento: filho.data_nascimento,
          sexo: filho.sexo || null,
          tamanho_roupas: filho.tamanho_roupas || null,
          tamanho_calcados: filho.tamanho_calcados || null,
          escola_id: filho.escola_id
        })
        .eq('id', filho.id);

      if (error) throw error;
      
      toast.success('Dados do filho salvos!');
    } catch (error) {
      console.error('Erro ao salvar filho:', error);
      toast.error('Erro ao salvar dados do filho');
    }
  };

  const uploadAvatar = async () => {
    if (avatarFiles.length === 0) return null;

    const file = avatarFiles[0];
    const fileName = `${user?.id}-${Date.now()}.jpg`;

    try {
      const uploadResult = await uploadImage({
        bucket: R2_BUCKETS.avatars,
        path: fileName,
        file: file
      });

      // Para avatars, retornar a publicUrl pois é usada diretamente no profile
      // O profile.avatar_url será exibido via buildAvatarUrl no frontend
      return uploadResult.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url;

      if (avatarFiles.length > 0) {
        avatar_url = await uploadAvatar();
      }

      // Processar dados antes de enviar
      const rawUpdateData = {
        ...formData,
        ...enderecoForm,
        avatar_url
      };

      // Converter strings vazias em null para campos de data e outros campos opcionais
      const updateData = processFormDataForDatabase(rawUpdateData);

      console.log('Dados processados para envio:', updateData);

      const success = await updateProfile(updateData);
      
      if (success) {
        toast.success('Perfil atualizado com sucesso!');
        navigate('/perfil');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando dados...</p>
          </div>
        </div>
        <QuickNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
      <Header />
      
      {/* Header fixo da página */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-lg font-semibold">Editar Perfil</h1>
          
          <Button
            onClick={handleSalvar}
            disabled={saving}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pessoais" className="text-xs">
              <User className="w-4 h-4 mr-1" />
              Pessoais
            </TabsTrigger>
            <TabsTrigger value="endereco" className="text-xs">
              <MapPin className="w-4 h-4 mr-1" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="filhos" className="text-xs">
              <Baby className="w-4 h-4 mr-1" />
              Filhos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pessoais">
            <DadosPessoaisSection
              formData={formData}
              profile={profile}
              avatarFiles={avatarFiles}
              onInputChange={handleInputChange}
              onInteresseToggle={handleInteresseToggle}
              onCategoriaToggle={handleCategoriaToggle}
              onAvatarChange={setAvatarFiles}
            />
          </TabsContent>

          <TabsContent value="endereco">
            <EnderecoSection
              formData={formData}
              onInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="filhos">
            <FilhosSection
              filhosForm={filhosForm}
              novoFilho={novoFilho}
              enderecoForm={enderecoForm}
              onFilhoChange={handleFilhoChange}
              onNovoFilhoChange={handleNovoFilhoChange}
              onSalvarFilho={handleSalvarFilho}
              onRemoverFilho={handleRemoverFilho}
              onAdicionarFilho={handleAdicionarFilho}
            />
          </TabsContent>
        </Tabs>
      </main>

      <QuickNav />
    </div>
  );
};

export default EditarPerfil;
