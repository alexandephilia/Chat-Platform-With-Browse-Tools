import type { VercelRequest, VercelResponse } from '@vercel/node';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!ELEVENLABS_API_KEY) {
        console.error('[ElevenLabs Proxy] ELEVENLABS_API_KEY not configured');
        return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    try {
        const { voiceId, text, modelId, voiceSettings, withTimestamps } = req.body;

        if (!voiceId || !text) {
            return res.status(400).json({ error: 'Missing required fields: voiceId, text' });
        }

        // Use mp3_44100_128 for best mobile compatibility
        const outputFormat = 'mp3_44100_128';

        // Use timestamps endpoint if requested
        const endpoint = withTimestamps
            ? `${ELEVENLABS_TTS_URL}/${voiceId}/with-timestamps?output_format=${outputFormat}`
            : `${ELEVENLABS_TTS_URL}/${voiceId}?output_format=${outputFormat}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Accept': withTimestamps ? 'application/json' : 'audio/mpeg',
            },
            body: JSON.stringify({
                text,
                model_id: modelId || 'eleven_multilingual_v2',
                voice_settings: voiceSettings || {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ElevenLabs Proxy] API error:', response.status, errorText);

            if (response.status === 401) {
                return res.status(401).json({ error: 'Invalid ElevenLabs API key' });
            }
            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
            }

            return res.status(response.status).json({ error: errorText });
        }

        // Handle timestamps response (JSON with base64 audio)
        if (withTimestamps) {
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(data);
        }

        // Regular audio response
        const audioBuffer = await response.arrayBuffer();

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.byteLength);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(200).send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('[ElevenLabs Proxy] Error:', error);
        return res.status(500).json({ error: 'Failed to generate speech' });
    }
}
