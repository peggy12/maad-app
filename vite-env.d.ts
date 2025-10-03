/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVEPERSON_ACCOUNT_ID?: string;
  readonly VITE_LIVEPERSON_USERNAME?: string;
  readonly VITE_LIVEPERSON_PASSWORD?: string;
  readonly VITE_LIVEPERSON_TOKEN?: string;
  readonly VITE_LIVEPERSON_DOMAIN?: string;
  readonly VITE_FACEBOOK_PAGE_ID?: string;
  readonly VITE_FACEBOOK_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}