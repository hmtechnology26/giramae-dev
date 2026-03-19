# 📊 Sistema de Analytics - GiraMãe

## 🎯 Visão Geral

Este documento descreve a implementação completa do Google Analytics 4 (GA4) no GiraMãe, incluindo todos os eventos rastreados, arquivos modificados e como testar.

---

## 📋 Tabela de Conteúdo

- [Estrutura](#estrutura)
- [Eventos Implementados](#eventos-implementados)
- [Arquivos Modificados](#arquivos-modificados)
- [Como Testar](#como-testar)
- [Eventos Críticos para ROAS](#eventos-críticos-para-roas)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Estrutura

### Arquivo Central: `/src/lib/analytics.ts`

Biblioteca centralizada que contém:
- Função principal `trackEvent()` para enviar eventos
- Objeto `analytics` com métodos organizados por categoria
- Suporte para Google Analytics 4
- Preparado para Facebook Pixel (desabilitado por padrão)

**Categorias de eventos:**
- `auth` - Autenticação e cadastro
- `onboarding` - Funil de onboarding
- `feed` - Navegação no feed
- `search` - Busca e filtros
- `items` - Visualização e interação com itens
- `checkout` - Checkout e saldo
- `girinhas` - Compra de Girinhas (monetização)
- `missions` - Missões e gamificação
- `blog` - Engajamento com blog
- `social` - Interações sociais
- `partnerships` - Parcerias sociais

---

## 🎪 Eventos Implementados

### 🔐 1. AUTENTICAÇÃO (Auth)

#### 📄 Arquivo: `src/pages/Auth.tsx`
```typescript
// Quando clica em "Entrar com Google"
analytics.auth.signupStart('google');

// Após login bem-sucedido (detecta se é novo usuário)
analytics.auth.signupComplete(user.id, 'google'); // Novo cadastro
analytics.auth.login('google'); // Login recorrente
```

#### 📄 Arquivo: `src/hooks/useAuth.tsx`
```typescript
// Ao fazer logout
analytics.auth.logout();
```

**Eventos GA4:**
- `sign_up_start` → Início do cadastro
- `sign_up_complete` → Cadastro concluído
- `login` → Login realizado
- `logout` → Logout realizado

---

### 🚀 2. ONBOARDING (Funil de Entrada)

#### 📄 Arquivo: `src/pages/onboarding/WhatsAppOnboarding.tsx`
```typescript
// Ao entrar na página de WhatsApp
analytics.onboarding.phoneVerificationStart();
```

#### 📄 Arquivo: `src/pages/onboarding/CodigoOnboarding.tsx`
```typescript
// Após verificar código com sucesso
analytics.onboarding.phoneVerificationComplete();
```

#### 📄 Arquivo: `src/pages/onboarding/EnderecoOnboarding.tsx`
```typescript
// Após salvar endereço
analytics.onboarding.addressComplete(addressData.cidade);
```

#### 📄 Arquivo: `src/pages/ConceptoComunidadeOnboarding.tsx`
```typescript
// Ao clicar em "Continuar" após ver conceito
analytics.onboarding.conceptViewComplete();
```

#### 📄 Arquivo: `src/pages/PublicarPrimeiroItem.tsx` 🔥 CRÍTICO
```typescript
// Ao entrar na página
analytics.onboarding.firstItemUploadStart();

// Ao adicionar primeira foto
analytics.onboarding.firstItemPhotoAdded();

// Ao preencher formulário (selecionar categoria)
analytics.onboarding.firstItemFormFilled(formData.categoria);

// Ao completar item
const timeToComplete = Math.round((Date.now() - startTime) / 1000);
analytics.onboarding.firstItemComplete(item.id, item.categoria, timeToComplete);

// Ao concluir onboarding completo
analytics.onboarding.complete(totalTime, 1);
```

**Eventos GA4:**
- `phone_verification_start` → Iniciou verificação de telefone
- `phone_verification_complete` → Verificou telefone
- `address_complete` → Completou endereço
- `concept_view_complete` → Viu conceito da comunidade
- `first_item_upload_start` → Iniciou upload do primeiro item
- `first_item_photo_added` → Adicionou foto do item
- `first_item_form_filled` → Preencheu formulário
- `first_item_complete` → Completou primeiro item
- `onboarding_complete` → Onboarding concluído

---

### 🛍️ 3. FEED E NAVEGAÇÃO

#### 📄 Arquivo: `src/pages/FeedOptimized.tsx`
```typescript
// Ao entrar no feed
analytics.feed.view();

// Ao clicar em item do feed
analytics.feed.itemClick(itemId, position);

// Ao favoritar/desfavoritar
analytics.items.addToFavorites(itemId);
analytics.items.removeFromFavorites(itemId);
```

**Eventos GA4:**
- `view_feed` → Visualizou feed
- `feed_item_click` → Clicou em item do feed
- `add_to_wishlist` → Adicionou aos favoritos
- `remove_from_wishlist` → Removeu dos favoritos

---

### 🔍 4. BUSCA E FILTROS

#### 📄 Arquivo: `src/pages/BuscarItens.tsx`
```typescript
// Ao realizar busca
analytics.search.query(searchTerm, resultsCount);

// Ao aplicar filtro
analytics.search.filter(filterType, filterValue);
```

**Eventos GA4:**
- `search` → Realizou busca
- `filter` → Aplicou filtro

---

### 👗 5. ITENS (Visualização e Interação)

#### 📄 Arquivo: `src/pages/DetalhesItem.tsx`
```typescript
// Ao visualizar item
analytics.items.view(item.id, item.titulo, item.categoria, item.valor_girinhas);

// Ao reservar item (início do checkout)
analytics.items.reserve(item.id, item.valor_girinhas);

// Após transação concluída (gasto de Girinhas)
analytics.items.exchangeComplete(transaction.id, item.id, item.valor_girinhas);
```

**Eventos GA4:**
- `view_item` → Visualizou item
- `begin_checkout` → Iniciou reserva
- `spend_virtual_currency` → Gastou Girinhas

---

### 💰 6. MONETIZAÇÃO (Compra de Girinhas) 🔥 CRÍTICO

#### 📄 Arquivo: `src/components/girinhas/CheckoutMercadoPago.tsx`
```typescript
// Ao clicar em "Comprar"
const valorEmReais = quantidade * 1.00;
analytics.girinhas.purchaseStart(valorEmReais);
```

#### 📄 Arquivo: `src/hooks/useMercadoPago.ts`
```typescript
// Após pagamento aprovado (CRÍTICO PARA ROAS)
analytics.girinhas.purchaseComplete(
  girinhas,        // Quantidade
  valorReais,      // Valor em R$
  externalRef      // ID da transação
);

// Se pagamento falhou
analytics.girinhas.purchaseFailed('payment_declined');
```

**Eventos GA4:**
- `begin_checkout` → Iniciou compra de Girinhas
- `purchase` 💰 → **COMPRA CONCLUÍDA (único evento de receita real)**
- `purchase_failed` → Falha no pagamento

> ⚠️ **IMPORTANTE:** O evento `purchase` é o **ÚNICO evento de receita real** do sistema. Ele é usado para calcular o ROAS (Return on Ad Spend) no Google Ads. Não confundir com `spend_virtual_currency`.

---

### 🎮 7. MISSÕES E GAMIFICAÇÃO

#### 📄 Arquivo: `src/pages/Missoes.tsx`
```typescript
// Ao iniciar missão
analytics.missions.start(mission.id, mission.tipo, mission.recompensa_girinhas);

// Ao completar missão
const timeToComplete = Math.round((Date.now() - startTime) / 1000);
analytics.missions.complete(mission.id, mission.tipo, timeToComplete);

// Ao subir de nível
analytics.missions.levelUp(previousLevel, newLevel);
```

**Eventos GA4:**
- `mission_start` → Iniciou missão
- `mission_complete` → Completou missão
- `level_up` → Subiu de nível

---

### 📝 8. BLOG E CONTEÚDO

#### 📄 Arquivo: `src/pages/BlogPost.tsx`
```typescript
// Ao visualizar post
analytics.blog.viewPost(post.id, post.title, post.category);

// Ao sair do post (mede engagement)
const timeSpent = Math.round((Date.now() - startTime) / 1000);
analytics.blog.engagement(post.id, timeSpent, scrollDepth);

// Ao clicar em CTA
analytics.blog.clickCTA(post.id, ctaType);
```

**Eventos GA4:**
- `view_blog_post` → Visualizou post
- `blog_engagement` → Engajamento com post
- `blog_cta_click` → Clicou em CTA

---

### 👥 9. SOCIAL

#### 📄 Arquivo: `src/pages/PerfilPublicoMae.tsx`
```typescript
// Ao visualizar perfil
analytics.social.viewProfile(profileUserId);

// Ao seguir/deixar de seguir
analytics.social.followUser(userId);
analytics.social.unfollowUser(userId);
```

**Eventos GA4:**
- `view_profile` → Visualizou perfil
- `follow_user` → Seguiu usuário
- `unfollow_user` → Deixou de seguir

---

## 📁 Arquivos Modificados

### ✅ Arquivos com Analytics Implementado

| Arquivo | Status | Eventos |
|---------|--------|---------|
| `src/lib/analytics.ts` | ✅ | Biblioteca central |
| `src/pages/Auth.tsx` | ✅ | signupStart, signupComplete, login |
| `src/hooks/useAuth.tsx` | ✅ | logout |
| `src/pages/onboarding/WhatsAppOnboarding.tsx` | ✅ | phoneVerificationStart |
| `src/pages/onboarding/CodigoOnboarding.tsx` | ✅ | phoneVerificationComplete |
| `src/pages/onboarding/EnderecoOnboarding.tsx` | ✅ | addressComplete |
| `src/pages/ConceptoComunidadeOnboarding.tsx` | ✅ | conceptViewComplete |
| `src/pages/PublicarPrimeiroItem.tsx` | ✅ | firstItem* (todos) |
| `src/pages/FeedOptimized.tsx` | ✅ | view, itemClick, favoritos |
| `src/pages/BuscarItens.tsx` | ✅ | search, filter |
| `src/pages/DetalhesItem.tsx` | ✅ | view, reserve, exchange |
| `src/components/girinhas/CheckoutMercadoPago.tsx` | ✅ | purchaseStart |
| `src/hooks/useMercadoPago.ts` | ✅ | purchaseComplete, purchaseFailed |
| `src/pages/Missoes.tsx` | ✅ | missions (start, complete, levelUp) |
| `src/pages/BlogPost.tsx` | ✅ | blog (view, engagement, CTA) |
| `src/pages/PerfilPublicoMae.tsx` | ✅ | social (view, follow) |
| `src/pages/Carteira.tsx` | ✅ | wallet view |

**Total:** 17 arquivos modificados | **Cobertura:** 100% ✅

---

## 🧪 Como Testar

### 1. Modo Desenvolvimento (Console)

Abra o console do navegador (F12) e navegue pela aplicação. Você verá logs como:

```javascript
📊 GA Event: sign_up_start { method: 'google' }
📊 GA Event: view_feed {}
📊 GA Event: view_item { item_id: '...', value: 50, currency: 'GIRINHAS' }
📊 GA Event: purchase { transaction_id: '...', value: 10, currency: 'BRL' }
```

### 2. Google Analytics 4 - DebugView (Recomendado)

1. Acesse: https://analytics.google.com
2. Vá em: **Admin** → **DebugView**
3. Execute ações no app
4. Veja eventos em tempo real com todos os parâmetros

### 3. Google Analytics 4 - Tempo Real

1. Acesse: https://analytics.google.com
2. Vá em: **Relatórios** → **Tempo real**
3. Veja eventos sendo disparados ao vivo

### 4. Google Tag Assistant (Extensão Chrome)

Instale a extensão e veja eventos sendo enviados em tempo real.

---

## 🔥 Eventos Críticos para ROAS

### 💰 Evento de Conversão Principal

```typescript
// src/hooks/useMercadoPago.ts (linha 120-127)
analytics.girinhas.purchaseComplete(
  girinhas,      // ex: 100
  valorReais,    // ex: 100.00
  externalRef    // ex: "MP-123456"
);
```

**Mapeia para:**
```javascript
gtag('event', 'purchase', {
  transaction_id: 'MP-123456',
  value: 100.00,
  currency: 'BRL'
});
```

### ⚠️ IMPORTANTE - Diferença entre Eventos de Conversão

| Evento | Tipo | Descrição | Valor |
|--------|------|-----------|-------|
| `purchase` | 💰 Receita Real | Compra de Girinhas com R$ | BRL (dinheiro real) |
| `spend_virtual_currency` | 🪙 Moeda Virtual | Gasto de Girinhas em itens | GIRINHAS (interno) |
| `begin_checkout` | 🎯 Intenção | Início de compra/reserva | BRL ou GIRINHAS |

**Para Google Ads:**
- Use `purchase` como evento de conversão
- Configure o valor de conversão = valor do evento
- **NÃO** use `spend_virtual_currency` como conversão

---

## 🐛 Troubleshooting

### Eventos não aparecem no GA4

1. **Verifique o Measurement ID:**
   - Arquivo: `index.html`
   - Deve ter: `G-V457GN636X` (ou seu ID)

2. **Verifique o console:**
   - Deve mostrar logs `📊 GA Event: ...`
   - Se não mostrar, o tracking não está funcionando

3. **Verifique o DebugView:**
   - Pode demorar até 5 minutos para aparecer
   - Use modo de depuração do Chrome

### Eventos com parâmetros errados

1. Verifique o arquivo `src/lib/analytics.ts`
2. Compare com a documentação do GA4
3. Teste no console do navegador

### ROAS não calculando corretamente

1. **Verifique se o evento `purchase` está sendo enviado:**
   ```javascript
   // Console deve mostrar:
   📊 GA Event: purchase { transaction_id: '...', value: 100, currency: 'BRL' }
   ```

2. **No Google Ads:**
   - Vá em: **Ferramentas** → **Conversões**
   - Verifique se `purchase` está configurado
   - Valor = `Usar o valor da transação`

3. **Aguarde dados:**
   - Pode levar até 24h para calcular ROAS
   - Precisa de pelo menos 15 conversões para ser confiável

---

## 📈 Relatórios Recomendados no GA4

### 1. Funil de Onboarding
```
Eventos:
- sign_up_start
- phone_verification_start
- phone_verification_complete
- address_complete
- concept_view_complete
- first_item_upload_start
- first_item_complete
- onboarding_complete
```

### 2. Funil de Compra (Girinhas)
```
Eventos:
- begin_checkout (girinhas)
- purchase
- purchase_failed
```

### 3. Funil de Troca (Itens)
```
Eventos:
- view_item
- begin_checkout (reserva)
- spend_virtual_currency
```

### 4. Engajamento
```
Métricas:
- view_feed
- feed_item_click
- search
- add_to_wishlist
- mission_complete
- blog_engagement
```

---

## 🚀 Próximos Passos

### 1. Facebook Pixel (Opcional)

Para ativar o Facebook Pixel:

1. **Edite `src/lib/analytics.ts`:**
   ```typescript
   const TRACKING_CONFIG = {
     ENABLE_GOOGLE_ANALYTICS: true,
     ENABLE_FACEBOOK_PIXEL: true, // ⬅️ Mude para true
   };
   ```

2. **Adicione o script no `index.html`:**
   ```html
   <!-- Facebook Pixel Code -->
   <script>
     !function(f,b,e,v,n,t,s)
     {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
     n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];
     s.parentNode.insertBefore(t,s)}(window, document,'script',
     'https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'SEU_PIXEL_ID');
     fbq('track', 'PageView');
   </script>
   ```

### 2. Eventos Customizados Adicionais

Adicione mais eventos conforme necessário:
- Compartilhamentos
- Tempo em página
- Scroll depth
- Erros de formulário

### 3. Google Tag Manager

Para maior flexibilidade, considere migrar para GTM no futuro.

---

## 📞 Suporte

**Dúvidas?** Entre em contato com o time de desenvolvimento.

**Documentação oficial:**
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)

---

## 📝 Changelog

### v1.0.0 - 2025-11-28
- ✅ Implementação completa do Google Analytics 4
- ✅ 100% dos eventos implementados (17 arquivos)
- ✅ Eventos críticos de monetização (purchase)
- ✅ Funil de onboarding completo
- ✅ Tracking de favoritos no feed
- ✅ Preparado para Facebook Pixel

---

**Última atualização:** 28/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Produção
