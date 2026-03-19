import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { Button } from '@/components/ui/button';

const PoliticaPrivacidade: React.FC = () => {
  const navigate = useNavigate();
  const { config, precoManual } = useConfigSistema();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <SEOHead
        title="Política de Privacidade - GiraMãe"
        description="Política de privacidade da plataforma GiraMãe. Como protegemos e utilizamos suas informações pessoais na comunidade de troca de roupas infantis."
        url="https://preview--gira-mae-troca-feliz.lovable.app/privacidade"
        noindex={true}
      />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-primary mb-2">
              GiraMãe
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🔒 Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Como protegemos e utilizamos suas informações pessoais
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informações Gerais</h2>
            <p>
              Esta Política de Privacidade descreve como o GiraMãe coleta, usa, armazena 
              e protege suas informações pessoais, em conformidade com a Lei Geral de 
              Proteção de Dados (LGPD - Lei 13.709/2018) e demais legislações aplicáveis.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                <strong>Controlador de Dados:</strong> GiraMãe<br/>
                <strong>Email do Encarregado de Dados:</strong> privacidade@giramae.com.br<br/>
                <strong>Base Legal:</strong> Consentimento e execução de contrato
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados Pessoais Coletados</h2>
            
            <p><strong>2.1 Dados Obrigatórios para Cadastro:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nome completo:</strong> Para identificação na plataforma</li>
              <li><strong>Número de telefone:</strong> Para verificação via WhatsApp e comunicação</li>
              <li><strong>Endereço completo:</strong> Para localização e entrega de itens</li>
              <li><strong>Data de nascimento:</strong> Para verificação de idade</li>
              <li><strong>Email:</strong> Para comunicação e recuperação de conta</li>
            </ul>

            <p><strong>2.2 Dados Opcionais:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Profissão:</strong> Para personalização da experiência</li>
              <li><strong>Instagram:</strong> Para conexão social (opcional)</li>
              <li><strong>Biografia:</strong> Para apresentação no perfil</li>
              <li><strong>Foto de perfil:</strong> Para identificação visual</li>
              <li><strong>Interesses:</strong> Para recomendações personalizadas</li>
            </ul>

            <p><strong>2.3 Dados dos Filhos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nome dos filhos:</strong> Para facilitar conexões entre mães</li>
              <li><strong>Data de nascimento:</strong> Para determinar faixas etárias de interesse</li>
              <li><strong>Escola:</strong> Para conectar mães da mesma instituição</li>
            </ul>
            
            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
              <strong>⚠️ Importante:</strong> Os dados dos filhos são utilizados exclusivamente 
              para facilitar conexões entre mães e não são compartilhados publicamente sem 
              consentimento específico.
            </p>

            <p><strong>2.4 Dados de Localização:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Coordenadas GPS:</strong> Apenas com autorização expressa</li>
              <li><strong>Endereço informado:</strong> Para cálculo de proximidade</li>
              <li><strong>Histórico de localização:</strong> Armazenado temporariamente no dispositivo</li>
            </ul>

            <p><strong>2.5 Dados de Transações:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Histórico de Girinhas:</strong> Para controle financeiro interno</li>
              <li><strong>Reservas e trocas:</strong> Para funcionamento da plataforma</li>
              <li><strong>Avaliações:</strong> Para sistema de reputação</li>
              <li><strong>Dados de pagamento:</strong> Processados pelo Mercado Pago (não armazenamos)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidades do Tratamento</h2>
            
            <p><strong>3.1 Operação da Plataforma:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criar e gerenciar sua conta de usuário</li>
              <li>Verificar identidade via WhatsApp</li>
              <li>Facilitar transações entre usuários</li>
              <li>Processar reservas e pagamentos</li>
              <li>Manter histórico de transações</li>
            </ul>

            <p><strong>3.2 Experiência Personalizada:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mostrar itens relevantes baseados em interesses</li>
              <li>Conectar mães da mesma região ou escola</li>
              <li>Sugerir categorias de produtos</li>
              <li>Calcular distâncias para facilitar encontros</li>
            </ul>

            <p><strong>3.3 Comunicação:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enviar notificações sobre transações</li>
              <li>Comunicar atualizações da plataforma</li>
              <li>Responder solicitações de suporte</li>
              <li>Enviar lembretes importantes</li>
            </ul>

            <p><strong>3.4 Segurança e Prevenção de Fraudes:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Detectar atividades suspeitas</li>
              <li>Prevenir uso indevido da plataforma</li>
              <li>Investigar violações dos termos de uso</li>
              <li>Manter logs de segurança</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal para Tratamento</h2>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p><strong>Consentimento (Art. 7º, I, LGPD):</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Coleta de dados de localização</li>
                <li>Uso de dados para marketing (quando aplicável)</li>
                <li>Compartilhamento de informações específicas</li>
              </ul>
              
              <p className="mt-3"><strong>Execução de Contrato (Art. 7º, V, LGPD):</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Dados necessários para funcionamento da plataforma</li>
                <li>Processamento de transações</li>
                <li>Verificação de identidade</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados</h2>
            
            <p><strong>5.1 Dados Visíveis a Outros Usuários:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome, foto e biografia do perfil</li>
              <li>Localização aproximada (bairro/cidade)</li>
              <li>Itens publicados para troca</li>
              <li>Avaliações recebidas</li>
              <li>Escola dos filhos (apenas para conexões relevantes)</li>
            </ul>

            <p><strong>5.2 Dados Compartilhados com Terceiros:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Mercado Pago:</strong> Dados de pagamento para processamento</li>
              <li><strong>WhatsApp Business API:</strong> Número de telefone para verificação</li>
              <li><strong>Supabase:</strong> Infraestrutura de banco de dados (criptografado)</li>
              <li><strong>Provedores de Email:</strong> Para notificações importantes</li>
            </ul>
            
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
              <strong>🚫 O que NÃO compartilhamos:</strong> Nunca vendemos, alugamos ou 
              compartilhamos dados pessoais para fins comerciais com terceiros.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Armazenamento e Segurança</h2>
            
            <p><strong>6.1 Localização dos Dados:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Servidores localizados no Brasil (Supabase)</li>
              <li>Backup em nuvem com criptografia</li>
              <li>Conformidade com legislação brasileira</li>
            </ul>

            <p><strong>6.2 Medidas de Segurança:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação de dois fatores</li>
              <li>Monitoramento de segurança 24/7</li>
              <li>Logs de auditoria</li>
              <li>Acesso restrito por função</li>
            </ul>

            <p><strong>6.3 Retenção de Dados:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dados de conta ativa:</strong> Enquanto mantiver a conta</li>
              <li><strong>Dados de transações:</strong> 5 anos para fins fiscais</li>
              <li><strong>Logs de segurança:</strong> 2 anos</li>
              <li><strong>Dados de localização:</strong> Máximo 30 dias no dispositivo</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Tecnologias de Rastreamento</h2>
            
            <p><strong>7.1 Cookies e Armazenamento Local:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Cookies essenciais:</strong> Para funcionamento da plataforma</li>
              <li><strong>localStorage:</strong> Para dados de indicação e preferências</li>
              <li><strong>sessionStorage:</strong> Para dados temporários de sessão</li>
              <li><strong>Cookies de funcionalidade:</strong> Para lembrar configurações</li>
            </ul>

            <p><strong>7.2 Geolocalização:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Solicitamos permissão explícita antes de acessar</li>
              <li>Usado apenas para melhorar experiência de busca</li>
              <li>Pode ser desabilitado a qualquer momento</li>
              <li>Dados armazenados temporariamente no dispositivo</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Seus Direitos (LGPD)</h2>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Você tem os seguintes direitos:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> Obter cópia dos dados que possuímos</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou inexatos</li>
                <li><strong>Anonimização/Bloqueio:</strong> Para dados desnecessários</li>
                <li><strong>Eliminação:</strong> Exclusão de dados não necessários</li>
                <li><strong>Portabilidade:</strong> Transferir dados para outro serviço</li>
                <li><strong>Revogação do consentimento:</strong> A qualquer momento</li>
                <li><strong>Informação sobre compartilhamento:</strong> Com quem compartilhamos</li>
              </ul>
            </div>

            <p><strong>Como exercer seus direitos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: <strong>privacidade@giramae.com.br</strong></li>
              <li>Através das configurações da plataforma</li>
              <li>Prazo de resposta: até 15 dias</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Dados de Menores</h2>
            
            <p className="bg-orange-50 p-4 rounded-lg">
              <strong>⚠️ Proteção Especial:</strong> O GiraMãe não coleta dados diretamente 
              de menores de 18 anos. As informações sobre filhos são fornecidas pelos 
              responsáveis legais e usadas apenas para facilitar conexões entre mães. 
              Pais podem solicitar exclusão desses dados a qualquer momento.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações nesta Política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Mudanças significativas 
              serão comunicadas com 30 dias de antecedência via email e notificação na 
              plataforma. Recomendamos revisar esta política regularmente.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato e Reclamações</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Encarregado de Proteção de Dados (DPO):</strong></p>
              <ul className="list-none space-y-1 text-sm">
                <li><strong>Email:</strong> privacidade@giramae.com.br</li>
                <li><strong>Prazo de resposta:</strong> 15 dias úteis</li>
              </ul>
              
              <p className="mt-3"><strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong></p>
              <p className="text-sm">
                Caso não fique satisfeito com nossa resposta, pode contactar a ANPD 
                através do site: gov.br/anpd
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-blue-900 font-medium">
                <strong>Última atualização:</strong> Janeiro de 2025
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <strong>Versão:</strong> 2.0 - Política atualizada conforme LGPD
              </p>
              <p className="text-sm text-blue-900 mt-2">
                <strong>Compromisso:</strong> Proteger seus dados é nossa prioridade máxima.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;