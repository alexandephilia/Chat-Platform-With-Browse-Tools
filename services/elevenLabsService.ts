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
    withTimestamps?: boolean;  // Get word-level timestamps for text highlighting
}

/**
 * Word timing information from ElevenLabs API
 */
export interface WordTiming {
    word: string;
    start: number;  // Start time in seconds
    end: number;    // End time in seconds
}

/**
 * TTS result with timestamps for karaoke-style highlighting
 */
export interface TTSWithTimestamps {
    audioBlob: Blob;
    wordTimings: WordTiming[];
    processedText: string;  // The text that was actually sent to TTS (after markdown stripping)
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
let currentHighlightCallback: ((wordIndex: number) => void) | null = null;
let highlightIntervalId: number | null = null;

// Audio context for mobile - needed to unlock audio on iOS
let audioContext: AudioContext | null = null;

/**
 * Initialize and unlock audio context for mobile
 * MUST be called directly from user gesture (click/touch handler)
 * Returns the audio context if successful
 */
export async function initAudioForMobile(): Promise<AudioContext | null> {
    try {
        // Create AudioContext if needed (for unlocking on iOS)
        if (!audioContext) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContext = new AudioContextClass();
            }
        }

        // Resume audio context if suspended (required for iOS)
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Create and play a silent buffer to fully unlock audio
        if (audioContext) {
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        }

        return audioContext;
    } catch (error) {
        console.warn('[Audio] Failed to init audio context:', error);
        return null;
    }
}

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
/**
 * Strip markdown formatting and citations from text for cleaner TTS
 */
function stripMarkdown(text: string, keepAudioTags: boolean = false): string {
    let cleaned = text
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
        .replace(/_([^_]+)_/g, '$1');

    // Handle audio tags (e.g., [laughs], [whispers])
    // If we're keeping tags, we temporarily protect them
    if (keepAudioTags) {
        // Replace known emotional tags with placeholders to avoid being caught by citation stripper
        // These are the tags documented by ElevenLabs V3:
        // Voice-related: laughs, whispers, sighs, exhales, sarcastic, curious, excited, crying, snorts, mischievously
        // Sound effects: gunshot, applause, clapping, explosion, swallows, gulps
        // Special: sings, woo
        const tags = [
            // Voice-related (documented)
            'laughs', 'laughs harder', 'starts laughing', 'wheezing',
            'whispers', 'sighs', 'exhales',
            'sarcastic', 'curious', 'excited', 'crying', 'snorts', 'mischievously',
            // Sound effects (documented)
            'gunshot', 'applause', 'clapping', 'explosion', 'swallows', 'gulps',
            // Special (documented)
            'sings', 'woo',
            // Additional common ones that may work
            'gasps', 'giggles', 'groaning', 'shouts'
        ];
        const tagRegex = new RegExp(`\\[(${tags.join('|')})\\]`, 'gi');
        cleaned = cleaned.replace(tagRegex, '@@AUDIO_TAG_$1@@');
    }

    cleaned = cleaned
        // Remove specific citation patterns commonly added by search models
        // 1. Remove bracketed numbers: [1], [1, 2], [1-3]
        .replace(/\s*\[\d+(?:[\s,-]+\d+)*\]/g, '')
        // 2. Remove parenthetical sources: (source 1), (Source: NASA)
        .replace(/\s*\((?:source|Source):?\s*[^)]+\)/g, '')
        // 3. Remove citations following periods: ". [Source Title](url)" -> "."
        // This targets the specific format enforced in prompts.ts
        .replace(/\.\s*\[[^\]]+\]\(https?:\/\/[^\)]+\)/g, '.')

        // Remove remaining images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        // Remove remaining links but keep the descriptive text if it's NOT a citation
        // If the link text is purely numeric or just "Source", we remove it
        .replace(/\[([^\]]+)\]\([^)]+\)/g, (_, linkText) => {
            const isCitationText = /^(?:\d+|Source\s*\d*|Citation\s*\d*)$/i.test(linkText.trim());
            return isCitationText ? '' : linkText;
        })

        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '');

    // Restore audio tags or remove them if they weren't protected
    if (keepAudioTags) {
        cleaned = cleaned.replace(/@@AUDIO_TAG_(\w+)@@/g, '[$1]');
    } else {
        // Strip any remaining bracketed words that might be emotional tags
        cleaned = cleaned.replace(/\s*\[[a-zA-Z]+\]/g, '');
    }

    return cleaned
        // Clean up punctuation (remove redundant periods if we stripped too much)
        .replace(/\.{2,}/g, '.')
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Add natural pauses for ElevenLabs V3 using ellipses and punctuation
 * 
 * V3 does NOT support SSML <break> tags. Instead, use:
 * - Ellipses (…) for pauses and dramatic weight
 * - Standard punctuation for natural rhythm
 * - Line breaks for longer pauses
 * 
 * @see https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#prompting-eleven-v3-alpha
 */
