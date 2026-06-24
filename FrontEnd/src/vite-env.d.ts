/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do BackEnd (ex.: https://oiaa-backend.vercel.app). Vazio = mesma origem / modo local. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
