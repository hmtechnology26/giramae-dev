
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info, X, Camera } from 'lucide-react';
import SimpleAddressForm from '@/components/address/SimpleAddressForm';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface EditarPerfilProps {
  onClose: () => void;
}

const EditarPerfil: React.FC<EditarPerfilProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'basico' | 'endereco'>('basico');
  
  const [profileData, setProfileData] = useState({
    nome: '',
    bio: '',
    profissao: '',
    instagram: '',
    telefone: '',
    interesses: [] as string[]
  });

  const [newInteresse, setNewInteresse] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileData({
        nome: profile.nome || '',
        bio: profile.bio || '',
        profissao: profile.profissao || '',
        instagram: profile.instagram || '',
        telefone: profile.telefone || '',
        interesses: profile.interesses || []
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });

      await refetch();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addInteresse = () => {
    if (newInteresse.trim() && !profileData.interesses.includes(newInteresse.trim())) {
      setProfileData(prev => ({
        ...prev,
        interesses: [...prev.interesses, newInteresse.trim()]
      }));
      setNewInteresse('');
    }
  };

  const removeInteresse = (interesse: string) => {
    setProfileData(prev => ({
      ...prev,
      interesses: prev.interesses.filter(i => i !== interesse)
    }));
  };

  const tabs = [
    { id: 'basico', label: 'Básico' },
    { id: 'endereco', label: 'Endereço' }
  ] as const;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-h-[90vh] p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Editar Perfil</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs horizontais para mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-4 pt-4 border-b bg-white">
          {tabs.map(tabItem => (
            <Button
              key={tabItem.id}
              variant={tab === tabItem.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTab(tabItem.id)}
              className="min-w-fit whitespace-nowrap"
            >
              {tabItem.label}
            </Button>
          ))}
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto h-[calc(100%-10rem)] p-4 space-y-6">
          {tab === 'basico' && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {profileData.nome?.[0] || '?'}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Como você gostaria de ser chamada?"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Sobre você</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você e seus filhos..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      value={profileData.profissao}
                      onChange={(e) => setProfileData(prev => ({ ...prev, profissao: e.target.value }))}
                      placeholder="O que você faz?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@seuusername"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label>Interesses</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newInteresse}
                      onChange={(e) => setNewInteresse(e.target.value)}
                      placeholder="Ex: Montessori, Livros infantis..."
                      onKeyPress={(e) => e.key === 'Enter' && addInteresse()}
                    />
                    <Button type="button" onClick={addInteresse} size="sm">
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interesses.map((interesse) => (
                      <Badge key={interesse} variant="secondary" className="text-xs">
                        {interesse}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeInteresse(interesse)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'endereco' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">📍 Seu Endereço Principal</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Cadastre seu endereço principal. Ele será usado para todos os itens que você publicar
                  e ajudará outras mães a encontrarem produtos próximos.
                </p>
              </div>

              <SimpleAddressForm />

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Sua localização é usada apenas para mostrar itens próximos. 
                  Nunca compartilhamos seu endereço completo com outras usuárias.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Botão de salvar fixo - apenas para aba básico */}
        {tab === 'basico' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button 
              className="w-full"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EditarPerfil;
