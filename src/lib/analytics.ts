// src/lib/analytics.ts

/**
 * 📊 Biblioteca de Analytics do GiraMãe
 * 
 * Esta biblioteca centraliza todo o tracking de eventos do Google Analytics.
 * Use as funções deste arquivo em vez de chamar window.gtag diretamente.
 */

/**
 * Tipos de eventos do Google Analytics
 */
type EventParams = {
  [key: string]: string | number | boolean;
};

// ============================================================================
// CONFIGURAÇÃO DE PLATAFORMAS
// ============================================================================

/**
 * Mapeamento: Evento GA4 -> Evento Padrão do Facebook
 * 
 * Eventos Padrão do Facebook têm melhor otimização de campanhas.
 * Eventos não mapeados serão enviados como Custom Events.
 */
const FB_EVENT_MAP: Record<string, string> = {
  'sign_up': 'CompleteRegistration',
  'purchase': 'Purchase',
  'begin_checkout': 'InitiateCheckout',
  'view_item': 'ViewContent',
  'search': 'Search',
  'add_to_wishlist': 'AddToWishlist',
  'contact': 'Contact',
};

/**
 * Habilita/Desabilita plataformas de tracking
 * 
 * Para ativar o Facebook Pixel no futuro:
 * 1. Adicione o script do Facebook no index.html
 * 2. Mude ENABLE_FACEBOOK_PIXEL para true
 * 3. Configure FACEBOOK_PIXEL_ID no .env
 */
const TRACKING_CONFIG = {
  ENABLE_GOOGLE_ANALYTICS: true,
  ENABLE_FACEBOOK_PIXEL: false, // ⬅️ Mude para true quando quiser ativar
};

// ============================================================================
// FUNÇÃO PRINCIPAL DE TRACKING
// ============================================================================

/**
 * Envia um evento para todas as plataformas habilitadas
 * 
 * @param eventName - Nome do evento (ex: 'sign_up', 'purchase')
 * @param parameters - Parâmetros adicionais do evento
 * 
 * @example
 * trackEvent('purchase', { 
 *   transaction_id: '12345',
 *   value: 100,
 *   currency: 'BRL'
 * });
 */
export const trackEvent = (
  eventName: string, 
  parameters?: EventParams
): void => {
  // ========================
  // GOOGLE ANALYTICS
  // ========================
  if (TRACKING_CONFIG.ENABLE_GOOGLE_ANALYTICS) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
      
      if (import.meta.env.DEV) {
        console.log('📊 GA Event:', eventName, parameters);
      }
    }
  }
  
  // ========================
  // FACEBOOK PIXEL
  // ========================
  if (TRACKING_CONFIG.ENABLE_FACEBOOK_PIXEL) {
    if (typeof window !== 'undefined' && window.fbq) {
      const fbEventName = FB_EVENT_MAP[eventName];
      
      if (fbEventName) {
        // Evento Padrão (melhor para otimização de campanhas)
        window.fbq('track', fbEventName, parameters);
        
        if (import.meta.env.DEV) {
          console.log('🟦 FB Standard:', fbEventName, parameters);
        }
      } else {
        // Evento Personalizado
        window.fbq('trackCustom', eventName, parameters);
        
        if (import.meta.env.DEV) {
          console.log('🟦 FB Custom:', eventName, parameters);
        }
      }
    }
  }
};

/**
 * Rastreia visualização de página
 * 
 * @param path - Caminho da página (ex: '/feed')
 * @param title - Título da página (opcional)
 */
export const trackPageView = (
  path: string, 
  title?: string
): void => {
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-V457GN636X';
  
  // ========================
  // GOOGLE ANALYTICS
  // ========================
  if (TRACKING_CONFIG.ENABLE_GOOGLE_ANALYTICS) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
      });
      
      if (import.meta.env.DEV) {
        console.log('📄 GA Page View:', path, title || '');
      }
    }
  }
  
  // ========================
  // FACEBOOK PIXEL
  // ========================
  if (TRACKING_CONFIG.ENABLE_FACEBOOK_PIXEL) {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
      
      if (import.meta.env.DEV) {
        console.log('🟦 FB PageView:', path);
      }
    }
  }
};

/**
 * Rastreia erros e exceções
 * 
 * @param description - Descrição do erro
 * @param fatal - Se o erro é fatal (padrão: false)
 */