function addNaturalPauses(text: string): string {
    let result = text
        // Add pause after transitional phrases
        .replace(/\. (But|However|Nevertheless|Meanwhile|Anyway|Still|Yet|So|Then|Now|Actually|Basically|Essentially|Importantly|Interestingly)/g, '. … $1')
        // Add pause after question marks when continuing (rhetorical/dramatic questions)
        .replace(/\? (And|But|So|Well|Because)/g, '? … $1')
        // Add emphasis pause before important words
        .replace(/(most importantly|the key (is|point)|here's the thing|the truth is|in fact|to be honest|frankly)/gi, '… $1')
        // Add pause after lists intro
        .replace(/(:)\s*(First|1\.|Here)/gi, '$1 … $2')
        // Add pause for dramatic reveals
        .replace(/(turns out|it appears|surprisingly|unexpectedly|remarkably)/gi, '… $1')
        // Add hesitation-style pause for thinking phrases
        .replace(/(I think|I believe|In my opinion|From my perspective)/gi, '$1 …')
        // Clean up any double ellipses that may have been created
        .replace(/…\s*…/g, '…')
        // Ensure ellipses are the proper character (not three dots)
        .replace(/\.\.\.(?!\.)/g, '…')
        // Add pause between major sections (double newlines)
        .replace(/\n\n/g, '\n… \n');
    
    return result;
}

/**
 * Add emphasis through capitalization for key words
 * V3 responds to CAPITALIZATION for emphasis
 * 
 * @see https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#punctuation
 */
function addEmphasisCapitalization(text: string): string {
    // List of emphasis words that should be capitalized for vocal emphasis
    const emphasisPatterns = [
        // Superlatives and intensifiers
        { pattern: /\b(very|really|extremely|incredibly|absolutely|completely|totally)\b/gi, replacement: (m: string) => m.toUpperCase() },
        // Important/key words when preceded by qualifiers
        { pattern: /\b(most important|key point|crucial|critical|essential|vital)\b/gi, replacement: (m: string) => m.toUpperCase() },
        // Strong negatives
        { pattern: /\b(never|always|must|cannot|won't|definitely|certainly)\b/gi, replacement: (m: string) => m.toUpperCase() },
        // Action words
        { pattern: /\b(now|today|immediately|right now)\b/gi, replacement: (m: string) => m.toUpperCase() },
    ];
    
    let result = text;
    let emphasisCount = 0;
    const maxEmphasis = 4; // Don't over-emphasize
    
    for (const { pattern, replacement } of emphasisPatterns) {
        if (emphasisCount >= maxEmphasis) break;
        result = result.replace(pattern, (match) => {
            if (emphasisCount >= maxEmphasis) return match;
            emphasisCount++;
            return replacement(match);
        });
    }
    
    return result;
}

/**
 * Add expressive audio tags for ElevenLabs V3 model
 *
 * V3 supports tags like [laughs], [whispers], [sarcastic], [curious], [excited], etc.
 * These tags control vocal delivery and emotional expression.
 * Also supports compound tags like [frustrated sigh], [happy gasp], etc.
 *
 * Per ElevenLabs docs: "The voice you choose and its training samples will affect tag effectiveness"
 * Tags work best when matched to the voice's character and training data.
 *
 * @see https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices#audio-tags
 */
function addExpressionTags(text: string): string {
    // Split into sentences for analysis
    const sentences = text.split(/(?<=[.!?])\s+/);
    let tagCount = 0;
    const maxTags = 8; // Increased limit for more natural expression

    const result = sentences.map(sentence => {
        const lowerSentence = sentence.toLowerCase();

        // Skip very short sentences or if we've added enough tags
        if (sentence.length < 15 || tagCount >= maxTags) return sentence;

        // Detect questions - add curious tone (documented tag)
        if (sentence.trim().endsWith('?')) {
            if (lowerSentence.includes('how') || lowerSentence.includes('why') ||
                lowerSentence.includes('what') || lowerSentence.includes('could') ||
                lowerSentence.includes('would') || lowerSentence.includes('is it')) {
                tagCount++;
                return `[curious] ${sentence}`;
            }
        }

        // Detect excitement - exclamation marks with positive words (documented tag)
        if (sentence.includes('!')) {
            if (lowerSentence.includes('great') || lowerSentence.includes('amazing') ||
                lowerSentence.includes('awesome') || lowerSentence.includes('fantastic') ||
                lowerSentence.includes('wonderful') || lowerSentence.includes('excellent') ||
                lowerSentence.includes('love') || lowerSentence.includes('perfect') ||
                lowerSentence.includes('incredible') || lowerSentence.includes('brilliant')) {
                tagCount++;
                return `[excited] ${sentence}`;
            }
        }

        // Detect humor/amusement - use laughs tag (documented tag)
        if (lowerSentence.includes('haha') || lowerSentence.includes('funny') ||
            lowerSentence.includes('hilarious') || lowerSentence.includes('joke') ||
            lowerSentence.includes('lol') || lowerSentence.includes('lmao') ||
            lowerSentence.includes('amusing')) {
            tagCount++;
            return `[laughs] ${sentence}`;
        }

        // Detect sarcasm (documented tag)
        if (lowerSentence.includes('obviously') || lowerSentence.includes('of course') ||
            lowerSentence.includes('sure thing') || lowerSentence.includes('yeah right') ||
            lowerSentence.includes('no kidding') || lowerSentence.includes('wow, really')) {
            tagCount++;
            return `[sarcastic] ${sentence}`;
        }

        // Detect sadness/empathy - use sighs (documented tag)
        if (lowerSentence.includes('sorry to hear') || lowerSentence.includes('unfortunately') ||
            lowerSentence.includes('sadly') || lowerSentence.includes('i understand') ||
            lowerSentence.includes('that\'s tough') || lowerSentence.includes('my condolences')) {
            tagCount++;
            return `[sighs] ${sentence}`;
        }
        
        // Detect frustration - compound tag (works with many voices)
        if (lowerSentence.includes('frustrat') || lowerSentence.includes('annoying') ||
            lowerSentence.includes('ugh') || lowerSentence.includes('argh') ||
            lowerSentence.includes('come on') || lowerSentence.includes('seriously?')) {
            tagCount++;
            return `[exhales] ${sentence}`;
        }

        // Detect whisper-worthy content (documented tag)
        if (lowerSentence.includes('secret') || lowerSentence.includes('between us') ||
            lowerSentence.includes('quietly') || lowerSentence.includes('confidential') ||
            lowerSentence.includes('don\'t tell') || lowerSentence.includes('private')) {
            tagCount++;
            return `[whispers] ${sentence}`;
        }

        // Detect mischief (documented tag)
        if (lowerSentence.includes('trick') || lowerSentence.includes('sneaky') ||
            lowerSentence.includes('clever') || lowerSentence.includes('hack') ||
            lowerSentence.includes('cheat') || lowerSentence.includes('shortcut')) {
            tagCount++;
            return `[mischievously] ${sentence}`;
        }
        
        // Detect surprise/realization (use gasps - common working tag)
        if (lowerSentence.includes('oh!') || lowerSentence.includes('wow') ||
            lowerSentence.includes('wait,') || lowerSentence.includes('holy') ||
            lowerSentence.includes('oh my') || lowerSentence.includes('no way')) {
            tagCount++;
            return `[gasps] ${sentence}`;
        }

        return sentence;
    }).join(' ');

    // Debug: Log what we're sending to the API
    if (tagCount > 0) {
        console.log('[V3 Expression] Added', tagCount, 'audio tags to text');
        console.log('[V3 Expression] Sample:', result.substring(0, 200) + '...');
    }

    return result;
}

/**
 * Full V3 text processing pipeline
 * Applies pauses, emphasis, and expression tags for natural-sounding speech
 */
function processTextForV3(text: string): string {
    let processed = text;
    
    // Step 1: Add natural pauses via ellipses
    processed = addNaturalPauses(processed);
    
    // Step 2: Add emphasis via capitalization (limited to avoid shouting)
    processed = addEmphasisCapitalization(processed);
    
    // Step 3: Add expression tags
    processed = addExpressionTags(processed);
    
    console.log('[V3 Pipeline] Full processed text sample:', processed.substring(0, 400));
    
    return processed;
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
        // V3 uses lower stability for more expression ("Creative" mode)
        // Per docs: "For maximum expressiveness with audio tags, use Creative or Natural settings"
        stability: customStability,
        similarityBoost = 0.75,
        style = 0,
        useSpeakerBoost = true,
    } = options;

    // Get voice ID and model ID from keys
    const voices = modelKey === 'zeta-v2' ? ELEVENLABS_VOICES_V2 : ELEVENLABS_VOICES_V1;
    const voiceId = voices[voiceKey].id;
    const modelId = TTS_MODELS[modelKey].id;

    // Clean text for TTS
    const isV3 = modelId === 'eleven_v3';

    // For V3, use lower stability (0.3 = Creative mode) for more expressive output
    // For V2, use default 0.5 (Natural mode)
    const stability = customStability ?? (isV3 ? 0.3 : 0.5);

    // For V3, apply full processing pipeline (pauses, emphasis, expression tags)
    let processedText = stripMarkdown(text, isV3);
    if (isV3) {
        processedText = processTextForV3(processedText);
        console.log('[TTS V3] Using stability:', stability, '(Creative mode for expression)');
    }

    if (!processedText) {
        throw new Error('No speakable text content');
    }

    // ElevenLabs has a 5000 character limit per request
    const truncatedText = processedText.length > 5000
        ? processedText.slice(0, 4997) + '...'
        : processedText;

    // Build voice settings - V3 does NOT support speaker boost
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
 * Convert text to speech with word-level timestamps for karaoke-style highlighting
 * @param text - Text to convert (markdown will be stripped)
 * @param options - TTS options
 * @returns Audio blob with word timings
 */
export async function textToSpeechWithTimestamps(
    text: string,
    options: TTSOptions = {}
): Promise<TTSWithTimestamps> {
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

    // Clean text for TTS - DON'T add expression tags for timestamps version
    // as they would mess up the text alignment
    const isV3 = modelId === 'eleven_v3';
    const processedText = stripMarkdown(text, false); // Don't keep audio tags for highlighting

    if (!processedText) {
        throw new Error('No speakable text content');
    }

    // ElevenLabs has a 5000 character limit per request
    const truncatedText = processedText.length > 5000
        ? processedText.slice(0, 4997) + '...'
        : processedText;

    // Build voice settings
    const voiceSettings: Record<string, number | boolean> = {
        stability,
        similarity_boost: similarityBoost,
        style,
    };

    if (!isV3) {
        voiceSettings.use_speaker_boost = useSpeakerBoost;
    }

    // Call server-side proxy with timestamps flag
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
            withTimestamps: true,
        }),
    });

    if (!response.ok) {
        let errorMessage = `TTS failed: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            // Response wasn't JSON
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log('[TTS Timestamps] Response keys:', Object.keys(data));
    console.log('[TTS Timestamps] Alignment:', data.alignment ? 'present' : 'missing');
    if (data.alignment) {
        console.log('[TTS Timestamps] Characters count:', data.alignment.characters?.length || 0);
    }

    // Convert base64 audio to blob
    const audioBytes = atob(data.audio_base64);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
    }
    const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });

    // Parse character timings into word timings
    const wordTimings = parseCharacterTimingsToWords(
        data.alignment?.characters || [],
        data.alignment?.character_start_times_seconds || [],
        data.alignment?.character_end_times_seconds || []
    );

    console.log('[TTS Timestamps] Parsed word timings:', wordTimings.length);
    if (wordTimings.length > 0) {
        console.log('[TTS Timestamps] First 3 words:', wordTimings.slice(0, 3));
    }

    return {
        audioBlob,
        wordTimings,
        processedText: truncatedText,
    };
}

/**
 * Convert character-level timings to word-level timings
 */
function parseCharacterTimingsToWords(
    characters: string[],
    startTimes: number[],
    endTimes: number[]
): WordTiming[] {
    const words: WordTiming[] = [];
    let currentWord = '';
    let wordStart = 0;
    let wordEnd = 0;

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const start = startTimes[i];
        const end = endTimes[i];

        // Check if this is a word boundary (space or punctuation)
        if (char === ' ' || char === '\n' || char === '\t') {
            if (currentWord.trim()) {
                words.push({
                    word: currentWord.trim(),
                    start: wordStart,
                    end: wordEnd,
                });
            }
            currentWord = '';
            wordStart = end; // Next word starts after the space
        } else {
            if (currentWord === '') {
                wordStart = start;
            }
            currentWord += char;
            wordEnd = end;
        }
    }

    // Don't forget the last word
    if (currentWord.trim()) {
        words.push({
            word: currentWord.trim(),
            start: wordStart,
            end: wordEnd,
        });
    }

    return words;
}

/**
 * Play audio with synchronized text highlighting
 * @param audioBlob - The audio blob to play
 * @param wordTimings - Word timing information
 * @param onHighlight - Callback called with current word index during playback
 */
export async function playAudioWithHighlighting(
    audioBlob: Blob,
    wordTimings: WordTiming[],
    onHighlight: (wordIndex: number) => void
): Promise<HTMLAudioElement> {
    // Stop any currently playing audio
    stopAudio();

    const typedBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(typedBlob);
    currentAudioUrl = url;

    const audio = new Audio();
    currentAudio = audio;
    currentHighlightCallback = onHighlight;

    // Set up event handlers
    audio.onended = () => {
        stopHighlighting();
        cleanup();
    };

    audio.onerror = (e) => {
        console.error('[Audio] Playback error:', e);
        stopHighlighting();
        cleanup();
    };

    // Mobile-specific attributes
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.crossOrigin = 'anonymous';

    audio.src = url;
    audio.load();

    // Start highlighting loop
    let lastWordIndex = -1;
    highlightIntervalId = window.setInterval(() => {
        if (!audio || audio.paused) return;

        const currentTime = audio.currentTime;

        // Find the current word based on time
        for (let i = 0; i < wordTimings.length; i++) {
            const timing = wordTimings[i];
            if (currentTime >= timing.start && currentTime < timing.end) {
                if (i !== lastWordIndex) {
                    lastWordIndex = i;
                    onHighlight(i);
                }
                break;
            }
            // Handle gap between words - highlight next word slightly early
            if (i < wordTimings.length - 1) {
                const nextTiming = wordTimings[i + 1];
                if (currentTime >= timing.end && currentTime < nextTiming.start) {
                    // In the gap, keep current word highlighted
                    break;
                }
            }
        }
    }, 50); // Check every 50ms for smooth highlighting

    try {
        await audio.play();
    } catch (error) {
        console.error('[Audio] Play failed:', error);
        stopHighlighting();
        cleanup();
        throw error;
    }

    return audio;
}

/**
 * Stop the highlighting interval
 */
function stopHighlighting(): void {
    if (highlightIntervalId !== null) {
        clearInterval(highlightIntervalId);
        highlightIntervalId = null;
    }
    currentHighlightCallback = null;
}

/**
 * Play audio blob and return the audio element for control
 * Note: On mobile, call initAudioForMobile() first from the user gesture
 * @param audioBlob - The audio blob to play
 * @param existingAudio - Optional existing audio element to reuse (helps keep user gesture)
 */
export async function playAudio(audioBlob: Blob, existingAudio?: HTMLAudioElement): Promise<HTMLAudioElement> {
    // Creating URL first to ensure it's ready
    const typedBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(typedBlob);

    const audio = existingAudio || new Audio();

    // Stop any currently playing audio if we're creating a new one
    if (!existingAudio) {
        stopAudio();
    } else {
        // If reusing, stop previous playback
        audio.pause();
    }

    currentAudio = audio;
    currentAudioUrl = url;

    // Set up event handlers
    audio.onended = () => {
        cleanup();
    };

    audio.onerror = (e) => {
        console.error('[Audio] Playback error:', e);
        cleanup();
    };

    // Mobile-specific attributes - set BEFORE src
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.crossOrigin = 'anonymous';

    // Set source and load
    audio.src = url;
    audio.load();

    // Play with proper error handling
    try {
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
    stopHighlighting();
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
