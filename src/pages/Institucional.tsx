// // pages/institucional.tsx
// import React from "react";
// import SEOHead from "@/components/seo/SEOHead";
// import { Card, CardContent } from "@/components/ui/card";

// const Institucional: React.FC = () => {
//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": "WebPage",
//     name: "GiraMãe Institucional",
//     description:
//       "Conheça o problema, a solução e os impactos sociais da plataforma GiraMãe",
//     url: "https://giramae.com.br/parcerias-publicas",
//   };

//   return (
//     <>
//       <SEOHead
//         title="Institucional - GiraMãe"
//         description="Página institucional da GiraMãe: problemas, soluções e impacto social."
//         structuredData={structuredData}
//       />

//       <div className="bg-white">
//         {/* Seção 1: O Problema */}
//         <section className="py-16 bg-gradient-to-br from-pink-100 to-purple-100 ">
//           <div className="container mx-auto px-4">
//             <h2 className="text-4xl text-center md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
//               GiraMãe + SMAS
//             </h2>
//             <div className="grid md:grid-cols-2 gap-12 items-start">
//               <div>
//                 <h3 className="text-2xl font-bold mb-6 text-red-600">
//                   Realidade das Famílias
//                 </h3>
//                 <ul className="space-y-4 text-lg">
//                   <li className="flex items-start">
//                     <span className="text-red-500 mr-3">•</span>Roupas infantis
//                     custam em média R$ 2.400/ano por criança
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-red-500 mr-3">•</span>Criança cresce 6
//                     tamanhos nos primeiros 2 anos
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-red-500 mr-3">•</span>40% das roupas
//                     são usadas menos de 10 vezes
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-red-500 mr-3">•</span>Mães descartam
//                     ou guardam roupas em bom estado
//                   </li>
//                 </ul>
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold mb-6 text-blue-600">
//                   Impacto Social
//                 </h3>
//                 <ul className="space-y-4 text-lg">
//                   <li className="flex items-start">
//                     <span className="text-blue-500 mr-3">•</span>Famílias
//                     vulneráveis priorizam alimentação sobre vestuário
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-blue-500 mr-3">•</span>Crianças podem
//                     ir à escola com roupas inadequadas
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-blue-500 mr-3">•</span>Descarte gera
//                     impacto ambiental desnecessário
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-blue-500 mr-3">•</span>Mães se sentem
//                     isoladas em suas dificuldades
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Seção 2: Solução */}
//         <section className="py-16 ">
//           <div className="container mx-auto px-4 ">
//             <h2 className="text-4xl font-bold text-center mb-12">
//               A Solução GiraMãe
//             </h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//               <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
//                 <CardContent className="p-6">
//                   <div className="text-4xl mb-4">🆓</div>
//                   <h3 className="text-xl font-bold mb-3">100% Gratuito</h3>
//                   <p>
//                     Mães usam sem pagar nada. Ganham créditos virtuais
//                     (Girinhas) através de atividades simples
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
//                 <CardContent className="p-6">
//                   <div className="text-4xl mb-4">🏠</div>
//                   <h3 className="text-xl font-bold mb-3">Local</h3>
//                   <p>
//                     Criado em Canoas, foca na comunidade local, priorizando
//                     entregas na mesma região/escola
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
//                 <CardContent className="p-6">
//                   <div className="text-4xl mb-4">🔒</div>
//                   <h3 className="text-xl font-bold mb-3">Seguro</h3>
//                   <p>
//                     Sistema de reputação, verificação por WhatsApp e moderação
//                     ativa da comunidade
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card className="text-center bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
//                 <CardContent className="p-6">
//                   <div className="text-4xl mb-4">📱</div>
//                   <h3 className="text-xl font-bold mb-3">Simples</h3>
//                   <p>
//                     Interface intuitiva, funciona no celular, não requer
//                     conhecimento técnico avançado
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Seção 3: Potencial de Parceria */}
//         <section className="py-16 bg-blue-50">
//           <div className="container mx-auto px-4">
//             <h2 className="text-4xl font-bold text-center mb-12">
//               Potencial de Apoio aos Programas Existentes
//             </h2>
//             <div className="grid md:grid-cols-2 gap-12">
//               <Card>
//                 <CardContent className="p-8">
//                   <h3 className="text-2xl font-bold mb-4 text-blue-600">
//                     🏫 Educação
//                   </h3>
//                   <h4 className="text-lg font-semibold mb-3">
//                     Possibilidades:
//                   </h4>
//                   <ul className="space-y-2 list-disc list-inside">
//                     <li>
//                       Escolas e creches recebem créditos mensais em Girinhas
//                     </li>
//                     <li>Facilitar trocas entre mães da mesma escola</li>
//                     <li>Reduzir impacto financeiro no material escolar</li>
//                     <li>Promover educação ambiental na prática</li>
//                   </ul>
//                   <div className="mt-4 p-4 bg-green-100 rounded">
//                     <strong>Sem custo:</strong> Apenas divulgação institucional
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-8">
//                   <h3 className="text-2xl font-bold mb-4 text-green-600">
//                     🤝 Assistência Social
//                   </h3>
//                   <h4 className="text-lg font-semibold mb-3">
//                     Possibilidades:
//                   </h4>
//                   <ul className="space-y-2 list-disc list-inside">
//                     <li>Indicar plataforma para famílias atendidas</li>
//                     <li>Complementar programas de transferência</li>
//                     <li>Promover autonomia e dignidade</li>
//                     <li>Criar rede de apoio entre beneficiárias</li>
//                   </ul>
//                   <div className="mt-4 p-4 bg-green-100 rounded">
//                     <strong>Sem custo:</strong> Orientação nos atendimentos
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Seção 4: Por que Apoiar */}
//         <section className="py-16">
//           <div className="container mx-auto px-4">
//             <h2 className="text-4xl font-bold text-center mb-12">
//               Por que Apoiar a GiraMãe?
//             </h2>
//             <div className="grid md:grid-cols-3 gap-8">
//               <Card>
//                 <CardContent className="p-6 text-center bg-green-100">
//                   <div className="text-4xl mb-4">🌟</div>
//                   <h3 className="text-xl font-bold mb-3">Solução Pronta</h3>
//                   <p>
//                     Plataforma já desenvolvida e testada, pronta para uso
//                     imediato
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-6 text-center bg-green-100">
//                   <div className="text-4xl mb-4">💰</div>
//                   <h3 className="text-xl font-bold mb-3">Custo Zero</h3>
//                   <p>
//                     Não requer investimento público, apenas apoio institucional
//                   </p>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-6 text-center bg-green-100">
//                   <div className="text-4xl mb-4">📊</div>
//                   <h3 className="text-xl font-bold mb-3">Transparência</h3>
//                   <p>
//                     Relatórios de impacto e transparência total sobre resultados
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>