export const trackException = (
  description: string, 
  fatal: boolean = false
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  }
};

/**
 * Define propriedades do usuário
 * 
 * @param properties - Propriedades do usuário
 * 
 * @example
 * setUserProperties({ 
 *   user_type: 'premium',
 *   city: 'Canoas' 
 * });
 */
export const setUserProperties = (
  properties: EventParams
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Define o ID do usuário autenticado
 * 
 * @param userId - ID do usuário
 */
export const setUserId = (userId: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_id', userId);
  }
};

/**
 * Rastreia tempo de permanência em uma página
 * Chame no useEffect cleanup para medir o tempo
 * 
 * @param pageName - Nome da página
 * @param startTime - Timestamp de início (Date.now())
 */
export const trackTimeOnPage = (
  pageName: string,
  startTime: number
): void => {
  const timeSpent = Math.round((Date.now() - startTime) / 1000); // em segundos
  
  trackEvent('time_on_page', {
    page_name: pageName,
    time_seconds: timeSpent,
  });
};

// ============================================================================
// EVENTOS ESPECÍFICOS DO GIRAMÃE
// ============================================================================

/**
 * 🔐 AUTH - Eventos de autenticação
 */
export const analytics = {
  
  // AUTH & CADASTRO
  auth: {
    signupStart: (method: 'email' | 'google') => {
      trackEvent('sign_up_start', { method });
    },
    
    signupComplete: (userId: string, method: 'email' | 'google') => {
      trackEvent('sign_up_complete', { method });
      setUserId(userId);
    },
    
    login: (method: 'email' | 'google') => {
      trackEvent('login', { method });
    },
    
    logout: () => {
      trackEvent('logout');
    },
  },
  
  // ONBOARDING
  onboarding: {
    stepComplete: (stepNumber: number, stepName: string) => {
      trackEvent('onboarding_step_complete', {
        step_number: stepNumber,
        step_name: stepName,
      });
    },
    
    phoneVerificationStart: () => {
      trackEvent('phone_verification_start');
    },
    
    phoneVerificationComplete: () => {
      trackEvent('phone_verification_complete');
    },
    
    addressComplete: (city: string) => {
      trackEvent('address_complete', { city });
      setUserProperties({ city });
    },
    
    conceptViewComplete: () => {
      trackEvent('concept_view_complete');
    },
    
    firstItemUploadStart: () => {
      trackEvent('first_item_upload_start');
    },
    
    firstItemPhotoAdded: () => {
      trackEvent('first_item_photo_added');
    },
    
    firstItemFormFilled: (category: string) => {
      trackEvent('first_item_form_filled', { category });
    },
    
    firstItemComplete: (itemId: string, category: string, timeToComplete: number) => {
      trackEvent('first_item_complete', {
        item_id: itemId,
        category,
        time_to_complete: timeToComplete,
      });
    },
    
    complete: (totalTime: number, itemsAdded: number) => {
      trackEvent('onboarding_complete', {
        total_time: totalTime,
        items_added: itemsAdded,
      });
    },
  },
  
  // FEED & NAVEGAÇÃO CORE
  feed: {
    view: () => {
      trackEvent('view_feed');
    },
    
    scrollDepth: (depth: number) => {
      trackEvent('feed_scroll', { scroll_depth: depth });
    },
    
    itemClick: (itemId: string, position: number) => {
      trackEvent('feed_item_click', {
        item_id: itemId,
        position,
      });
    },
  },
  
  // BUSCA
  search: {
    query: (searchTerm: string, resultsCount: number) => {
      trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount,
      });
    },
    
    filter: (filterType: string, filterValue: string) => {
      trackEvent('filter', {
        filter_type: filterType,
        filter_value: filterValue,
      });
    },
  },
  
  // ITENS - Visualização e Interesse
  items: {
    view: (itemId: string, itemName: string, category: string, price: number) => {
      trackEvent('view_item', {
        item_id: itemId,
        item_name: itemName,
        item_category: category,
        value: price,
        currency: 'GIRINHAS',
      });
    },
    
    addToFavorites: (itemId: string) => {
      trackEvent('add_to_wishlist', { item_id: itemId });
    },
    
    removeFromFavorites: (itemId: string) => {
      trackEvent('remove_from_wishlist', { item_id: itemId });
    },
    
    reserve: (itemId: string, value: number) => {
      trackEvent('begin_checkout', {
        item_id: itemId,
        value,
        currency: 'GIRINHAS',
      });
    },
    
    // CRÍTICO: Quando completa uma transação com GIRINHAS (economia interna)
    exchangeComplete: (transactionId: string, itemId: string, girinhasSpent: number) => {
      trackEvent('spend_virtual_currency', {
        transaction_id: transactionId,
        item_name: itemId,
        virtual_currency_name: 'Girinhas',
        value: girinhasSpent,
      });
    },
  },
  
  // CHECKOUT & TRANSAÇÕES
  checkout: {
    insufficientBalance: (required: number, available: number, context: string) => {
      trackEvent('insufficient_balance', {
        required,
        available,
        deficit: required - available,
        context,
      });
    },
  },
  
  // GIRINHAS (Entrada de Dinheiro Real - ROAS CRÍTICO)
  girinhas: {
    purchaseStart: (packageValue: number) => {
      trackEvent('begin_checkout', {
        value: packageValue,
        currency: 'BRL'
      });
    },
    
    // CRÍTICO: Este é o ÚNICO 'purchase' real do sistema
    purchaseComplete: (girinhasAmount: number, valueInReais: number, transactionId: string) => {
      trackEvent('purchase', {
        transaction_id: transactionId,
        value: valueInReais,
        currency: 'BRL'
      });
    },
    
    purchaseFailed: (reason: string) => {
      trackEvent('purchase_failed', { reason });
    },
  },
  
  // MISSÕES & GAMIFICAÇÃO
  missions: {
    start: (missionId: string, missionType: string, reward: number) => {
      trackEvent('mission_start', {
        mission_id: missionId,
        mission_type: missionType,
        reward_girinhas: reward,
      });
    },
    
    complete: (missionId: string, missionType: string, timeToComplete: number) => {
      trackEvent('mission_complete', {
        mission_id: missionId,
        mission_type: missionType,
        time_to_complete: timeToComplete,
      });
    },
    
    levelUp: (previousLevel: number, newLevel: number) => {
      trackEvent('level_up', {
        previous_level: previousLevel,
        new_level: newLevel,
      });
    },
  },
  
  // BLOG & CONTEÚDO
  blog: {
    viewPost: (postId: string, postTitle: string, category: string) => {
      trackEvent('view_blog_post', {
        post_id: postId,
        post_title: postTitle,
        category,
      });
    },
    
    engagement: (postId: string, timeSpent: number, scrollDepth: number) => {
      trackEvent('blog_engagement', {
        post_id: postId,
        time_spent: timeSpent,
        scroll_depth: scrollDepth,
      });
    },
    
    clickCTA: (postId: string, ctaType: string) => {
      trackEvent('blog_cta_click', {
        post_id: postId,
        cta_type: ctaType,
      });
    },
  },
  
  // SOCIAL
  social: {
    followUser: (followedUserId: string) => {
      trackEvent('follow_user', { followed_user_id: followedUserId });
    },
    
    unfollowUser: (unfollowedUserId: string) => {
      trackEvent('unfollow_user', { unfollowed_user_id: unfollowedUserId });
    },
    
    viewProfile: (profileUserId: string) => {
      trackEvent('view_profile', { profile_user_id: profileUserId });
    },
  },
  
  // PARCERIAS
  partnerships: {
    view: (organizationId: string, programId: string) => {
      trackEvent('view_partnership', {
        organization_id: organizationId,
        program_id: programId,
      });
    },
    
    referral: (partnerId: string, partnerType: string) => {
      trackEvent('partner_referral', {
        partner_id: partnerId,
        partner_type: partnerType,
      });
    },
  },
};

// Declaração de tipos globais para TypeScript
declare global {
  interface Window {
    // Google Analytics
    gtag: (
      command: string,
      targetId: string | Date,
      config?: EventParams | string
    ) => void;
    dataLayer: unknown[];
    
    // Facebook Pixel (preparado para o futuro)
    fbq?: (
      command: 'track' | 'trackCustom',
      eventName: string,
      params?: EventParams
    ) => void;
    _fbq?: unknown;
  }
}