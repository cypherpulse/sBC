/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_CONTRACT_NAME: string;
  readonly VITE_NETWORK_URL: string;
  readonly VITE_EXPLORER_URL: string;
  readonly VITE_HIRO_API_KEY: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