//         {/* Seção 5: Call to Action */}
//         <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
//           <div className="container mx-auto px-4 text-center">
//             <h2 className="text-4xl font-bold mb-6">Vamos Conversar?</h2>
//             <p className="text-xl mb-8 max-w-2xl mx-auto">
//               Apoie uma iniciativa local que beneficia centenas de famílias de
//               Canoas, sem custo para o município.
//             </p>
//             <div className="space-y-4 text-lg">
//               <p>
//                 📧{" "}
//                 <a href="mailto:parcerias@giramae.com.br" className="underline">
//                   parcerias@giramae.com.br
//                 </a>
//               </p>
//               {/* <p>📱 (51) 99999-9999</p> */}
//             </div>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// };

// export default Institucional;

// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Users, Handshake, BarChart3 } from "lucide-react";

// export default function ParceriaAssistenciaSocial() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
//       <div className="max-w-6xl mx-auto space-y-12">
//         {/* Título */}
//         <header className="text-center space-y-4">
//           <h1 className="text-4xl font-bold text-blue-900">
//             Parceria: Secretaria de Assistência Social + GiraMãe
//           </h1>
//           <p className="text-lg text-blue-700 max-w-2xl mx-auto">
//             Unindo forças para reduzir a vulnerabilidade social em Canoas e apoiar milhares de famílias.
//           </p>
//         </header>

