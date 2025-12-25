/**
 * Speech-to-Text Service using Groq Whisper API
 * Converts audio to text using whisper-large-v3-turbo model
 * API Docs: https://console.groq.com/docs/speech-to-text
 */

const GROQ_API_KEYS = [
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
].filter(Boolean) as string[];

const GROQ_STT_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

let currentKeyIndex = 0;

function getNextApiKey(): string {
    if (GROQ_API_KEYS.length === 0) {
        throw new Error('No Groq API keys configured');
    }
    const key = GROQ_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    return key;
}

export interface TranscriptionResult {
    text: string;
    duration?: number;
    language?: string;
}

export interface TranscriptionOptions {
    language?: string; // ISO-639-1 format (e.g., 'en', 'es', 'fr')
    prompt?: string; // Guide model's style or spelling (max 224 tokens)
    temperature?: number; // 0-1, default 0
}

/**
 * Transcribe audio file to text using Groq Whisper
 * @param audioBlob - Audio blob (wav, mp3, webm, etc.)
 * @param options - Optional transcription settings
 * @returns Transcription result with text
 */
export async function transcribeAudio(
    audioBlob: Blob,
    options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
    const formData = new FormData();

    // Determine file extension from blob type
    const mimeType = audioBlob.type || 'audio/webm';
    const extension = mimeType.includes('wav') ? 'wav'
        : mimeType.includes('mp3') ? 'mp3'
            : mimeType.includes('mp4') ? 'mp4'
                : mimeType.includes('ogg') ? 'ogg'
                    : 'webm';

    // Create file with proper name
    const audioFile = new File([audioBlob], `recording.${extension}`, { type: mimeType });

    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json');

    if (options.language) {
        formData.append('language', options.language);
    }
    if (options.prompt) {
        formData.append('prompt', options.prompt);
    }
    if (options.temperature !== undefined) {
        formData.append('temperature', options.temperature.toString());
    }

    const maxRetries = Math.max(GROQ_API_KEYS.length, 1);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(GROQ_STT_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getNextApiKey()}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();

                // Rate limited - try next key
                if (response.status === 429) {
                    console.log(`[STT] Rate limited on attempt ${attempt + 1}/${maxRetries}`);
                    lastError = new Error(`Rate limited: ${errorText}`);
                    continue;
                }

                throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            return {
                text: data.text?.trim() || '',
                duration: data.duration,
                language: data.language,
            };
        } catch (error) {
            lastError = error as Error;
            console.error(`[STT] Error on attempt ${attempt + 1}:`, error);

            // Only retry on rate limit errors
            if (!String(error).includes('429')) {
                throw error;
            }
        }
    }

    throw lastError || new Error('Transcription failed after all retries');
}
