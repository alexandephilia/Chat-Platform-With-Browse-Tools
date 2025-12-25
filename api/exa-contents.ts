import type { VercelRequest, VercelResponse } from '@vercel/node';

const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_BASE_URL = 'https://api.exa.ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!EXA_API_KEY) {
        console.error('[Exa Proxy] EXA_API_KEY not configured');
        return res.status(500).json({ error: 'Exa API key not configured' });
    }

    try {
        const response = await fetch(`${EXA_BASE_URL}/contents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': EXA_API_KEY,
                'accept': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Exa Proxy] Contents API error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('[Exa Proxy] Error:', error);
        return res.status(500).json({ error: 'Failed to fetch from Exa API' });
    }
}
