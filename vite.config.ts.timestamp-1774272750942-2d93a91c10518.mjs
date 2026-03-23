// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/User/Desktop/GiraM%C3%A3e%20C%C3%B3digo%20Main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/User/Desktop/GiraM%C3%A3e%20C%C3%B3digo%20Main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/User/Desktop/GiraM%C3%A3e%20C%C3%B3digo%20Main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\User\\Desktop\\GiraM\xE3e C\xF3digo Main";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      // ✅ componentTagger controlado por variável de ambiente
      // Adiciona data-component nos elementos HTML para debugging
      env.VITE_ENABLE_COMPONENT_TAGGER === "true" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    // Garantir que arquivos públicos sejam servidos corretamente
    publicDir: "public",
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks básicos
            "vendor-react": ["react", "react-dom"],
            "vendor-router": ["react-router-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-ui": ["lucide-react"],
            // Separar páginas pesadas
            "page-perfil": ["/src/pages/Perfil.tsx"],
            "page-publicar": ["/src/pages/PublicarItem.tsx"],
            "page-feed": ["/src/pages/FeedOptimized.tsx"]
          }
        },
        // Garantir que service workers sejam copiados
        external: [
          "/OneSignalSDK.sw.js",
          "/OneSignalSDKWorker.js",
          "/sw.js"
        ]
      },
      // Otimizações básicas
      target: "esnext",
      minify: "esbuild",
      // ✅ Habilitar sourcemap em desenvolvimento para melhor debug
      sourcemap: mode === "development" ? "inline" : false,
      chunkSizeWarningLimit: 1e3,
      copyPublicDir: true
    },
    // ✅ Source maps para CSS também
    css: {
      devSourcemap: mode === "development"
    },
    // Otimizações de desenvolvimento
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "lucide-react"
      ]
    },
    // ✅ Configurações adicionais para melhor debugging
    define: {
      // Permite usar import.meta.env.DEV no código
      __DEV__: JSON.stringify(mode === "development")
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERlc2t0b3BcXFxcR2lyYU1cdTAwRTNlIENcdTAwRjNkaWdvIE1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzZXJcXFxcRGVza3RvcFxcXFxHaXJhTVx1MDBFM2UgQ1x1MDBGM2RpZ28gTWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXNlci9EZXNrdG9wL0dpcmFNJUMzJUEzZSUyMEMlQzMlQjNkaWdvJTIwTWFpbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAvLyBDYXJyZWdhciB2YXJpXHUwMEUxdmVpcyBkZSBhbWJpZW50ZSBiYXNlYWRvIG5vIG1vZGVcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIFxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogXCI6OlwiLFxuICAgICAgcG9ydDogODA4MCxcbiAgICB9LFxuICAgIFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICAvLyBcdTI3MDUgY29tcG9uZW50VGFnZ2VyIGNvbnRyb2xhZG8gcG9yIHZhcmlcdTAwRTF2ZWwgZGUgYW1iaWVudGVcbiAgICAgIC8vIEFkaWNpb25hIGRhdGEtY29tcG9uZW50IG5vcyBlbGVtZW50b3MgSFRNTCBwYXJhIGRlYnVnZ2luZ1xuICAgICAgZW52LlZJVEVfRU5BQkxFX0NPTVBPTkVOVF9UQUdHRVIgPT09ICd0cnVlJyAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcbiAgICBcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBcbiAgICAvLyBHYXJhbnRpciBxdWUgYXJxdWl2b3MgcFx1MDBGQWJsaWNvcyBzZWphbSBzZXJ2aWRvcyBjb3JyZXRhbWVudGVcbiAgICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxuICAgIFxuICAgIGJ1aWxkOiB7XG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgLy8gVmVuZG9yIGNodW5rcyBiXHUwMEUxc2ljb3NcbiAgICAgICAgICAgICd2ZW5kb3ItcmVhY3QnOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgJ3ZlbmRvci1yb3V0ZXInOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAgICd2ZW5kb3ItcXVlcnknOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxuICAgICAgICAgICAgJ3ZlbmRvci11aSc6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNlcGFyYXIgcFx1MDBFMWdpbmFzIHBlc2FkYXNcbiAgICAgICAgICAgICdwYWdlLXBlcmZpbCc6IFsnL3NyYy9wYWdlcy9QZXJmaWwudHN4J10sXG4gICAgICAgICAgICAncGFnZS1wdWJsaWNhcic6IFsnL3NyYy9wYWdlcy9QdWJsaWNhckl0ZW0udHN4J10sXG4gICAgICAgICAgICAncGFnZS1mZWVkJzogWycvc3JjL3BhZ2VzL0ZlZWRPcHRpbWl6ZWQudHN4J10sXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLy8gR2FyYW50aXIgcXVlIHNlcnZpY2Ugd29ya2VycyBzZWphbSBjb3BpYWRvc1xuICAgICAgICBleHRlcm5hbDogW1xuICAgICAgICAgICcvT25lU2lnbmFsU0RLLnN3LmpzJyxcbiAgICAgICAgICAnL09uZVNpZ25hbFNES1dvcmtlci5qcycsXG4gICAgICAgICAgJy9zdy5qcydcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIFxuICAgICAgLy8gT3RpbWl6YVx1MDBFN1x1MDBGNWVzIGJcdTAwRTFzaWNhc1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgICAgXG4gICAgICAvLyBcdTI3MDUgSGFiaWxpdGFyIHNvdXJjZW1hcCBlbSBkZXNlbnZvbHZpbWVudG8gcGFyYSBtZWxob3IgZGVidWdcbiAgICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/ICdpbmxpbmUnIDogZmFsc2UsXG4gICAgICBcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICAgIGNvcHlQdWJsaWNEaXI6IHRydWUsXG4gICAgfSxcbiAgICBcbiAgICAvLyBcdTI3MDUgU291cmNlIG1hcHMgcGFyYSBDU1MgdGFtYlx1MDBFOW1cbiAgICBjc3M6IHtcbiAgICAgIGRldlNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICB9LFxuICAgIFxuICAgIC8vIE90aW1pemFcdTAwRTdcdTAwRjVlcyBkZSBkZXNlbnZvbHZpbWVudG9cbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3JlYWN0JyxcbiAgICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICAgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsXG4gICAgICAgICdsdWNpZGUtcmVhY3QnXG4gICAgICBdLFxuICAgIH0sXG4gICAgXG4gICAgLy8gXHUyNzA1IENvbmZpZ3VyYVx1MDBFN1x1MDBGNWVzIGFkaWNpb25haXMgcGFyYSBtZWxob3IgZGVidWdnaW5nXG4gICAgZGVmaW5lOiB7XG4gICAgICAvLyBQZXJtaXRlIHVzYXIgaW1wb3J0Lm1ldGEuZW52LkRFViBubyBjXHUwMEYzZGlnb1xuICAgICAgX19ERVZfXzogSlNPTi5zdHJpbmdpZnkobW9kZSA9PT0gJ2RldmVsb3BtZW50JyksXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVSxTQUFTLGNBQWMsZUFBZTtBQUMzVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBO0FBQUE7QUFBQSxNQUdOLElBQUksaUNBQWlDLFVBQVUsZ0JBQWdCO0FBQUEsSUFDakUsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUVoQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLFdBQVc7QUFBQSxJQUVYLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQTtBQUFBLFlBRVosZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsWUFDckMsaUJBQWlCLENBQUMsa0JBQWtCO0FBQUEsWUFDcEMsZ0JBQWdCLENBQUMsdUJBQXVCO0FBQUEsWUFDeEMsYUFBYSxDQUFDLGNBQWM7QUFBQTtBQUFBLFlBRzVCLGVBQWUsQ0FBQyx1QkFBdUI7QUFBQSxZQUN2QyxpQkFBaUIsQ0FBQyw2QkFBNkI7QUFBQSxZQUMvQyxhQUFhLENBQUMsOEJBQThCO0FBQUEsVUFDOUM7QUFBQSxRQUNGO0FBQUE7QUFBQSxRQUdBLFVBQVU7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFHQSxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUE7QUFBQSxNQUdSLFdBQVcsU0FBUyxnQkFBZ0IsV0FBVztBQUFBLE1BRS9DLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxJQUNqQjtBQUFBO0FBQUEsSUFHQSxLQUFLO0FBQUEsTUFDSCxjQUFjLFNBQVM7QUFBQSxJQUN6QjtBQUFBO0FBQUEsSUFHQSxjQUFjO0FBQUEsTUFDWixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFHQSxRQUFRO0FBQUE7QUFBQSxNQUVOLFNBQVMsS0FBSyxVQUFVLFNBQVMsYUFBYTtBQUFBLElBQ2hEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
