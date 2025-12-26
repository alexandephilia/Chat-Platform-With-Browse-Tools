/**
 * Unified Model Configuration
 * Defines capabilities for each AI model to manage features consistently
 */

import { ModelIconKey, ProviderIconKey } from "./modelIcons";


export type ModelProvider = "gemini" | "openrouter" | "groq" | "routeway";

/**
 * Tool provider for web search
 * - 'built-in': Uses Groq's server-side search (Compound models)
 * - 'exa': Uses Exa API for search (requires local function calling)
 * - 'none': No search capability
 */
export type ToolProvider = "built-in" | "exa" | "none";

/**
 * Model capabilities configuration
 */
export interface ModelCapabilities {
    // Can use web search tools
    supportsTools: boolean;
    // Which tool provider to use for search
    toolProvider: ToolProvider;
    // Can use thinking/reasoning mode
    supportsThinking: boolean;
    // Has native reasoning (like DeepSeek R1) vs tag-based (<thinking>)
    hasNativeReasoning: boolean;
    // Can process image attachments
    supportsImages: boolean;
    // Can process document/file attachments (text extraction)
    supportsDocuments: boolean;
    // Maximum context length (for reference)
    maxContextLength: number;
    // Can use tools and thinking simultaneously
    supportsToolsWithThinking: boolean;
    // Can use attachments with tools
    supportsAttachmentsWithTools: boolean;
}

export interface AIModel {
    id: string;
    name: string;
    provider: ModelProvider;
    providerLabel: string;
    providerIcon: ProviderIconKey;
    description: string;
    icon: ModelIconKey;
    isFree?: boolean;
    capabilities: ModelCapabilities;
}

/**
 * All available models with their capabilities
 */
