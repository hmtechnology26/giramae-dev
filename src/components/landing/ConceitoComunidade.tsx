
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Recycle, Shield, ArrowRight, Sparkles } from 'lucide-react';

const ConceitoComunidade = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            O Conceito da Nossa Comunidade
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma rede de mães conectadas, compartilhando recursos e criando um futuro mais sustentável para nossos filhos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Rede de Apoio</h3>
              <p className="text-gray-600 text-sm">
                Conecte-se com mães da sua região e crie laços duradouros de amizade e colaboração
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sustentabilidade</h3>
              <p className="text-gray-600 text-sm">
                Dê uma segunda vida aos itens infantis e contribua para um planeta mais verde
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Economia Solidária</h3>
              <p className="text-gray-600 text-sm">
                Economize dinheiro e ajude outras famílias através do compartilhamento
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confiança</h3>
              <p className="text-gray-600 text-sm">
                Sistema de reputação e verificação garante trocas seguras e confiáveis
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Como Funciona Nossa Comunidade?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Cadastre-se</h4>
                    <p className="text-gray-600 text-sm">Crie seu perfil e conte um pouco sobre você e sua família</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Publique Itens</h4>
                    <p className="text-gray-600 text-sm">Compartilhe roupas, brinquedos e acessórios que não usa mais</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Encontre Tesouros</h4>
                    <p className="text-gray-600 text-sm">Descubra itens perfeitos para seus filhos na sua região</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Construa Relacionamentos</h4>
                    <p className="text-gray-600 text-sm">Conecte-se com outras mães e crie uma rede de apoio</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                Juntas Somos Mais Fortes
              </h4>
              <p className="text-gray-600">
                Cada troca fortalece nossa comunidade e cria um futuro melhor para nossos filhos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConceitoComunidade;
