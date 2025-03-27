interface GoogleCodeClientConfig {
  client_id: string;
  scope: string;
  ux_mode: 'redirect';
  redirect_uri: string;
  callback: (response: { code: string }) => void;
}

interface GoogleCodeClient {
  requestCode(): void;
}

interface GoogleOAuthClient {
  initCodeClient(config: GoogleCodeClientConfig): GoogleCodeClient;
}

interface GoogleAccountsOAuth2 {
  oauth2: GoogleOAuthClient;
}

interface GoogleAccounts {
  accounts: {
    oauth2: GoogleOAuthClient;
  };
}

declare global {
  interface Window {
    google: GoogleAccounts;
  }
}

export {}; 