export const AVAILABLE_MODELS: AIModel[] = [
    {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash",
        provider: "gemini",
        providerLabel: "Google",
        providerIcon: "Google",
        description: "Fast + Tools + Thinking",
        icon: "Gemini",
        isFree: false,
        capabilities: {
            supportsTools: true,
            toolProvider: "exa",
            supportsThinking: true,
            hasNativeReasoning: true,
            supportsImages: true,
            supportsDocuments: true,
            maxContextLength: 1000000,
            supportsToolsWithThinking: true,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "gemini-3-pro-preview",
        name: "Gemini 3 Pro",
        provider: "gemini",
        providerLabel: "Google",
        providerIcon: "Google",
        description: "Advanced + Tools + Thinking",
        icon: "Gemini",
        isFree: false,
        capabilities: {
            supportsTools: true,
            toolProvider: "exa",
            supportsThinking: true,
            hasNativeReasoning: true,
            supportsImages: true,
            supportsDocuments: true,
            maxContextLength: 1000000,
            supportsToolsWithThinking: true,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "moonshotai/kimi-k2-instruct-0905",
        name: "Kimi K2",
        provider: "groq",
        providerLabel: "Groq",
        providerIcon: "Groq",
        description: "Fast + Tools",
        icon: "Kimi",
        isFree: true,
        capabilities: {
            supportsTools: true,
            toolProvider: "exa",
            supportsThinking: true,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 131072,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "groq/compound-mini",
        name: "Compound Mini",
        provider: "groq",
        providerLabel: "Groq",
        providerIcon: "Groq",
        description: "Fast + Built-in Search",
        icon: "Groq",
        isFree: true,
        capabilities: {
            supportsTools: true,
            toolProvider: "built-in",
            supportsThinking: false,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 32768,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "groq/compound",
        name: "Compound",
        provider: "groq",
        providerLabel: "Groq",
        providerIcon: "Groq",
        description: "Multi-tools + Web + Code",
        icon: "Groq",
        isFree: true,
        capabilities: {
            supportsTools: true,
            toolProvider: "built-in",
            supportsThinking: false,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 131072,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "nex-agi/deepseek-v3.1-nex-n1:free",
        name: "DeepSeek V3.1",
        provider: "openrouter",
        providerLabel: "OpenRouter",
        providerIcon: "OpenRouter",
        description: "Advanced Model + Tools",
        icon: "DeepSeek",
        isFree: true,
        capabilities: {
            supportsTools: true,
            toolProvider: "exa",
            supportsThinking: true,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 65536,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "z-ai/glm-4.5-air:free",
        name: "GLM 4.5 Air",
        provider: "openrouter",
        providerLabel: "OpenRouter",
        providerIcon: "OpenRouter",
        description: "Good For Daily Use",
        icon: "GLM",
        isFree: true,
        capabilities: {
            supportsTools: false,
            toolProvider: "none",
            supportsThinking: true,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 128000,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: true,
        },
    },
    {
        id: "nousresearch/hermes-3-llama-3.1-405b:free",
        name: "Hermes 3",
        provider: "openrouter",
        providerLabel: "OpenRouter",
        providerIcon: "OpenRouter",
        description: "Chat + Creative Writing",
        icon: "NousResearch",
        isFree: true,
        capabilities: {
            supportsTools: false,
            toolProvider: "none",
            supportsThinking: true,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 131072,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: false,
        },
    },
    {
        id: "minimax-m2:free",
        name: "MiniMax M2",
        provider: "routeway",
        providerLabel: "Routeway",
        providerIcon: "Routeway",
        description: "Fast + Free",
        icon: "Minimax",
        isFree: true,
        capabilities: {
            supportsTools: false,
            toolProvider: "none",
            supportsThinking: false,
            hasNativeReasoning: false,
            supportsImages: false,
            supportsDocuments: true,
            maxContextLength: 196608,
            supportsToolsWithThinking: false,
            supportsAttachmentsWithTools: false,
        },
    },
];

/**
 * Get model by ID
 */
export function getModelById(modelId: string): AIModel | undefined {
    return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

/**
 * Get model capabilities by ID
 */
export function getModelCapabilities(
    modelId: string
): ModelCapabilities | undefined {
    return getModelById(modelId)?.capabilities;
}

/**
 * Check if a model supports a specific feature
 */
export function modelSupports(
    modelId: string,
    feature: keyof ModelCapabilities
): boolean {
    const capabilities = getModelCapabilities(modelId);
    if (!capabilities) return false;
    return !!capabilities[feature];
}

/**
 * Check if current settings are valid for the model
 * Returns an object with validation results and suggested fixes
 */
export interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    disabledFeatures: {
        tools?: boolean;
        thinking?: boolean;
        images?: boolean;
    };
}

export function validateModelSettings(
    modelId: string,
    settings: {
        webSearchEnabled: boolean;
        reasoningEnabled: boolean;
        hasImageAttachments: boolean;
        hasDocumentAttachments: boolean;
    }
): ValidationResult {
    const capabilities = getModelCapabilities(modelId);
    const model = getModelById(modelId);

    if (!capabilities || !model) {
        return {
            isValid: false,
            warnings: ["Unknown model"],
            disabledFeatures: {},
        };
    }

    const warnings: string[] = [];
    const disabledFeatures: ValidationResult["disabledFeatures"] = {};

    // Check tools support
    if (settings.webSearchEnabled && !capabilities.supportsTools) {
        warnings.push(`${model.name} doesn't support web search`);
        disabledFeatures.tools = true;
    }

    // Check thinking support
    if (settings.reasoningEnabled && !capabilities.supportsThinking) {
        warnings.push(`${model.name} doesn't support thinking mode`);
        disabledFeatures.thinking = true;
    }

    // Check tools + thinking combination
    if (
        settings.webSearchEnabled &&
        settings.reasoningEnabled &&
        !capabilities.supportsToolsWithThinking
    ) {
        warnings.push(
            `${model.name} can't use tools and thinking together. Thinking will be disabled.`
        );
        disabledFeatures.thinking = true;
    }

    // Check image support
    if (settings.hasImageAttachments && !capabilities.supportsImages) {
        warnings.push(`${model.name} can't process images`);
        disabledFeatures.images = true;
    }

    // Check attachments + tools combination
    if (
        (settings.hasImageAttachments || settings.hasDocumentAttachments) &&
        settings.webSearchEnabled &&
        !capabilities.supportsAttachmentsWithTools
    ) {
        warnings.push(`${model.name} can't use attachments with web search`);
        disabledFeatures.tools = true;
    }

    return {
        isValid: warnings.length === 0,
        warnings,
        disabledFeatures,
    };
}

/**
 * Get effective settings based on model capabilities
 * Automatically adjusts settings to what the model supports
 */
export function getEffectiveSettings(
    modelId: string,
    settings: {
        webSearchEnabled: boolean;
        reasoningEnabled: boolean;
        hasImageAttachments: boolean;
        hasDocumentAttachments: boolean;
    }
): {
    webSearchEnabled: boolean;
    reasoningEnabled: boolean;
    canProcessImages: boolean;
    canProcessDocuments: boolean;
} {
    const capabilities = getModelCapabilities(modelId);

    if (!capabilities) {
        return {
            webSearchEnabled: false,
            reasoningEnabled: false,
            canProcessImages: false,
            canProcessDocuments: false,
        };
    }

    // For built-in tool providers (like Groq Compound), tools are ALWAYS enabled
    // The globe toggle only controls Exa-based search for other models
    let effectiveWebSearch: boolean;
    if (capabilities.toolProvider === "built-in") {
        // Built-in tools are always on - they're part of the model
        effectiveWebSearch = true;
    } else {
        // For Exa-based models, respect the user's toggle
        effectiveWebSearch =
            settings.webSearchEnabled && capabilities.supportsTools;
    }

    let effectiveReasoning =
        settings.reasoningEnabled && capabilities.supportsThinking;

    // If both are enabled but model doesn't support combination, prioritize tools
    if (
        effectiveWebSearch &&
        effectiveReasoning &&
        !capabilities.supportsToolsWithThinking
    ) {
        effectiveReasoning = false;
    }

    // If attachments are present and model doesn't support attachments with tools
    // (Only applies to Exa-based models, built-in tools handle this differently)
    if (
        capabilities.toolProvider !== "built-in" &&
        (settings.hasImageAttachments || settings.hasDocumentAttachments) &&
        effectiveWebSearch &&
        !capabilities.supportsAttachmentsWithTools
    ) {
        effectiveWebSearch = false;
    }

    return {
        webSearchEnabled: effectiveWebSearch,
        reasoningEnabled: effectiveReasoning,
        canProcessImages:
            settings.hasImageAttachments && capabilities.supportsImages,
        canProcessDocuments:
            settings.hasDocumentAttachments && capabilities.supportsDocuments,
    };
}

/**
 * Check if model is a DeepSeek R1 variant (has native reasoning)
 */
export function isDeepSeekR1(modelId: string): boolean {
    return (
        modelId.toLowerCase().includes("deepseek-r1") ||
        modelId.toLowerCase().includes("deepseek/r1")
    );
}

/**
 * Check if model uses tag-based thinking (<thinking> tags)
 */
export function usesTagBasedThinking(modelId: string): boolean {
    const capabilities = getModelCapabilities(modelId);
    return (
        capabilities?.supportsThinking === true &&
        capabilities?.hasNativeReasoning === false
    );
}

/**
 * Check if model has built-in tools (like Groq Compound)
 * These models always have tools enabled and don't need the globe toggle
 */
export function hasBuiltInTools(modelId: string): boolean {
    const capabilities = getModelCapabilities(modelId);
    return capabilities?.toolProvider === "built-in";
}
