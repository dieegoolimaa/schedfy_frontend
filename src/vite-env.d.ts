/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string
    // add other env variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}