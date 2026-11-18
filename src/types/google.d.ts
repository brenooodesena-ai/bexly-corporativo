export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: any, callback?: any) => void;
          cancel: () => void;
        };
        oauth2: any;
      };
    };
  }
}

