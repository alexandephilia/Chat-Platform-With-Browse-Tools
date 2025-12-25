/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY_1: string
    readonly VITE_GEMINI_API_KEY_2: string
    readonly VITE_GROQ_API_KEY: string
    readonly VITE_OPENROUTER_API_KEY: string
    readonly VITE_EXA_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
