/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_API_BASE_URL: string
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string
    // add other env variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}