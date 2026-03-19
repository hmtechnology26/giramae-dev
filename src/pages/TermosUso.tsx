import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import { useConfigSistema } from '@/hooks/useConfigSistema';

const TermosUso: React.FC = () => {
  const navigate = useNavigate();
  const { config, taxaTransferencia, taxaTransacao, precoManual, isLoadingConfig } = useConfigSistema();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <SEOHead
        title="Termos de Uso - GiraMãe"
        description="Termos e condições de uso da plataforma GiraMãe. Regras, responsabilidades e informações sobre o uso das Girinhas e sistema de trocas."
        url="https://preview--gira-mae-troca-feliz.lovable.app/termos"
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
              📜 Termos de Uso
            </h1>
            <p className="text-gray-600">
              Regras e condições para uso da plataforma
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar a plataforma GiraMãe, você declara que leu, compreendeu e concorda 
              integralmente com estes Termos de Uso e nossa Política de Privacidade. 
              Caso não concorde com qualquer disposição, não utilize nossos serviços.
            </p>
            <p>
              <strong>1.1 Vinculação Contratual:</strong> Estes termos constituem um contrato 
              legalmente vinculativo entre você e o GiraMãe.
            </p>
            <p>
              <strong>1.2 Capacidade Legal:</strong> Para aceitar estes termos, você deve ter 
              capacidade civil plena ou autorização expressa de seu responsável legal.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Definições</h2>
            <p><strong>Para fins destes termos, consideram-se:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Plataforma:</strong> O conjunto de funcionalidades, serviços e conteúdos oferecidos pelo GiraMãe</li>
              <li><strong>Usuário/Usuária:</strong> Pessoa física que utiliza a plataforma</li>
              <li><strong>Girinha:</strong> Moeda virtual interna da plataforma</li>
              <li><strong>Item:</strong> Produto oferecido para troca na plataforma</li>
              <li><strong>Transação:</strong> Processo completo de troca de um item</li>
              <li><strong>Reserva:</strong> Bloqueio temporário de Girinhas para aquisição de item</li>
              <li><strong>Comunidade:</strong> Conjunto de usuárias ativas na plataforma</li>
              <li><strong>Conteúdo do Usuário:</strong> Qualquer informação, texto, foto ou dados inseridos pelo usuário</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Sobre o GiraMãe</h2>
            <p>
              O GiraMãe é uma plataforma digital colaborativa que conecta mães para facilitar 
              a troca de roupas, calçados, brinquedos e utensílios infantis por meio de uma 
              moeda virtual interna denominada "Girinha". Somos uma iniciativa sem fins 
              lucrativos focada na economia circular e sustentabilidade.
            </p>
            <p>
              <strong>3.1 Missão:</strong> Promover a sustentabilidade, economia colaborativa 
              e conexão entre mães através de um sistema justo e seguro de trocas.
            </p>
            <p>
              <strong>3.2 Valores:</strong> Transparência, segurança, sustentabilidade, 
              comunidade, inovação e responsabilidade social.
            </p>
            <p>
              <strong>3.3 Alcance Geográfico:</strong> Inicialmente concentrado na região 
              metropolitana de Porto Alegre/RS, com expansão gradual conforme demanda.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cadastro e Elegibilidade</h2>
            <p><strong>4.1 Requisitos Obrigatórios:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ser maior de 18 anos ou ter autorização expressa dos responsáveis legais</li>
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Possuir número de telefone válido para verificação via WhatsApp</li>
              <li>Aceitar estes Termos de Uso e a Política de Privacidade</li>
              <li>Não possuir contas suspensas ou banidas anteriormente</li>
              <li>Comprometer-se a manter os dados atualizados</li>
            </ul>
            
            <p><strong>4.2 Dados Coletados no Cadastro:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome completo</li>
              <li>Número de telefone (verificado via WhatsApp)</li>
              <li>Endereço completo (rua, número, bairro, cidade, estado, CEP)</li>
              <li>Data de nascimento</li>
              <li>Email (para comunicações importantes)</li>
              <li>Profissão (opcional)</li>
              <li>Instagram (opcional)</li>
              <li>Biografia (opcional)</li>
              <li>Interesses e categorias favoritas</li>
              <li>Informações dos filhos (nome, data de nascimento, escola)</li>
              <li>Localização geográfica (com sua autorização expressa)</li>
            </ul>

            <p><strong>4.3 Verificação de Identidade:</strong></p>
            <p>
              O GiraMãe se reserva o direito de solicitar documentos adicionais para 
              verificação de identidade em casos específicos, visando a segurança da comunidade.
            </p>

            <p><strong>4.4 Proibições de Cadastro:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criar múltiplas contas (uma conta por pessoa)</li>
              <li>Usar informações falsas ou de terceiros</li>
              <li>Cadastrar-se em nome de empresas (apenas pessoas físicas)</li>
              <li>Utilizar nomes ofensivos ou inadequados</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sistema de Girinhas</h2>
            <p><strong>5.1 Características Fundamentais:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Valor de referência:</strong> 1 Girinha = R$ {precoManual?.toFixed(2) || '1,00'}</li>
              <li><strong>Natureza:</strong> Moeda virtual interna, não conversível em dinheiro real</li>
              <li><strong>Validade:</strong> {config?.validade_girinhas?.meses || 12} ({config?.validade_girinhas?.meses === 1 ? 'um mês' : `${config?.validade_girinhas?.meses || 12} meses`}) a partir da data de aquisição</li>
              <li><strong>Uso exclusivo:</strong> Apenas dentro da plataforma GiraMãe</li>
              <li><strong>Não reembolsável:</strong> Não podem ser convertidas em dinheiro</li>
              <li><strong>Intransferível:</strong> Exceto por meio das funcionalidades da plataforma</li>
              <li><strong>Não cumulativa:</strong> Não gera juros ou rendimentos</li>
              <li><strong>Pessoal e intransferível:</strong> Vinculada à conta do usuário</li>
            </ul>

            <p><strong>5.2 Formas de Obtenção:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Compra com dinheiro real via Mercado Pago (pagamento seguro)</li>
              <li>Bônus de cadastro e atividades na plataforma</li>
              <li>Recompensas por completar missões e desafios</li>
              <li>Bônus diário (conforme configuração e participação ativa)</li>
              <li>Recebimento por vendas de itens confirmadas</li>
              <li>Transferências de outros usuários (funcionalidade P2P)</li>
              <li>Sistema de indicações e referência de novos usuários</li>
              <li>Participação em eventos e promoções especiais</li>
              <li>Recompensas por avaliações e feedback construtivo</li>
            </ul>

            <p><strong>5.3 Taxas e Custos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Taxa de transação:</strong> {taxaTransacao}% sobre o valor de cada item vendido (deduzida automaticamente)</li>
              <li><strong>Taxa de transferência P2P:</strong> {taxaTransferencia}% sobre transferências entre usuários</li>
              <li><strong>Taxa de extensão de validade:</strong> Percentual configurável sobre as Girinhas próximas ao vencimento</li>
              <li><strong>Taxas de processamento:</strong> Incluídas nas transações via Mercado Pago</li>
            </ul>

            <p><strong>5.4 Política de Expiração:</strong></p>
            <p>
              Girinhas possuem prazo de validade para incentivar a circulação ativa na economia. 
              Usuários serão notificados sobre expirações próximas e poderão renovar a validade 
              mediante taxa específica.
            </p>

            <p><strong>5.5 Limites e Restrições:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Limite mínimo para compra: 10 Girinhas</li>
              <li>Limite máximo para compra: 999.000 Girinhas</li>
              <li>Limite diário para transferências P2P (definido conforme configuração)</li>
              <li>Restrições para contas recém-criadas (período de carência)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Sistema de Reservas e Transações</h2>
            <p><strong>6.1 Processo Detalhado de Reserva:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verificação automática de saldo suficiente antes da reserva</li>
              <li>Bloqueio imediato do valor total (item + taxa) na carteira</li>
              <li>Geração automática de código de confirmação de 6 dígitos</li>
              <li>Notificação instantânea ao vendedor sobre a nova reserva</li>
              <li>Prazo máximo para confirmação de entrega (definido por configuração)</li>
              <li>Sistema de lembretes automáticos para ambas as partes</li>
            </ul>

            <p><strong>6.2 Confirmação de Entrega:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Apenas o vendedor pode confirmar a entrega usando o código</li>
              <li>Transferência automática das Girinhas após confirmação</li>
              <li>Registro permanente da transação no histórico</li>
              <li>Possibilidade de avaliação mútua após confirmação</li>
            </ul>

            <p><strong>6.3 Política de Cancelamentos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reservas podem ser canceladas por ambas as partes até a confirmação</li>
              <li>Motivo obrigatório para todos os cancelamentos</li>
              <li>Reembolso integral e imediato das Girinhas bloqueadas</li>
              <li>Registro do histórico de cancelamentos por usuário</li>
              <li>Possíveis penalidades por cancelamentos excessivos ou abusivos</li>
              <li>Cancelamento automático após prazo de expiração</li>
            </ul>

            <p><strong>6.4 Disputas e Resolução de Conflitos:</strong></p>
            <p>
              Em casos de divergências entre usuários, o GiraMãe oferece sistema de mediação 
              através de canal de suporte especializado, sempre priorizando a justiça e 
              transparência nas resoluções.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Publicação de Itens</h2>
            <p><strong>7.1 Diretrizes para Publicação:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fotos nítidas e representativas do estado real do item</li>
              <li>Descrição honesta e detalhada do produto</li>
              <li>Preço justo baseado no valor e condição do item</li>
              <li>Categoria e tamanho corretos</li>
              <li>Informações sobre marca, modelo e características relevantes</li>
            </ul>

            <p><strong>7.2 Itens Proibidos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Produtos vencidos, danificados ou inseguros</li>
              <li>Itens contrabandeados, pirateados ou falsificados</li>
              <li>Produtos que violem direitos autorais</li>
              <li>Medicamentos e produtos controlados</li>
              <li>Itens que não sejam relacionados ao público infantil</li>
              <li>Produtos com recall ou alertas de segurança</li>
            </ul>

            <p><strong>7.3 Moderação de Conteúdo:</strong></p>
            <p>
              Todos os itens publicados passam por processo de moderação automática e manual. 
              Itens que violem as diretrizes serão removidos sem aviso prévio.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Verificação e Comunicação</h2>
            <p><strong>8.1 WhatsApp Verification:</strong></p>
            <p>
              O GiraMãe utiliza o WhatsApp exclusivamente para verificação de telefone durante 
              o cadastro. Enviamos um código de verificação de 6 dígitos que deve ser inserido 
              na plataforma para confirmar seu número. Este processo garante a autenticidade 
              dos usuários e a segurança da comunidade.
            </p>

            <p><strong>8.2 Comunicação na Plataforma:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sistema interno de mensagens para coordenação de trocas</li>
              <li>Notificações push para eventos importantes</li>
              <li>Email para comunicações oficiais e atualizações</li>
              <li>Proibido compartilhar dados pessoais antes da confirmação de reserva</li>
            </ul>

            <p><strong>8.3 Privacidade das Comunicações:</strong></p>
            <p>
              O GiraMãe não monitora conversas privadas entre usuários, mas se reserva o 
              direito de investigar denúncias de comportamento inadequado.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Uso de Localização e Dados Geográficos</h2>
            <p><strong>9.1 Finalidades do Uso de Localização:</strong></p>
            <p>Com sua autorização expressa, coletamos dados de localização para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Facilitar encontros entre mães da mesma região</li>
              <li>Mostrar itens próximos à sua localização</li>
              <li>Melhorar a experiência de busca e filtragem por proximidade</li>
              <li>Calcular distâncias entre usuários para otimizar logistics</li>
              <li>Oferecer estatísticas regionais relevantes</li>
              <li>Detectar e prevenir atividades fraudulentas</li>
            </ul>

            <p><strong>9.2 Controle de Privacidade:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Localização precisa nunca é compartilhada com outros usuários</li>
              <li>Apenas informações de bairro/região são visíveis</li>
              <li>Configurações de privacidade podem ser ajustadas a qualquer momento</li>
              <li>Opção de desabilitar completamente recursos baseados em localização</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Código de Conduta e Regras de Convivência</h2>
            <p><strong>10.1 Comportamentos Exigidos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Tratar todos os usuários com respeito e cortesia</li>
              <li>Comunicar-se de forma clara e honesta</li>
              <li>Cumprir acordos e compromissos assumidos</li>
              <li>Reportar comportamentos inadequados</li>
              <li>Colaborar para manter ambiente seguro e acolhedor</li>
            </ul>

            <p><strong>10.2 Comportamentos Estritamente Proibidos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usar linguagem ofensiva, discriminatória, racista, homofóbica ou inadequada</li>
              <li>Publicar itens que não correspondam à descrição ou fotos reais</li>
              <li>Tentar burlar ou hackear o sistema de Girinhas</li>
              <li>Compartilhar informações falsas, enganosas ou maliciosas</li>
              <li>Realizar atividades comerciais irregulares ou não autorizadas</li>
              <li>Assediar, intimidar, ameaçar ou perseguir outros usuários</li>
              <li>Publicar conteúdo inadequado, violento, pornográfico ou ilegal</li>
              <li>Usar a plataforma para fins diferentes de seu objetivo principal</li>
              <li>Tentar obter vantagens indevidas ou fraudar o sistema</li>
              <li>Criar contas falsas ou múltiplas para o mesmo usuário</li>
              <li>Spam, publicidade não autorizada ou conteúdo comercial</li>
            </ul>

            <p><strong>10.3 Sistema de Denúncias:</strong></p>
            <p>
              A plataforma disponibiliza sistema de denúncias para reportar violações. 
              Todas as denúncias são investigadas e podem resultar em advertências, 
              suspensões temporárias ou banimento permanente.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Sistema de Avaliações e Reputação</h2>
            <p><strong>11.1 Funcionamento:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Avaliação obrigatória após cada transação concluída</li>
              <li>Sistema de estrelas (1 a 5) com comentários opcionais</li>
              <li>Avaliações são definitivas e não podem ser alteradas</li>
              <li>Histórico público de avaliações no perfil do usuário</li>
              <li>Score geral de reputação baseado em todas as transações</li>
            </ul>

            <p><strong>11.2 Consequências da Reputação:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usuários com baixa reputação podem ter limitações</li>
              <li>Alta reputação garante maior visibilidade nos resultados</li>
              <li>Badges especiais para usuários exemplares</li>
            </ul>

            <p><strong>11.3 Política Antifraude:</strong></p>
            <p>
              Avaliações falsas, manipuladas ou maliciosas resultarão em penalidades 
              severas, incluindo possível banimento da plataforma.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Segurança e Proteção de Dados</h2>
            <p><strong>12.1 Medidas de Segurança:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criptografia end-to-end para dados sensíveis</li>
              <li>Autenticação multifator disponível</li>
              <li>Monitoramento contínuo de atividades suspeitas</li>
              <li>Backup regular e redundante dos dados</li>
              <li>Auditoria periódica de segurança</li>
            </ul>

            <p><strong>12.2 Responsabilidades do Usuário:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manter a segurança e confidencialidade de sua conta</li>
              <li>Usar senhas fortes e únicas</li>
              <li>Não compartilhar credenciais de acesso</li>
              <li>Reportar imediatamente atividades suspeitas</li>
              <li>Manter aplicativo e navegador atualizados</li>
            </ul>

            <p><strong>12.3 Incidentes de Segurança:</strong></p>
            <p>
              Em caso de violação de dados, usuários serão notificados conforme 
              exigências da LGPD, com informações sobre medidas tomadas e 
              recomendações de segurança.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Responsabilidades e Limitações de Responsabilidade</h2>
            <p><strong>13.1 O GiraMãe NÃO se responsabiliza por:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Qualidade, autenticidade, segurança ou estado dos itens transacionados</li>
              <li>Disputas entre usuários relacionadas às transações</li>
              <li>Danos pessoais ou materiais decorrentes do uso da plataforma</li>
              <li>Problemas de entrega, comunicação ou coordenação entre usuários</li>
              <li>Perda de Girinhas por uso indevido, esquecimento de senha ou negligência</li>
              <li>Interrupções temporárias do serviço por manutenção ou problemas técnicos</li>
              <li>Ações de terceiros ou circunstâncias fora de nosso controle</li>
              <li>Decisões tomadas pelos usuários baseadas em informações da plataforma</li>
            </ul>

            <p><strong>13.2 Responsabilidades Integrais do Usuário:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verificar pessoalmente a qualidade dos itens antes de confirmar transações</li>
              <li>Cumprir todos os acordos estabelecidos com outros usuários</li>
              <li>Responder civil e criminalmente por todas as atividades realizadas em sua conta</li>
              <li>Manter dados de cadastro sempre atualizados e precisos</li>
              <li>Usar a plataforma conforme sua finalidade e estes termos</li>
              <li>Arcar com eventuais danos causados a terceiros</li>
            </ul>

            <p><strong>13.3 Limitação de Responsabilidade:</strong></p>
            <p>
              A responsabilidade do GiraMãe, quando aplicável, será limitada ao valor 
              das Girinhas efetivamente envolvidas na transação específica, excluindo 
              danos indiretos, lucros cessantes ou consequenciais.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Propriedade Intelectual e Direitos Autorais</h2>
            <p><strong>14.1 Propriedade do GiraMãe:</strong></p>
            <p>
              Todo o conteúdo da plataforma GiraMãe, incluindo mas não limitado a textos, 
              imagens, logotipos, design, interface, código-fonte, algoritmos, funcionalidades 
              e metodologias, é propriedade exclusiva do GiraMãe ou de seus licenciadores 
              e está protegido pelas leis de propriedade intelectual brasileiras e internacionais.
            </p>

            <p><strong>14.2 Licença de Uso:</strong></p>
            <p>
              É concedida ao usuário licença limitada, não exclusiva, não transferível e 
              revogável para usar a plataforma conforme estes termos, exclusivamente para 
              fins pessoais e não comerciais.
            </p>

            <p><strong>14.3 Conteúdo do Usuário:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usuários mantêm direitos sobre conteúdo original que publicam</li>
              <li>Ao publicar, usuário concede ao GiraMãe licença para usar, modificar e exibir tal conteúdo</li>
              <li>Usuário garante ter direitos sobre todo conteúdo publicado</li>
              <li>Proibido publicar conteúdo protegido por direitos autorais de terceiros</li>
            </ul>

            <p><strong>14.4 Política DMCA:</strong></p>
            <p>
              O GiraMãe respeita direitos autorais e remove conteúdo infrator mediante 
              notificação adequada, conforme legislação aplicável.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Suspensão, Encerramento e Violações</h2>
            <p><strong>15.1 Motivos para Suspensão:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violação destes Termos de Uso ou Política de Privacidade</li>
              <li>Comportamento inadequado ou prejudicial à comunidade</li>
              <li>Tentativas de fraude ou manipulação do sistema</li>
              <li>Múltiplas reclamações ou avaliações negativas</li>
              <li>Atividades ilegais ou suspeitas</li>
              <li>Não atualização de dados obrigatórios</li>
            </ul>

            <p><strong>15.2 Processo Disciplinar:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Advertência formal para infrações leves</li>
              <li>Suspensão temporária (7 a 90 dias) para reincidência</li>
              <li>Banimento permanente para infrações graves</li>
              <li>Direito de defesa mediante canal oficial</li>
            </ul>

            <p><strong>15.3 Consequências do Encerramento:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Perda definitiva de acesso à plataforma</li>
              <li>Perda de todas as Girinhas não utilizadas</li>
              <li>Cancelamento automático de reservas pendentes</li>
              <li>Exclusão de dados conforme Política de Privacidade</li>
              <li>Não há direito a reembolso de Girinhas ou valores pagos</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">16. Modificações da Plataforma e dos Termos</h2>
            <p><strong>16.1 Atualizações da Plataforma:</strong></p>
            <p>
              O GiraMãe se reserva o direito de modificar, atualizar, descontinuar ou 
              adicionar funcionalidades à plataforma a qualquer momento, visando 
              melhorar a experiência do usuário e a segurança do sistema.
            </p>

            <p><strong>16.2 Alterações dos Termos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Notificação prévia de 30 (trinta) dias para alterações substanciais</li>
              <li>Comunicação através da plataforma, email ou outros meios eficazes</li>
              <li>Versão anterior disponível para consulta por 90 dias</li>
              <li>Uso continuado constitui aceitação das modificações</li>
              <li>Direito de encerrar conta em caso de discordância com novas versões</li>
            </ul>

            <p><strong>16.3 Histórico de Versões:</strong></p>
            <p>
              Todas as versões dos termos ficam arquivadas e disponíveis para consulta 
              no canal oficial da plataforma.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">17. Aspectos Financeiros e Fiscais</h2>
            <p><strong>17.1 Natureza das Girinhas:</strong></p>
            <p>
              As Girinhas não constituem moeda legal, título de crédito, valor mobiliário 
              ou ativo financeiro. São exclusivamente pontos virtuais para uso interno 
              na plataforma.
            </p>

            <p><strong>17.2 Questões Tributárias:</strong></p>
            <p>
              Eventuais obrigações tributárias decorrentes de atividades na plataforma 
              são de responsabilidade exclusiva do usuário, que deve consultar contador 
              ou advogado tributário quando necessário.
            </p>

            <p><strong>17.3 Transparência Financeira:</strong></p>
            <p>
              O GiraMãe mantém registros detalhados de todas as transações e pode 
              fornecer extratos mediante solicitação formal do usuário.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">18. Menores de Idade e Proteção Infantil</h2>
            <p><strong>18.1 Restrições de Idade:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Plataforma destinada exclusivamente a maiores de 18 anos</li>
              <li>Menores podem ser representados por responsáveis legais</li>
              <li>Proibido cadastro independente de menores</li>
              <li>Verificação rigorosa de idade durante cadastro</li>
            </ul>

            <p><strong>18.2 Proteção de Dados de Menores:</strong></p>
            <p>
              Informações sobre filhos são coletadas apenas quando necessário para 
              funcionalidades específicas (ex: compatibilidade de tamanhos), sempre 
              com máxima proteção e conforme LGPD.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">19. Lei Aplicável e Jurisdição</h2>
            <p><strong>19.1 Legislação Aplicável:</strong></p>
            <p>
              Estes Termos são regidos pela legislação brasileira, especialmente:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</li>
              <li>Marco Civil da Internet (Lei 12.965/2014)</li>
              <li>Código de Defesa do Consumidor (Lei 8.078/1990)</li>
              <li>Código Civil Brasileiro (Lei 10.406/2002)</li>
              <li>Estatuto da Criança e do Adolescente (Lei 8.069/1990)</li>
            </ul>

            <p><strong>19.2 Foro e Competência:</strong></p>
            <p>
              O foro da Comarca de Canoas/RS é eleito como competente para dirimir 
              quaisquer controvérsias decorrentes destes termos, renunciando as partes 
              a qualquer outro, por mais privilegiado que seja.
            </p>

            <p><strong>19.3 Resolução Alternativa de Conflitos:</strong></p>
            <p>
              Antes de recorrer ao Poder Judiciário, as partes se comprometem a tentar 
              resolver divergências através de mediação ou arbitragem, quando aplicável.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">20. Disposições Gerais</h2>
            <p><strong>20.1 Autonomia das Cláusulas:</strong></p>
            <p>
              A invalidade de qualquer disposição destes termos não afeta a validade 
              das demais, que permanecem em pleno vigor e efeito.
            </p>

            <p><strong>20.2 Idioma:</strong></p>
            <p>
              Estes termos são redigidos em português brasileiro. Eventuais traduções 
              são apenas para conveniência, prevalecendo sempre a versão original.
            </p>

            <p><strong>20.3 Cessão:</strong></p>
            <p>
              Usuários não podem ceder ou transferir direitos e obrigações destes termos. 
              O GiraMãe pode ceder mediante notificação prévia.
            </p>

            <p><strong>20.4 Força Maior:</strong></p>
            <p>
              O GiraMãe não será responsabilizado por atrasos ou falhas causadas por 
              eventos de força maior, incluindo mas não limitado a desastres naturais, 
              guerras, atos governamentais ou falhas de infraestrutura de terceiros.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">21. Canais de Comunicação e Suporte</h2>
            <p><strong>21.1 Suporte ao Usuário:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Email:</strong> suporte@giramae.com.br</li>
              <li><strong>WhatsApp:</strong> Disponível na plataforma para usuários cadastrados</li>
              <li><strong>Central de Ajuda:</strong> Seção FAQ na plataforma</li>
              <li><strong>Formulário de Contato:</strong> Disponível na área de configurações</li>
            </ul>

            <p><strong>21.2 Horário de Atendimento:</strong></p>
            <p>
              Suporte disponível de segunda a sexta-feira, das 8h às 18h (horário de Brasília). 
              Respostas em até 48 horas úteis.
            </p>

            <p><strong>21.3 Canais Específicos:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Denúncias:</strong> denuncia@giramae.com.br</li>
              <li><strong>Privacidade/LGPD:</strong> privacidade@giramae.com.br</li>
              <li><strong>Parcerias:</strong> parcerias@giramae.com.br</li>
              <li><strong>Imprensa:</strong> imprensa@giramae.com.br</li>
            </ul>

            <p><strong>21.4 Endereço:</strong></p>
            <p>
              <strong>GiraMãe - Plataforma Digital</strong><br />
              Canoas, Rio Grande do Sul, Brasil<br />
              CNPJ: [A definir quando aplicável]
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">22. Reconhecimento e Aceitação</h2>
            <p>
              <strong>Ao utilizar a plataforma GiraMãe, você declara expressamente que:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Leu integralmente estes Termos de Uso</li>
              <li>Compreendeu todas as disposições e suas implicações</li>
              <li>Concorda voluntariamente com todos os termos e condições</li>
              <li>Compromete-se a cumprir rigorosamente todas as regras</li>
              <li>Reconhece a natureza vinculativa deste acordo</li>
              <li>Aceita as políticas de privacidade e cookies</li>
              <li>Está ciente das responsabilidades e limitações</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                📋 Checklist de Aceitação
              </h3>
              <p className="text-blue-800 mb-3">
                Antes de utilizar a plataforma, certifique-se de que:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-blue-700">
                <li>✅ Você tem 18 anos ou mais</li>
                <li>✅ Possui telefone válido para verificação</li>
                <li>✅ Leu e entendeu todos os termos</li>
                <li>✅ Concorda com as políticas de privacidade</li>
                <li>✅ Compromete-se a ser respeitosa na comunidade</li>
                <li>✅ Entende o funcionamento das Girinhas</li>
                <li>✅ Aceita as taxas e custos aplicáveis</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-8">
              <p className="text-sm text-gray-600 font-medium">
                <strong>Última atualização:</strong> Janeiro de 2025
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Versão:</strong> 2.0 - Termos atualizados conforme LGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;