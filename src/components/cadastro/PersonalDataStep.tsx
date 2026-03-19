
import React from 'react';
import { Button } from '@/components/ui/button';
import DadosPessoaisSection from '@/components/perfil/sections/DadosPessoaisSection';

interface PersonalDataStepProps {
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
  onInputChange: (field: string, value: any) => void;
  onInteresseToggle: (interesse: string) => void;
  onCategoriaToggle: (categoria: string) => void;
  onComplete: () => void;
}

const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  formData,
  onInputChange,
  onInteresseToggle,
  onCategoriaToggle,
  onComplete
}) => {
  const handleSubmit = () => {
    if (formData.nome.trim()) {
      onComplete();
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="max-h-96 overflow-y-auto">
        <DadosPessoaisSection
          formData={formData}
          profile={null}
          avatarFiles={[]}
          onInputChange={onInputChange}
          onInteresseToggle={onInteresseToggle}
          onCategoriaToggle={onCategoriaToggle}
          onAvatarChange={() => {}}
        />
      </div>
      <Button 
        onClick={handleSubmit} 
        className="w-full bg-primary hover:bg-primary/90 mt-4"
      >
        Salvar e Continuar
      </Button>
    </div>
  );
};

export default PersonalDataStep;