//         {/* Dados atuais da Assistência Social */}
//         <section>
//           <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
//             Números da Assistência Social em Canoas
//           </h2>
//           <div className="grid md:grid-cols-3 gap-6">
//             <Card className="shadow-lg rounded-2xl">
//               <CardContent className="p-6 flex flex-col items-center text-center">
//                 <Users className="h-10 w-10 text-blue-600 mb-2" />
//                 <h3 className="text-2xl font-bold">52.316 famílias</h3>
//                 <p className="text-sm text-gray-600">inscritas no CadÚnico (33% da população)</p>
//               </CardContent>
//             </Card>
//             <Card className="shadow-lg rounded-2xl">
//               <CardContent className="p-6 flex flex-col items-center text-center">
//                 <Users className="h-10 w-10 text-blue-600 mb-2" />
//                 <h3 className="text-2xl font-bold">20.075 famílias</h3>
//                 <p className="text-sm text-gray-600">beneficiadas pelo Bolsa Família</p>
//               </CardContent>
//             </Card>
//             <Card className="shadow-lg rounded-2xl">
//               <CardContent className="p-6 flex flex-col items-center text-center">
//                 <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
//                 <h3 className="text-2xl font-bold">+154 mil atendimentos</h3>
//                 <p className="text-sm text-gray-600">realizados pelos CRAS nos últimos 4 anos</p>
//               </CardContent>
//             </Card>
//           </div>
//         </section>

//         {/* Como o GiraMãe pode ajudar */}
//         <section>
//           <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
//             Como o GiraMãe pode complementar esse trabalho
//           </h2>
//           <div className="grid md:grid-cols-2 gap-6">
//             <Card className="shadow-lg rounded-2xl">
//               <CardContent className="p-6 space-y-2">
//                 <h3 className="text-xl font-bold text-blue-700">Impacto direto nas famílias</h3>
//                 <ul className="list-disc pl-5 text-gray-700 space-y-1">
//                   <li>Redução de gastos mensais com roupas e itens infantis</li>
//                   <li>Acesso rápido a itens essenciais sem depender apenas do CRAS</li>
//                   <li>Fortalecimento da rede de apoio comunitária</li>
//                 </ul>
//               </CardContent>
//             </Card>
//             <Card className="shadow-lg rounded-2xl">
//               <CardContent className="p-6 space-y-2">
//                 <h3 className="text-xl font-bold text-blue-700">Benefício para a Secretaria</h3>
//                 <ul className="list-disc pl-5 text-gray-700 space-y-1">
//                   <li>Alívio da demanda por benefícios eventuais</li>
//                   <li>Dados em tempo real sobre necessidades locais</li>
//                   <li>Rede parceira que amplia a proteção social</li>
//                 </ul>
//               </CardContent>
//             </Card>
//           </div>
//         </section>

//         {/* Chamada para ação */}
//         <section className="text-center space-y-4">
//           <Handshake className="h-12 w-12 text-blue-700 mx-auto" />
//           <h2 className="text-2xl font-semibold text-blue-900">
//             Juntos, podemos transformar a realidade de milhares de famílias
//           </h2>
//           <p className="text-gray-700 max-w-2xl mx-auto">
//             A parceria entre a Secretaria de Assistência Social e o GiraMãe é um passo importante para fortalecer a economia solidária, reduzir vulnerabilidades e garantir mais dignidade às famílias de Canoas.
//           </p>
//           <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl px-6 py-3 text-lg shadow-md">
//             Apoiar a Parceria
//           </Button>
//         </section>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Handshake, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import SEOHead from "@/components/seo/SEOHead";

