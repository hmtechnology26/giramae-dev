
// Declarações globais para OneSignal v16
declare global {
  interface Window {
    OneSignal?: {
      User?: {
        addTag: (key: string, value: string) => Promise<void>;
        addAlias: (label: string, id: string) => Promise<void>;
        removeAlias: (label: string) => Promise<void>;
        PushSubscription?: {
          id: string | null;
          token: string | null;
          optedIn: boolean;
          optIn: () => Promise<void>;
          addEventListener: (event: string, callback: (event: any) => void) => void;
        };
      };
      init: (config: any) => Promise<void>;
      initialized?: boolean;
      push?: (callback: () => void) => void;
      
      // Métodos v16 específicos
      User: {
        addTag: (key: string, value: string) => Promise<void>;
        removeTag: (key: string) => Promise<void>;
        getTags: () => Promise<Record<string, string>>;
        addAlias: (label: string, id: string) => Promise<void>;
        removeAlias: (label: string) => Promise<void>;
        addEmail: (email: string) => Promise<void>;
        addSms: (sms: string) => Promise<void>;
        PushSubscription: {
          id: string | null;
          token: string | null;
          optedIn: boolean;
          optIn: () => Promise<void>;
          addEventListener: (event: string, callback: (event: any) => void) => void;
        };
      };
      
      // Métodos de sessão e notificações
      Session: {
        sendOutcome: (name: string, value?: number) => Promise<void>;
        sendUniqueOutcome: (name: string) => Promise<void>;
      };
      
      Notifications: {
        addEventListener: (event: string, callback: (event: any) => void) => void;
        requestPermission: () => Promise<boolean>;
        permission: boolean;
      };
      
      // Métodos legados (ainda funcionam na v16)
      setExternalUserId?: (userId: string) => Promise<void>;
      getPlayerId?: () => Promise<string | null>;
    };
    
    // OneSignal Deferred para carregamento assíncrono
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
  }
}

export {};
