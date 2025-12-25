/**
 * ElevenLabs Text-to-Speech Service
 * Converts AI responses to natural speech using ElevenLabs API
 * Free tier: ~10k credits/month (~20 minutes of audio)
 * API Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */

// API key is now server-side only (in Vercel env vars)
const TTS_PROXY_URL = '/api/elevenlabs-tts';

// Pre-made voices available on free tier (no cloning needed)
// Zeta V1 uses original human names, Zeta V2 uses sci-fi themed names
export const ELEVENLABS_VOICES_V1 = {
    // Female voices
    alice: { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'female', accent: 'British', style: 'confident, news' },
    aria: { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', accent: 'American', style: 'expressive, social media' },
    charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', accent: 'Swedish', style: 'seductive' },
    jessica: { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'female', accent: 'American', style: 'expressive, conversational' },
    laura: { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female', accent: 'American', style: 'upbeat, social media' },
    lily: { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', accent: 'British', style: 'warm, narration' },
    matilda: { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', accent: 'American', style: 'friendly, narration' },
    sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', accent: 'American', style: 'soft, news' },

    // Male voices
    bill: { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male', accent: 'American', style: 'trustworthy, narration' },
    brian: { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', accent: 'American', style: 'deep, narration' },
    callum: { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', accent: 'Transatlantic', style: 'intense' },
    charlie: { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', accent: 'Australian', style: 'natural, conversational' },
    chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'male', accent: 'American', style: 'casual, conversational' },
    daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', accent: 'British', style: 'authoritative, news' },
    eric: { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', gender: 'male', accent: 'American', style: 'friendly, conversational' },
    george: { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', accent: 'British', style: 'warm, narration' },
    liam: { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', accent: 'American', style: 'articulate, narration' },
    roger: { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male', accent: 'American', style: 'confident, social media' },
    will: { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', gender: 'male', accent: 'American', style: 'friendly, social media' },

    // Non-binary
    river: { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', gender: 'non-binary', accent: 'American', style: 'confident, social media' },
} as const;

export const ELEVENLABS_VOICES_V2 = {
    // Female voices - Sci-fi themed names
    alice: { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Zara-7', gender: 'female', accent: 'British', style: 'confident, news' },
    aria: { id: '9BWtsMINqrJLrRacOk9x', name: 'Nova', gender: 'female', accent: 'American', style: 'expressive, social media' },
    charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Lyra', gender: 'female', accent: 'Swedish', style: 'seductive' },
    jessica: { id: 'cgSgspJ2msm6clMCkdW9', name: 'Vega', gender: 'female', accent: 'American', style: 'expressive, conversational' },
    laura: { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Astra', gender: 'female', accent: 'American', style: 'upbeat, social media' },
    lily: { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Celeste', gender: 'female', accent: 'British', style: 'warm, narration' },
    matilda: { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Nebula', gender: 'female', accent: 'American', style: 'friendly, narration' },
    sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Seraph', gender: 'female', accent: 'American', style: 'soft, news' },

    // Male voices - Sci-fi themed names
    bill: { id: 'pqHfZKP75CvOlQylNhV4', name: 'Kron', gender: 'male', accent: 'American', style: 'trustworthy, narration' },
    brian: { id: 'nPczCjzI2devNBz1zQrb', name: 'Titan', gender: 'male', accent: 'American', style: 'deep, narration' },
    callum: { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Zephyr', gender: 'male', accent: 'Transatlantic', style: 'intense' },
    charlie: { id: 'IKne3meq5aSn9XLyUdCD', name: 'Orion', gender: 'male', accent: 'Australian', style: 'natural, conversational' },
    chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Axel', gender: 'male', accent: 'American', style: 'casual, conversational' },
    daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Vulcan', gender: 'male', accent: 'British', style: 'authoritative, news' },
    eric: { id: 'cjVigY5qzO86Huf0OWal', name: 'Cosmo', gender: 'male', accent: 'American', style: 'friendly, conversational' },
    george: { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'Atlas', gender: 'male', accent: 'British', style: 'warm, narration' },
    liam: { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Zenith', gender: 'male', accent: 'American', style: 'articulate, narration' },
    roger: { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Drax', gender: 'male', accent: 'American', style: 'confident, social media' },
    will: { id: 'bIHbv24MWmeRgasZH58o', name: 'Flux', gender: 'male', accent: 'American', style: 'friendly, social media' },

    // Non-binary - Sci-fi themed name
    river: { id: 'SAz9YHcvj6GT2YYXdXww', name: 'Quasar', gender: 'non-binary', accent: 'American', style: 'confident, social media' },
} as const;

// Legacy export for backward compatibility
export const ELEVENLABS_VOICES = ELEVENLABS_VOICES_V1;

export type VoiceKey = keyof typeof ELEVENLABS_VOICES_V1;
export type VoiceInfo = {
    id: string;
    name: string;
    gender: 'female' | 'male' | 'non-binary';
    accent: string;
    style: string;
};

// TTS Model configurations (branded as Zeta)
// Note: All default voices are compatible with both models
export const TTS_MODELS = {
    'zeta-v1': {
        id: 'eleven_multilingual_v2',
        name: 'Zeta V1',
        description: 'Stable, 29 languages',
        isDefault: true,
    },
    'zeta-v2': {
        id: 'eleven_v3',
        name: 'Zeta V2',
        description: 'Most expressive (Alpha)',
        isDefault: false,
    },
} as const;

export type TTSModelKey = keyof typeof TTS_MODELS;

// Default selections
const DEFAULT_VOICE: VoiceKey = 'aria';
const DEFAULT_MODEL: TTSModelKey = 'zeta-v1';

// Local storage keys
const VOICE_STORAGE_KEY = 'elevenlabs_voice';
const MODEL_STORAGE_KEY = 'elevenlabs_model';

/**
 * Get the currently selected voice
 */
export function getSelectedVoice(): VoiceKey {
    if (typeof localStorage === 'undefined') return DEFAULT_VOICE;
    const stored = localStorage.getItem(VOICE_STORAGE_KEY);
    if (stored && stored in ELEVENLABS_VOICES) {
        return stored as VoiceKey;
    }
    return DEFAULT_VOICE;
}

/**
 * Set the selected voice
 */
export function setSelectedVoice(voiceKey: VoiceKey): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VOICE_STORAGE_KEY, voiceKey);
    }
}

/**
 * Get the currently selected TTS model
 */
export function getSelectedTTSModel(): TTSModelKey {
    if (typeof localStorage === 'undefined') return DEFAULT_MODEL;
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && stored in TTS_MODELS) {
        return stored as TTSModelKey;
    }
    return DEFAULT_MODEL;
}

/**
 * Set the selected TTS model
 */
export function setSelectedTTSModel(modelKey: TTSModelKey): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(MODEL_STORAGE_KEY, modelKey);
    }
}

/**
 * Get voice info by key
 */
export function getVoiceInfo(voiceKey: VoiceKey, modelKey?: TTSModelKey): VoiceInfo {
    const model = modelKey || getSelectedTTSModel();
    const voices = model === 'zeta-v2' ? ELEVENLABS_VOICES_V2 : ELEVENLABS_VOICES_V1;
    return voices[voiceKey];
}

/**
 * Get all voices grouped by gender for a specific model
 */
export function getVoicesByGender(modelKey?: TTSModelKey): Record<string, { key: VoiceKey; info: VoiceInfo }[]> {
    const model = modelKey || getSelectedTTSModel();
    const voices = model === 'zeta-v2' ? ELEVENLABS_VOICES_V2 : ELEVENLABS_VOICES_V1;

    const grouped: Record<string, { key: VoiceKey; info: VoiceInfo }[]> = {
        female: [],
        male: [],
        'non-binary': [],
    };

    for (const [key, info] of Object.entries(voices)) {
        grouped[info.gender].push({ key: key as VoiceKey, info });
    }

    return grouped;
}

export interface TTSOptions {
    voiceKey?: VoiceKey;
    modelKey?: TTSModelKey;
    stability?: number;        // 0-1, lower = more expressive
    similarityBoost?: number;  // 0-1, higher = closer to original voice
    style?: number;            // 0-1, style exaggeration (v2 models only)
    useSpeakerBoost?: boolean; // Boost similarity to speaker (NOT available for V3)
}

/**
 * Note on V3 model compatibility:
 * - All default voices work with both eleven_multilingual_v2 and eleven_v3
 * - Default voices are fine-tuned for new models upon release
 * - V3 does NOT support Speaker Boost setting
 * - V3 supports audio tags like [whispers], [laughs], [sighs], etc.
 * - V3 is in alpha - best with default voices or Instant Voice Clones
 */

// Current audio instance for stop functionality
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

/**
 * Check if ElevenLabs API is configured
 * Note: This now always returns true since the key is server-side.
 * Actual availability is checked when making requests.
 */
export function isElevenLabsConfigured(): boolean {
    return true; // Key is server-side now
}

/**
 * Strip markdown formatting from text for cleaner TTS
 */
function stripMarkdown(text: string): string {
    return text
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]+`/g, '')
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove links, keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Convert text to speech using ElevenLabs API (via server proxy)
 * @param text - Text to convert (markdown will be stripped)
 * @param options - TTS options
 * @returns Audio blob
 */
export async function textToSpeech(
    text: string,
    options: TTSOptions = {}
): Promise<Blob> {
    const {
        voiceKey = getSelectedVoice(),
        modelKey = getSelectedTTSModel(),
        stability = 0.5,
        similarityBoost = 0.75,
        style = 0,
        useSpeakerBoost = true,
    } = options;

    // Get voice ID and model ID from keys
    const voices = modelKey === 'zeta-v2' ? ELEVENLABS_VOICES_V2 : ELEVENLABS_VOICES_V1;
    const voiceId = voices[voiceKey].id;
    const modelId = TTS_MODELS[modelKey].id;

    // Clean text for TTS
    const cleanText = stripMarkdown(text);

    if (!cleanText) {
        throw new Error('No speakable text content');
    }

    // ElevenLabs has a 5000 character limit per request
    const truncatedText = cleanText.length > 5000
        ? cleanText.slice(0, 4997) + '...'
        : cleanText;

    // Build voice settings - V3 does NOT support speaker boost
    const isV3 = modelId === 'eleven_v3';
    const voiceSettings: Record<string, number | boolean> = {
        stability,
        similarity_boost: similarityBoost,
        style,
    };

    // Only add speaker boost for non-V3 models
    if (!isV3) {
        voiceSettings.use_speaker_boost = useSpeakerBoost;
    }

    // Call server-side proxy instead of ElevenLabs directly
    const response = await fetch(TTS_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            voiceId,
            text: truncatedText,
            modelId,
            voiceSettings,
        }),
    });

    if (!response.ok) {
        let errorMessage = `TTS failed: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            // Response wasn't JSON, use status text
        }

        if (response.status === 401) {
            throw new Error('Invalid ElevenLabs API key');
        }
        if (response.status === 429) {
            throw new Error('ElevenLabs rate limit exceeded. Try again later or upgrade your plan.');
        }
        if (response.status === 500 && errorMessage.includes('not configured')) {
            throw new Error('ElevenLabs API key not configured on server.');
        }

        throw new Error(errorMessage);
    }

    return response.blob();
}

/**
 * Play audio blob and return the audio element for control
 * Note: On mobile, audio playback requires user interaction.
 * This function should be called directly from a click/touch handler.
 */
export async function playAudio(audioBlob: Blob): Promise<HTMLAudioElement> {
    // Stop any currently playing audio
    stopAudio();

    const url = URL.createObjectURL(audioBlob);
    currentAudioUrl = url;

    const audio = new Audio();
    currentAudio = audio;

    // Set up event handlers before loading
    audio.onended = () => {
        cleanup();
    };

    audio.onerror = (e) => {
        console.error('[Audio] Playback error:', e);
        cleanup();
    };

    // For mobile compatibility:
    // 1. Set attributes before setting src
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true'); // iOS Safari
    audio.setAttribute('webkit-playsinline', 'true'); // Older iOS

    // 2. Set source
    audio.src = url;

    // 3. Load and play with proper error handling
    try {
        // Load the audio first
        await audio.load();

        // Then play - this must be in the same call stack as user interaction
        await audio.play();
    } catch (error) {
        console.error('[Audio] Play failed:', error);
        cleanup();
        throw error;
    }

    return audio;
}

/**
 * Stop currently playing audio
 */
export function stopAudio(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        cleanup();
    }
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying(): boolean {
    return currentAudio !== null && !currentAudio.paused;
}

/**
 * Get current audio element (for external control)
 */
export function getCurrentAudio(): HTMLAudioElement | null {
    return currentAudio;
}

function cleanup(): void {
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }
    currentAudio = null;
}