export default function ParceriaAssistenciaSocial() {
  // Dados de impacto estimado para gráfico profissional
  const data = [
    { name: "Antes do GiraMãe", Gastos: 250 },
    { name: "Com o GiraMãe", Gastos: 0 },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GiraMãe",
    description: "Plataforma de troca de roupas infantis entre mães usando moeda virtual Girinhas. Economia circular sustentável para famílias de Canoas/RS.",
    url: "https://giramae.com.br/institucional",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Canoas",
      addressRegion: "RS",
      addressCountry: "BR"
    },
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      email: "parcerias@giramae.com.br",
      contactType: "Parcerias Institucionais"
    },
    sameAs: [
      "https://giramae.com.br"
    ]
  };

  return (
    <>
      <SEOHead
        title="Institucional - GiraMãe | Parcerias Públicas e Assistência Social"
        description="Conheça como a GiraMãe pode apoiar programas de assistência social em Canoas/RS. Parceria gratuita que beneficia famílias vulneráveis através da economia circular sustentável."
        keywords="giramae institucional, parceria assistência social, economia circular canoas, sustentabilidade social, apoio famílias vulneráveis, prefeitura canoas, SMAS"
        structuredData={structuredData}
      />
     
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Título */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-900">
            Parceria: Secretaria de Assistência Social + GiraMãe
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Unindo forças para reduzir a vulnerabilidade social em Canoas e
            apoiar milhares de famílias.
          </p>
        </header>

        {/* Indicadores Sociais Gerais */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
            Indicadores Sociais de Canoas
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold">347 mil</h3>
                <p className="text-sm text-gray-600">habitantes (IBGE)</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold">116.859</h3>
                <p className="text-sm text-gray-600">
                  pessoas em vulnerabilidade (CadÚnico)
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold">5 CRAS</h3>
                <p className="text-sm text-gray-600">
                  Centros de Referência em Assistência Social
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold">2 CREAS</h3>
                <p className="text-sm text-gray-600">
                  Proteção Social Especial
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dados atuais da Assistência Social */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
            Números da Assistência Social em Canoas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-2xl font-bold">52.316 famílias</h3>
                <p className="text-sm text-gray-600">
                  inscritas no CadÚnico (33% da população)
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-2xl font-bold">20.075 famílias</h3>
                <p className="text-sm text-gray-600">
                  beneficiadas pelo Bolsa Família
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
                <h3 className="text-2xl font-bold">+154 mil atendimentos</h3>
                <p className="text-sm text-gray-600">
                  realizados pelos CRAS nos últimos 4 anos
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Como o GiraMãe pode ajudar */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
            Como o GiraMãe pode complementar esse trabalho
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-blue-700">
                  Impacto direto nas famílias
                </h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>
                    Redução de até R$ 1.800/ano em gastos com roupas e itens.
                  </li>
                  <li>
                    Acesso rápido a itens essenciais sem depender apenas do
                    CRAS.
                  </li>
                  <li>Fortalecimento da rede de apoio comunitária.</li>
                  <li>
                    Mães em vulnerabilidade conseguem roupas e itens infantis
                    sem depender apenas de doações emergenciais.
                  </li>
                  <li>
                    Estimula redes de solidariedade entre vizinhos, criando um
                    ambiente de apoio mútuo.
                  </li>
                  <li>
                    Menos preocupação com roupas e itens básicos, mais energia
                    para cuidar dos filhos e planejar o futuro.
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-2xl">
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-blue-700">
                  Benefício para a Secretaria
                </h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>
                    Menos pedidos emergenciais, mais tempo e cuidado para cada
                    família.
                  </li>
                  <li>
                    Informações vivas sobre o que as famílias realmente
                    precisam, no momento certo.
                  </li>
                  <li>
                    Uma comunidade fortalecida que caminha junto com a
                    secretaria no cuidado com as famílias.
                  </li>
                  <li>
                    Essa parceria posiciona Canoas como referência em soluções
                    criativas de combate à vulnerabilidade, fortalecendo a
                    imagem da cidade e da gestão.
                  </li>
                  <li>
                    Libera parte do orçamento que seria gasto com atendimento
                    eventual de roupas/itens, podendo direcionar para outras
                    políticas prioritárias.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gráfico de impacto profissional */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">
            Economia estimada com o GiraMãe
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "R$ (Reais)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip formatter={(value) => `R$ ${value},00`} />
                <Legend />
                <Bar dataKey="Gastos" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Famílias gastam em média{" "}
              <span className="font-bold">R$ 250,00/mês</span>com roupas e itens
              infantis.(Fonte:IBGE/2024)<br></br>
              Com o GiraMãe, esse custo pode ser praticamente{" "}
              <span className="text-green-600 font-bold">eliminado</span>,
              gerando economia anual de até{" "}
              <span className="font-bold">R$ 1.800,00</span>.
            </p>
          </div>
        </section>

        {/* Chamada para ação */}
        <section className="text-center space-y-4">
          <Handshake className="h-12 w-12 text-blue-700 mx-auto" />
          <h2 className="text-2xl font-semibold text-blue-900">
            Juntos, podemos transformar a realidade de milhares de famílias
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            A parceria entre a Secretaria de Assistência Social e o GiraMãe é um
            passo importante para fortalecer a economia solidária, reduzir
            vulnerabilidades e garantir mais dignidade às famílias de Canoas.
          </p>
          {/* <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl px-6 py-3 text-lg shadow-md">
            Apoiar a Parceria
          </Button> */}
        </section>
      </div>
    </div>
    </>
  );
}
