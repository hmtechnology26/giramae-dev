
import { lazy } from 'react';

// Cache para componentes já carregados
const routeCache = new Map<string, Promise<any>>();

// Mapeamento de rotas para imports dinâmicos
const routeImports: Record<string, () => Promise<any>> = {
  '/feed': () => import('../pages/FeedOptimized'),
  '/perfil': () => import('../pages/Perfil'),
  '/carteira': () => import('../pages/Carteira'),
  '/reservas': () => import('../pages/MinhasReservas'),
  '/publicar': () => import('../pages/PublicarItem'),
  '/indicacoes': () => import('../pages/Indicacoes'),
  '/apoiadores': () => import('../pages/Apoiadores'),
  '/admin': () => import('../pages/AdminDashboard'),
};

export const usePreloadRoute = () => {
  const preloadRoute = (path: string) => {
    // Verifica se já está em cache
    if (routeCache.has(path)) {
      return routeCache.get(path);
    }

    // Verifica se existe import para esta rota
    const importFn = routeImports[path];
    if (!importFn) {
      console.warn(`No preload import found for route: ${path}`);
      return Promise.resolve();
    }

    try {
      // Inicia o preload
      const preloadPromise = importFn()
        .then((module) => {
          console.log(`Route ${path} preloaded successfully`);
          return module;
        })
        .catch((error) => {
          console.error(`Failed to preload route ${path}:`, error);
          // Remove do cache em caso de erro para permitir retry
          routeCache.delete(path);
          return null;
        });

      // Armazena no cache
      routeCache.set(path, preloadPromise);
      return preloadPromise;
    } catch (error) {
      console.error(`Error setting up preload for ${path}:`, error);
      return Promise.resolve();
    }
  };

  const clearCache = () => {
    routeCache.clear();
  };

  return { preloadRoute, clearCache };
};
