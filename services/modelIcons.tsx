/**
 * Model Icons using @lobehub/icons
 * React components for AI model and provider icons
 *
 * Reference: https://lobehub.com/icons
 * - Use .Color for colored icons (when available)
 * - Use .Avatar for avatar-style icons
 * - Use base component for mono icons
 */

import {
    DeepSeek,
    Gemini,
    Google,
    Groq,
    Kimi,
    Minimax,
    Moonshot,
    NousResearch,
    OpenRouter,
    ZAI,
} from '@lobehub/icons';
import React from 'react';

// Default icon size - increased for better visibility
const DEFAULT_SIZE = 32;

// Model Icons as React components
// Using .Color where available, .Avatar for avatar style, base for mono
export const ModelIconComponents = {
    // Gemini - using .Avatar variant
    Gemini: (size: number) => <Gemini.Avatar size={size} />,
    // Kimi - has .Color variant (dedicated Kimi icon)
    Kimi: (size: number) => <Kimi.Color size={size} />,
    // Groq - has .Avatar variant
    Groq: (size: number) => <Groq.Avatar size={size} />,
    // DeepSeek - has .Color variant
    DeepSeek: (size: number) => <DeepSeek.Color size={size} />,
    // Z.AI/GLM - has .Avatar variant
    GLM: (size: number) => <ZAI.Avatar size={size} />,
    // NousResearch - has .Avatar variant
    NousResearch: (size: number) => <NousResearch.Avatar size={size} />,
    // Minimax - has .Avatar variant
    Minimax: (size: number) => <Minimax.Avatar size={size} />,
} as const;

// Provider Icons as React components
export const ProviderIconComponents = {
    // Google - has .Color variant
    Google: (size: number) => <Google.Color size={size} />,
    // Groq - has .Avatar variant
    Groq: (size: number) => <Groq.Avatar size={size} />,
    // OpenRouter - has .Avatar variant (no .Color)
    OpenRouter: (size: number) => <OpenRouter.Avatar size={size} />,
    // Routeway - using Moonshot as the icon
    Routeway: (size: number) => <Moonshot.Avatar size={size} />,
} as const;

// Export icon types
export type ModelIconKey = keyof typeof ModelIconComponents;
export type ProviderIconKey = keyof typeof ProviderIconComponents;

// Model Icon Component
interface ModelIconProps {
    iconKey: ModelIconKey;
    size?: number;
    className?: string;
}

export const ModelIcon: React.FC<ModelIconProps> = ({ iconKey, size = DEFAULT_SIZE, className }) => {
    const IconRenderer = ModelIconComponents[iconKey];
    if (!IconRenderer) return null;
    return <span className={className}>{IconRenderer(size)}</span>;
};

// Provider Icon Component
interface ProviderIconProps {
    iconKey: ProviderIconKey;
    size?: number;
    className?: string;
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({ iconKey, size = DEFAULT_SIZE, className }) => {
    const IconRenderer = ProviderIconComponents[iconKey];
    if (!IconRenderer) return null;
    return <span className={className}>{IconRenderer(size)}</span>;
};

// Helper to get model icon component (for backward compatibility)
export function getModelIcon(key: ModelIconKey) {
    return ModelIconComponents[key];
}

// Helper to get provider icon component (for backward compatibility)
export function getProviderIcon(key: ProviderIconKey) {
    return ProviderIconComponents[key];
}
