import React, { useState, useEffect } from 'react';
import { buildAvatarUrl } from '@/lib/cdn';
import ImageUpload from '@/components/ui/image-upload';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const INTERESSES_DISPONIVEIS = [
  'Moda Infantil', 'Educação', 'Atividades ao Ar Livre', 'Arte e Criatividade',
  'Esportes', 'Música', 'Leitura', 'Culinária', 'Jardinagem', 'Tecnologia'
];

const CATEGORIAS_DISPONIVEIS = [
  'roupas', 'calcados', 'brinquedos', 'livros', 'acessorios', 'moveis', 'decoracao'
];

interface DadosPessoaisSectionProps {
  formData: {
    nome: string;
    bio: string;
    profissao: string;
    instagram: string;
    telefone: string;
    data_nascimento: string;
    username: string;
    interesses: string[];
    categorias_favoritas: string[];
  };
  profile: any;
  avatarFiles: File[];
  onInputChange: (field: string, value: any) => void;
  onInteresseToggle: (interesse: string) => void;
  onCategoriaToggle: (categoria: string) => void;
  onAvatarChange: (files: File[]) => void;
}

const DadosPessoaisSection: React.FC<DadosPessoaisSectionProps> = ({
  formData,
  profile,
  avatarFiles,
  onInputChange,
  onInteresseToggle,
  onCategoriaToggle,
  onAvatarChange
}) => {
  const { toast } = useToast();
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('id', profile?.id || '');

      if (error) throw error;

      setUsernameAvailable(data.length === 0);
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    if (formData.username) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(formData.username);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.username]);

  const handleUsernameChange = (value: string) => {
    // Remove caracteres especiais e espaços, mantém apenas letras, números e underscore
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onInputChange('username', sanitized);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={buildAvatarUrl(profile?.avatar_url)} alt={profile?.nome} />
              <AvatarFallback className="text-lg">
                {profile?.nome?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <ImageUpload
                value={avatarFiles}
                onChange={onAvatarChange}
                maxFiles={1}
                accept="image/*"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <Label htmlFor="username">Nome de usuário *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="meuusername"
              className={
                usernameAvailable === false ? "border-destructive" :
                  usernameAvailable === true ? "border-success" : ""
              }
            />
            {checkingUsername && (
              <p className="text-sm text-muted-foreground mt-1">Verificando disponibilidade...</p>
            )}
            {usernameAvailable === false && (
              <p className="text-sm text-destructive mt-1">Nome de usuário já está em uso</p>
            )}
            {usernameAvailable === true && (
              <p className="text-sm text-success mt-1">Nome de usuário disponível</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Apenas letras, números e underscore. Mínimo 3 caracteres.
            </p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profissao">Profissão</Label>
              <Input
                id="profissao"
                value={formData.profissao}
                onChange={(e) => onInputChange('profissao', e.target.value)}
                placeholder="Sua profissão"
              />
            </div>

            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <DatePicker
                value={formData.data_nascimento}
                onChange={(date) => onInputChange('data_nascimento', date)}
                placeholder="Selecione sua data de nascimento"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Whatsapp</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                disabled={true}
                onChange={(e) => onInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => onInputChange('instagram', e.target.value)}
                placeholder="@seuinstagram"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INTERESSES_DISPONIVEIS.map(interesse => (
              <Badge
                key={interesse}
                variant={formData.interesses.includes(interesse) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onInteresseToggle(interesse)}
              >
                {interesse}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Favoritas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_DISPONIVEIS.map(categoria => (
              <Badge
                key={categoria}
                variant={formData.categorias_favoritas.includes(categoria) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => onCategoriaToggle(categoria)}
              >
                {categoria}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DadosPessoaisSection;
