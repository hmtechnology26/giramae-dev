import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    
    plugins: [
      react(),
      // ✅ componentTagger controlado por variável de ambiente
      // Adiciona data-component nos elementos HTML para debugging
      env.VITE_ENABLE_COMPONENT_TAGGER === 'true' && componentTagger(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Garantir que arquivos públicos sejam servidos corretamente
    publicDir: 'public',
    
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks básicos
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-ui': ['lucide-react'],
            
            // Separar páginas pesadas
            'page-perfil': ['/src/pages/Perfil.tsx'],
            'page-publicar': ['/src/pages/PublicarItem.tsx'],
            'page-feed': ['/src/pages/FeedOptimized.tsx'],
          }
        },
        
        // Garantir que service workers sejam copiados
        external: [
          '/OneSignalSDK.sw.js',
          '/OneSignalSDKWorker.js',
          '/sw.js'
        ]
      },
      
      // Otimizações básicas
      target: 'esnext',
      minify: 'esbuild',
      
      // ✅ Habilitar sourcemap em desenvolvimento para melhor debug
      sourcemap: mode === 'development' ? 'inline' : false,
      
      chunkSizeWarningLimit: 1000,
      copyPublicDir: true,
    },
    
    // ✅ Source maps para CSS também
    css: {
      devSourcemap: mode === 'development',
    },
    
    // Otimizações de desenvolvimento
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react'
      ],
    },
    
    // ✅ Configurações adicionais para melhor debugging
    define: {
      // Permite usar import.meta.env.DEV no código
      __DEV__: JSON.stringify(mode === 'development'),
    },
  };
});
