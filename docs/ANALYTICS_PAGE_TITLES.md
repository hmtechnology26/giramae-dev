# 📊 Google Analytics - Títulos de Página Implementados

## ✅ Status da Implementação

### 🎯 **Helper de Títulos**
- **Arquivo**: `/src/lib/pageTitle.ts`
- **Status**: ✅ **IMPLEMENTADO**
- **Função**: Fornece títulos padronizados para todas as páginas do sistema

---

## 📄 Páginas com SEOHead Implementado

### **✅ PRIORIDADE 1: Onboarding (100% Completo)**

| Página | Rota | Título no GA4 | Status |
|--------|------|---------------|---------|
| WhatsAppOnboarding | `/onboarding/whatsapp` | Verificar WhatsApp \| Onboarding \| GiraMãe | ✅ |
| CodigoOnboarding | `/onboarding/codigo` | Código de Verificação \| Onboarding \| GiraMãe | ✅ |
| EnderecoOnboarding | `/onboarding/endereco` | Seu Endereço \| Onboarding \| GiraMãe | ✅ |
| ConceptoComunidade | `/conceito-comunidade` | Bem-vinda à Comunidade \| Onboarding \| GiraMãe | ✅ |
| PublicarPrimeiroItem | `/publicar-primeiro-item` | Publicar Primeiro Item \| Onboarding \| GiraMãe | ✅ |

---

### **✅ PRIORIDADE 2: Core Features (100% Completo)**

| Página | Rota | Título no GA4 | Status |
|--------|------|---------------|---------|
| FeedOptimized | `/feed` | Feed de Itens \| GiraMãe | ✅ |
| DetalhesItem | `/item/:id` | [Nome do Item] \| Detalhe \| GiraMãe | ✅ |
| ComprarGirinhas | `/comprar-girinhas` | Comprar Girinhas \| GiraMãe | ✅ |
| Carteira | `/carteira` | Minha Carteira \| GiraMãe | ✅ |

---

### **✅ PRIORIDADE 3: Blog (100% Completo)**

| Página | Rota | Título no GA4 | Status |
|--------|------|---------------|---------|
| Blog | `/blog` | Blog \| Dicas para Mães \| GiraMãe | ✅ |
| BlogPost | `/blog/:slug` | [Título do Post] \| Blog \| GiraMãe | ✅ |

---

## 📋 Arquivos Modificados

### 1. **Helper Criado**
```
✅ src/lib/pageTitle.ts - Helper com títulos padronizados
```

### 2. **Páginas de Onboarding**
```
✅ src/pages/onboarding/WhatsAppOnboarding.tsx
✅ src/pages/onboarding/CodigoOnboarding.tsx
✅ src/pages/onboarding/EnderecoOnboarding.tsx
✅ src/pages/ConceptoComunidadeOnboarding.tsx
✅ src/pages/PublicarPrimeiroItem.tsx
```

### 3. **Core Features**
```
✅ src/pages/FeedOptimized.tsx
✅ src/pages/DetalhesItem.tsx
✅ src/pages/ComprarGirinhas.tsx
✅ src/pages/Carteira.tsx
```

### 4. **Blog**
```
✅ src/pages/Blog.tsx
✅ src/pages/BlogPost.tsx
```

---

## 🧪 Como Validar

### **1. Verificar no DevTools (F12)**
```bash
1. Abrir qualquer página implementada
2. Inspecionar elemento
3. Ver tag <title> no <head>
4. Confirmar título específico e não genérico "GiraMãe"
```

### **2. Verificar no Google Analytics DebugView**
```bash
1. Acessar: analytics.google.com → DebugView
2. Navegar pelas páginas do site
3. Ver eventos page_view com parâmetro page_title
4. Confirmar títulos únicos para cada página
```

### **3. Verificar no GA4 Relatórios**
```bash
1. GA4 → Relatórios → Engajamento → Páginas e telas
2. Ver coluna "Título da página"
3. Confirmar títulos descritivos sem duplicatas de "GiraMãe"
```

---

## 🎯 Benefícios Implementados

### **ANTES (Problema)**
```
Título da página          | Visualizações
--------------------------|---------------
GiraMãe                  | 1.234
GiraMãe                  | 567
GiraMãe                  | 890
```
❌ Impossível diferenciar páginas!

### **DEPOIS (Solução)**
```
Título da página                              | Visualizações
----------------------------------------------|---------------
Feed de Itens | GiraMãe                      | 1.234
Publicar Primeiro Item | Onboarding | GiraMãe | 567
Comprar Girinhas | GiraMãe                   | 890
Blog | Dicas para Mães | GiraMãe             | 456
```
✅ Identificação clara de cada página!

---

## 📊 Relatórios Possíveis

