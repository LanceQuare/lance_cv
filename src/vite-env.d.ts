/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_SCRIPT_URL?: string
  readonly VITE_ANALYTICS_DATA_DOMAIN?: string
  readonly VITE_ANALYTICS_WEBSITE_ID?: string
  readonly VITE_ANALYTICS_HOST_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}