### **1. Funil de Onboarding Detalhado**
```
Verificar WhatsApp | Onboarding        → 100 usuários
Código de Verificação | Onboarding     → 90 usuários (-10%)
Seu Endereço | Onboarding              → 75 usuários (-17%)
Publicar Primeiro Item | Onboarding    → 30 usuários (-60%) ← GARGALO
Feed de Itens                          → 25 usuários (-17%)
```

### **2. Páginas Mais Visitadas (Top 5)**
```
1. Feed de Itens | GiraMãe              - 5.234 views
2. Comprar Girinhas | GiraMãe           - 1.890 views
3. Blog | Dicas para Mães | GiraMãe     - 1.456 views
4. Minha Carteira | GiraMãe             - 1.234 views
5. [Item] | Detalhe | GiraMãe           - 890 views
```

### **3. Tempo Médio por Seção**
```
Onboarding: 8min 34s
Blog: 3min 12s
Feed: 2min 45s
Detalhes: 1min 23s
Carteira: 2min 10s
```

---

## 🔧 Estrutura de Títulos

### **Padrão Adotado**
```
[Ação/Conteúdo] | [Seção] | GiraMãe
```

### **Exemplos por Tipo**

**Onboarding:**
```
Verificar WhatsApp | Onboarding | GiraMãe
Código de Verificação | Onboarding | GiraMãe
```

**Core Features:**
```
Feed de Itens | GiraMãe
[Nome do Item] | Detalhe | GiraMãe
Comprar Girinhas | GiraMãe
```

**Blog:**
```
Blog | Dicas para Mães | GiraMãe
[Título do Post] | Blog | GiraMãe
```

---

## 🚀 Próximas Páginas (Opcional)

Páginas que podem receber títulos descritivos no futuro:

### **Social**
- [ ] `/perfil` → "Meu Perfil | GiraMãe"
- [ ] `/perfil/:id` → "Perfil de [Nome] | GiraMãe"
- [ ] `/maes-seguidas` → "Mães que Sigo | GiraMãe"
- [ ] `/favoritos` → "Itens Favoritos | GiraMãe"

### **Gamificação**
- [ ] `/missoes` → "Missões | GiraMãe"
- [ ] `/indicacoes` → "Indicar Amigas | GiraMãe"

### **Institucional**
- [ ] `/` → "Início | GiraMãe - Troca de Roupas Infantis"
- [ ] `/como-funciona` → "Como Funciona | GiraMãe"
- [ ] `/sobre` → "Sobre Nós | GiraMãe"
- [ ] `/faq` → "Perguntas Frequentes | GiraMãe"

### **Admin**
- [ ] `/admin` → "Dashboard | Admin | GiraMãe"
- [ ] `/admin/ledger` → "Ledger Financeiro | Admin | GiraMãe"
- [ ] `/admin/blog` → "Gerenciar Blog | Admin | GiraMãe"

---

## ✅ Confirmação de Implementação

### **Arquivos Confirmados com Analytics:**

#### **FeedOptimized.tsx**
```typescript
✅ analytics.items.addToFavorites(itemId)
✅ analytics.items.removeFromFavorites(itemId)
✅ SEOHead com pageTitle.feed()
```

#### **CheckoutMercadoPago.tsx**
```typescript
✅ analytics.girinhas.purchaseStart(valorEmReais)
```

#### **useMercadoPago.ts**
```typescript
✅ analytics.girinhas.purchaseComplete(girinhas, valorReais, externalRef)
✅ analytics.girinhas.purchaseFailed('payment_declined')
```

---

## 📝 Notas de Implementação

### **Características**
- ✅ Todos os títulos são únicos e descritivos
- ✅ Estrutura consistente: [Ação] | [Seção] | GiraMãe
- ✅ Títulos dinâmicos para conteúdo variável (ex: nome do item, post)
- ✅ Integração com componente SEOHead existente
- ✅ Helper centralizado para manutenção fácil
- ✅ noindex=true para páginas de onboarding (não indexar no Google)

### **Manutenção**
Para adicionar título em nova página:
```typescript
import SEOHead from '@/components/seo/SEOHead';
import { pageTitle } from '@/lib/pageTitle';

<SEOHead 
  title={pageTitle.nomeDaPagina()}
  description="Descrição da página"
/>
```

---

## 🎯 Impacto nos Relatórios GA4

### **Eventos de Página Melhorados**
Todos os eventos `page_view` agora incluem:
- `page_title`: Título único e descritivo
- `page_location`: URL completa
- `page_path`: Caminho da rota

### **Segmentação Melhorada**
Agora é possível criar relatórios por:
- Seção (Onboarding, Blog, Core)
- Tipo de página (Feed, Detalhe, Carteira)
- Fase do funil (etapas do onboarding)

### **Análise de Gargalos**
Identificar exatamente onde usuários abandonam o fluxo:
```
Verificar WhatsApp → Código → Endereço → [GARGALO] → Primeiro Item
```

---

**Última atualização**: 2025-11-28
**Status**: ✅ IMPLEMENTADO E FUNCIONAL
**Cobertura**: 100% das páginas prioritárias
