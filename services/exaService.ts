/**
 * Exa Search Service
 * Provides web search capabilities via Exa API
 * API Docs: https://docs.exa.ai/reference/search
 */

const EXA_API_KEY = import.meta.env.VITE_EXA_API_KEY;
const EXA_BASE_URL = 'https://api.exa.ai';

// Determine if we should use the proxy (production/Vercel)
function shouldUseProxy(): boolean {
    // Vite's production flag
    if (import.meta.env.PROD) return true;
    // Fallback: check hostname
    if (typeof window !== 'undefined' &&
        (window.location.hostname.includes('vercel.app') ||
            window.location.hostname !== 'localhost')) {
        return true;
    }
    return false;
}

function getSearchEndpoint(): string {
    return shouldUseProxy() ? '/api/exa-search' : `${EXA_BASE_URL}/search`;
}

function getContentsEndpoint(): string {
    return shouldUseProxy() ? '/api/exa-contents' : `${EXA_BASE_URL}/contents`;
}

function getAnswerEndpoint(): string {
    return shouldUseProxy() ? '/api/exa-answer' : `${EXA_BASE_URL}/answer`;
}

/**
 * Exa Search Categories - specialized content types
 */
export type ExaCategory =
    | 'company'           // Company websites and info
    | 'research paper'    // Academic papers, arxiv, etc.
    | 'news'              // News articles
    | 'pdf'               // PDF documents
    | 'github'            // GitHub repositories
    | 'tweet'             // Twitter/X posts
    | 'personal site'     // Personal websites/blogs
    | 'people'            // People search (LinkedIn, profiles, etc.) - NEW: replaces 'linkedin profile'
    | 'financial report'; // Financial reports, SEC filings

/**
 * Category configurations with domain hints
 */
export const CATEGORY_CONFIG: Record<ExaCategory, { description: string; domains?: string[] }> = {
    'company': {
        description: 'Company websites, about pages, and business information',
    },
    'research paper': {
        description: 'Academic papers, research articles, and scientific publications',
        domains: ['arxiv.org', 'scholar.google.com', 'pubmed.ncbi.nlm.nih.gov', 'semanticscholar.org', 'researchgate.net'],
    },
    'news': {
        description: 'News articles from major publications and news sites',
    },
    'pdf': {
        description: 'PDF documents including reports, whitepapers, and documentation',
    },
    'github': {
        description: 'GitHub repositories, code, and documentation',
        domains: ['github.com'],
    },
    'tweet': {
        description: 'Twitter/X posts and threads',
        domains: ['twitter.com', 'x.com'],
    },
    'personal site': {
        description: 'Personal websites, blogs, and portfolios',
    },
    'people': {
        description: 'People search - find professionals by role, company, skills (LinkedIn, profiles, etc.)',
        // No domain restriction - Exa searches 1B+ profiles across the web
    },
    'financial report': {
        description: 'Financial reports, SEC filings, earnings reports',
        domains: ['sec.gov', 'investor.com'],
    },
};

/**
 * Subpage result from crawling
 */
export interface ExaSubpage {
    id: string;
    url: string;
    title?: string;
    author?: string;
    publishedDate?: string;
    text?: string;
    image?: string;
    favicon?: string;
}

export interface ExaSearchResult {
    title: string;
    url: string;
    publishedDate?: string;
    author?: string;
    id: string;
    image?: string;
    favicon?: string;
    text?: string;
    highlights?: string[];
    highlightScores?: number[];
    summary?: string;
    // Extra content from extras option
    imageLinks?: string[];
    links?: string[];
    // Subpages from crawling
    subpages?: ExaSubpage[];
}

export interface ExaSearchResponse {
    requestId: string;
    resolvedSearchType?: string;
    results: ExaSearchResult[];
    searchType?: string;
    // Context returned by deep search - detailed summary of results
    context?: string;
    searchTime?: number;
    costDollars?: {
        total: number;
    };
}

export interface ExaSearchOptions {
    query: string;
    // Search type: auto (default), neural, fast, deep
    type?: 'keyword' | 'neural' | 'auto' | 'fast' | 'deep';
    category?: ExaCategory;
    useAutoprompt?: boolean;
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    startPublishedDate?: string;
    endPublishedDate?: string;
    startCrawlDate?: string;
    endCrawlDate?: string;
    includeText?: string[];
    excludeText?: string[];
    // Additional queries for deep search (query variations)
    additionalQueries?: string[];
    // Contents options
    text?: boolean | {
        maxCharacters?: number;
        // Include HTML tags in response - helps LLMs understand text structure
        includeHtmlTags?: boolean;
    };
    highlights?: boolean | { numSentences?: number; highlightsPerUrl?: number; query?: string };
    // AI-generated summary using Gemini Flash
    summary?: boolean | {
        query?: string;
        // JSON schema for structured output - returns data matching your schema
        schema?: Record<string, any>;
    };
    livecrawl?: 'never' | 'fallback' | 'always' | 'preferred';
    // Livecrawl timeout in milliseconds (use with livecrawl: 'preferred')
    livecrawlTimeout?: number;
    // Context for deep search - combines all results into one string for RAG
    context?: boolean | { maxCharacters?: number };
    // Extra content options
    extras?: {
        links?: number;      // Number of URLs to return from each webpage
        imageLinks?: number; // Number of images to return for each result
    };
    // Subpage crawling options - crawl linked pages within a website
    subpages?: number;  // Maximum number of subpages to crawl (e.g., 5-10)
    subpageTarget?: string[];  // Target terms to prioritize (e.g., ["about", "products", "docs"])
}

/**
 * Search the web using Exa API
 * Endpoint: POST https://api.exa.ai/search
 */
export async function exaSearch(options: ExaSearchOptions): Promise<ExaSearchResponse> {
    const {
        query,
        type = 'auto',
        category,
        useAutoprompt = true,
        numResults = 5,
        includeDomains,
        excludeDomains,
        startPublishedDate,
        endPublishedDate,
        startCrawlDate,
        endCrawlDate,
        includeText,
        excludeText,
        additionalQueries,
        text = true,
        highlights,
        summary,
        livecrawl,
        livecrawlTimeout,
        context,
        extras,
        subpages,
        subpageTarget,
    } = options;

    // Build the request body according to Exa API spec
    const body: Record<string, any> = {
        query,
        type, // auto, neural, fast, deep
        numResults,
        useAutoprompt,
    };

    // Log search type
    console.log(`[Exa] Using search type: ${type}`);

    // Add additional queries for deep search
    if (additionalQueries && additionalQueries.length > 0) {
        body.additionalQueries = additionalQueries;
    }

    // Add category if specified (Exa's specialized search)
    if (category) {
        body.category = category;
        console.log(`[Exa] Using category: ${category}`);
    }

    // Contents configuration
    const contents: Record<string, any> = {};

    if (text === true) {
        contents.text = true;
    } else if (typeof text === 'object') {
        contents.text = text;
    }

    if (highlights === true) {
        contents.highlights = { numSentences: 2, highlightsPerUrl: 2 };
    } else if (typeof highlights === 'object') {
        contents.highlights = highlights;
    }

    if (summary === true) {
        contents.summary = { query: 'Main points' };
    } else if (typeof summary === 'object') {
        contents.summary = summary;
    }

    if (livecrawl) {
        contents.livecrawl = livecrawl;
    }

    if (livecrawlTimeout) {
        contents.livecrawl_timeout = livecrawlTimeout;
    }

    // Add context for deep search (returns detailed summaries)
    // Can be boolean or object with maxCharacters
    if (context === true || type === 'deep') {
        contents.context = true;
    } else if (typeof context === 'object') {
        contents.context = context;
    }

    // Add extras (links and imageLinks) - always request images for all search types
    if (extras) {
        contents.extras = extras;
        console.log(`[Exa] Requesting extras:`, extras);
    } else {
        // Always request imageLinks by default
        contents.extras = { imageLinks: 3 };
        console.log(`[Exa] Requesting default extras: { imageLinks: 3 }`);
    }

    // Add subpage crawling options
    if (subpages && subpages > 0) {
        contents.subpages = subpages;
        console.log(`[Exa] Crawling up to ${subpages} subpages`);
    }

    if (subpageTarget && subpageTarget.length > 0) {
        contents.subpage_target = subpageTarget;
        console.log(`[Exa] Targeting subpages with: ${subpageTarget.join(', ')}`);
    }

    // Only add contents if we have any content options
    if (Object.keys(contents).length > 0) {
        body.contents = contents;
    }

    // Optional filters - merge with category-specific domains if applicable
    let finalIncludeDomains = includeDomains || [];
    if (category && CATEGORY_CONFIG[category]?.domains) {
        finalIncludeDomains = [...finalIncludeDomains, ...CATEGORY_CONFIG[category].domains!];
    }

    if (finalIncludeDomains.length > 0) body.includeDomains = finalIncludeDomains;
    if (excludeDomains?.length) body.excludeDomains = excludeDomains;
    if (startPublishedDate) body.startPublishedDate = startPublishedDate;
    if (endPublishedDate) body.endPublishedDate = endPublishedDate;
    if (startCrawlDate) body.startCrawlDate = startCrawlDate;
    if (endCrawlDate) body.endCrawlDate = endCrawlDate;
    if (includeText?.length) body.includeText = includeText;
    if (excludeText?.length) body.excludeText = excludeText;

    console.log('[Exa] Search request:', JSON.stringify(body, null, 2));

    try {
        const useProxy = shouldUseProxy();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        };

        // Only include API key for direct API calls (local dev)
        if (!useProxy) {
            headers['x-api-key'] = EXA_API_KEY;
        }

        console.log('[Exa] Using proxy:', useProxy, 'Endpoint:', getSearchEndpoint());

        const response = await fetch(getSearchEndpoint(), {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Exa] API error response:', errorText);
            throw new Error(`Exa API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Count total results including subpages
        let totalSubpages = 0;
        data.results?.forEach((r: ExaSearchResult) => {
            if (r.subpages) totalSubpages += r.subpages.length;
        });

        // Count images for logging
        let totalImages = 0;
        data.results?.forEach((r: ExaSearchResult) => {
            if (r.image) totalImages++;
            if (r.imageLinks) totalImages += r.imageLinks.length;
        });

        console.log('[Exa] Search response:', {
            requestId: data.requestId,
            resultCount: data.results?.length,
            subpageCount: totalSubpages,
            imageCount: totalImages,
            searchType: data.resolvedSearchType,
            category: category || 'none',
        });

        return data;
    } catch (error) {
        console.error('[Exa] Search error:', error);
        throw error;
    }
}

/**
 * Create a text fragment URL that links to specific text on a page
 * Uses the Text Fragments API: url#:~:text=encoded%20text
 */
export function createTextFragmentUrl(baseUrl: string, text: string): string {
    // Clean the base URL (remove existing fragments)
    const cleanUrl = baseUrl.split('#')[0];

    // Encode the text for URL (limit to ~80 chars for reliability)
    const truncatedText = text.length > 80 ? text.slice(0, 80) : text;
    const encodedText = encodeURIComponent(truncatedText.trim());

    return `${cleanUrl}#:~:text=${encodedText}`;
}

/**
 * Format Exa results for AI context
 * Includes instructions for the AI to use proper markdown links with text fragments
 */
export function formatExaResultsForContext(results: ExaSearchResult[]): string {
    if (!results || !results.length) return 'No search results found.';

    const formattedResults = results
        .map((r, i) => {
            let content = `**Source [${i + 1}]:** [${r.title}](${r.url})`;
            if (r.author) content += `\nAuthor: ${r.author}`;
            if (r.publishedDate) {
                const parsedDate = new Date(r.publishedDate);
                if (!isNaN(parsedDate.getTime())) {
                    content += `\nPublished: ${parsedDate.toLocaleDateString()}`;
                }
            }
            if (r.text) {
                // Limit text to reasonable length for context
                const truncatedText = r.text.length > 2000 ? r.text.slice(0, 2000) + '...' : r.text;
                content += `\nContent: ${truncatedText}`;
            }
            if (r.summary) content += `\nSummary: ${r.summary}`;
            if (r.highlights?.length) {
                content += `\nKey excerpts: ${r.highlights.join(' | ')}`;
            }

            // Include subpages if available
            if (r.subpages && r.subpages.length > 0) {
                content += `\n\n📄 **Subpages (${r.subpages.length}):**`;
                r.subpages.forEach((sp, spIndex) => {
                    content += `\n  [${spIndex + 1}] [${sp.title || 'Untitled'}](${sp.url})`;
                    if (sp.text) {
                        const truncatedSubText = sp.text.length > 500 ? sp.text.slice(0, 500) + '...' : sp.text;
                        content += `\n      ${truncatedSubText}`;
                    }
                });
            }

            return content;
        })
        .join('\n\n---\n\n');

    // Build a simple URL reference map (including subpages)
    const urlMap = results.map((r, i) => `[${i + 1}] ${r.url}`).join('\n');

    // Add instructions for the AI on how to cite sources
    const instructions = `═══════════════════════════════════════════════════════════════
⚠️ MANDATORY CITATION RULES - YOU MUST FOLLOW EXACTLY
═══════════════════════════════════════════════════════════════

AVAILABLE SOURCES:
${urlMap}

CITATION FORMAT: "Statement." [Title](url)
- Citation goes AFTER the period
- Use > blockquotes for key quotes/findings

CORRECT:
✅ "React 19 has new features." [React Blog](${results[0]?.url || 'url'})
✅ > "This is a key finding worth highlighting." [Source](url)

WRONG:
❌ [1], [2] — No numbered refs
❌ No citations at all

═══════════════════════════════════════════════════════════════

SEARCH RESULTS:
`;

    return instructions + formattedResults;
}

// Tool definition for Gemini function calling
export const EXA_SEARCH_TOOL = {
    name: 'web_search',
    description: 'Search the web for current information, news, articles, or any topic. Use this when you need up-to-date information or facts you are unsure about.',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'The search query to find relevant web content',
            },
            numResults: {
                type: 'number',
                description: 'Number of results to return (1-10)',
                default: 5,
            },
        },
        required: ['query'],
    },
};

/**
 * URL Content Response
 */
export interface ExaUrlContent {
    url: string;
    title?: string;
    text?: string;
    author?: string;
    publishedDate?: string;
    image?: string;
    favicon?: string;
}

export interface ExaContentsResponse {
    results: ExaUrlContent[];
    requestId?: string;
}

/**
 * Fetch content from specific URLs using Exa API
 * Endpoint: POST https://api.exa.ai/contents
 * @param urls - URLs to fetch
 * @param maxCharsPerUrl - Maximum characters per URL content (default 3000)
 * @param livecrawl - Livecrawl option: 'always' | 'preferred' | 'fallback' | 'never' (default 'preferred')
 * @param livecrawlTimeout - Timeout in ms for livecrawl (default 10000, use with 'preferred')
 */
export async function exaGetContents(
    urls: string[],
    maxCharsPerUrl: number = 3000,
    livecrawl: 'always' | 'preferred' | 'fallback' | 'never' = 'preferred',
    livecrawlTimeout: number = 10000
): Promise<ExaContentsResponse> {
    if (!urls || urls.length === 0) {
        return { results: [] };
    }

    const body: Record<string, any> = {
        ids: urls,
        text: {
            maxCharacters: maxCharsPerUrl,
        },
        livecrawl,
    };

    // Add timeout for 'preferred' mode (recommended by Exa docs)
    if (livecrawl === 'preferred' && livecrawlTimeout > 0) {
        body.livecrawl_timeout = livecrawlTimeout;
    }

    console.log('[Exa] Contents request for URLs:', urls, 'maxChars:', maxCharsPerUrl);

    try {
        const useProxy = shouldUseProxy();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        };

        // Only include API key for direct API calls (local dev)
        if (!useProxy) {
            headers['x-api-key'] = EXA_API_KEY;
        }

        const response = await fetch(getContentsEndpoint(), {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Exa] Contents API error:', errorText);
            throw new Error(`Exa Contents API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Additional truncation safety - ensure content doesn't exceed limit
        if (data.results) {
            data.results = data.results.map((r: ExaUrlContent) => ({
                ...r,
                text: r.text && r.text.length > maxCharsPerUrl
                    ? r.text.slice(0, maxCharsPerUrl) + '...[truncated]'
                    : r.text
            }));
        }

        console.log('[Exa] Contents response:', {
            requestId: data.requestId,
            resultCount: data.results?.length,
            totalChars: data.results?.reduce((sum: number, r: ExaUrlContent) => sum + (r.text?.length || 0), 0),
        });

        return data;
    } catch (error) {
        console.error('[Exa] Contents fetch error:', error);
        throw error;
    }
}

/**
 * Extract URLs from text with improved validation
 */
export function extractUrlsFromText(text: string): string[] {
    // More comprehensive URL regex that validates URL structure
    const urlRegex = /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/gi;
    const matches = text.match(urlRegex) || [];

    // Validate and clean up URLs
    return matches
        .filter(url => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        })
        .map(url => url.replace(/[.,;:!?)]+$/, '')); // Remove trailing punctuation
}

/**
 * Format URL content for AI context with text fragment link instructions
 */
export function formatUrlContentForContext(contents: ExaUrlContent[]): string {
    if (!contents || contents.length === 0) {
        return '';
    }

    const formattedContents = contents.map((content, i) => {
        let formatted = `\n---\n**[Referenced URL ${i + 1}]** ${content.title || 'Untitled'}\nURL: ${content.url}`;

        if (content.author) {
            formatted += `\nAuthor: ${content.author}`;
        }
        if (content.publishedDate) {
            const parsedDate = new Date(content.publishedDate);
            if (!isNaN(parsedDate.getTime())) {
                formatted += `\nPublished: ${parsedDate.toLocaleDateString()}`;
            }
        }
        if (content.text) {
            // Limit content to reasonable size
            const maxLength = 4000;
            const truncatedText = content.text.length > maxLength
                ? content.text.slice(0, maxLength) + '...[content truncated]'
                : content.text;
            formatted += `\n\nContent:\n${truncatedText}`;
        }

        return formatted;
    }).join('\n\n');

    // Add text fragment instructions
    const instructions = `
TEXT FRAGMENT LINKING INSTRUCTIONS:
When quoting specific text from these URLs, create TEXT FRAGMENT LINKS that jump directly to the quoted text.

FORMAT: url#:~:text=URL_ENCODED_QUOTE

EXAMPLE:
If the URL is: ${contents[0]?.url || 'https://example.com/page'}
And you quote: "This is an important finding"
Create link: [This is an important finding](${contents[0]?.url || 'https://example.com/page'}#:~:text=This%20is%20an%20important%20finding)

RULES:
1. URL-encode spaces as %20 and special characters
2. Keep the encoded text under 80 characters for reliability
3. Use the EXACT text from the content (first 60-80 chars of the quote)
4. ALWAYS link quotes to their specific location using text fragments

This allows users to click the link and see the exact quote highlighted on the page.
`;

    return instructions + formattedContents;
}


/**
 * Exa Answer API Response
 * Returns a direct answer with citations
 */
export interface ExaAnswerCitation {
    id: string;
    url: string;
    title: string;
    author?: string;
    publishedDate?: string;
    text?: string;
    image?: string;
    favicon?: string;
}

export interface ExaAnswerResponse {
    answer: string;
    citations: ExaAnswerCitation[];
    costDollars?: {
        total: number;
    };
}

export interface ExaAnswerOptions {
    query: string;
    // Optional: filter by domains
    includeDomains?: string[];
    excludeDomains?: string[];
    // Optional: date filters
    startPublishedDate?: string;
    endPublishedDate?: string;
    // Optional: text content options
    text?: boolean | { maxCharacters?: number };
}

/**
 * Get a direct answer to a question using Exa Answer API
 * Endpoint: POST https://api.exa.ai/answer
 *
 * This is useful for quick factual questions where you want a direct answer
 * with citations rather than a list of search results.
 *
 * @param options - Answer options including the query
 * @returns Answer with citations
 */
export async function exaAnswer(options: ExaAnswerOptions): Promise<ExaAnswerResponse> {
    const {
        query,
        includeDomains,
        excludeDomains,
        startPublishedDate,
        endPublishedDate,
        text = true,
    } = options;

    const body: Record<string, any> = {
        query,
    };

    // Add optional filters
    if (includeDomains?.length) body.includeDomains = includeDomains;
    if (excludeDomains?.length) body.excludeDomains = excludeDomains;
    if (startPublishedDate) body.startPublishedDate = startPublishedDate;
    if (endPublishedDate) body.endPublishedDate = endPublishedDate;

    // Text content options
    if (text === true) {
        body.text = true;
    } else if (typeof text === 'object') {
        body.text = text;
    }

    console.log('[Exa] Answer request:', JSON.stringify(body, null, 2));

    try {
        const useProxy = shouldUseProxy();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        };

        if (!useProxy) {
            headers['x-api-key'] = EXA_API_KEY;
        }

        const response = await fetch(getAnswerEndpoint(), {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Exa] Answer API error:', errorText);
            throw new Error(`Exa Answer API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        console.log('[Exa] Answer response:', {
            answerLength: data.answer?.length,
            citationCount: data.citations?.length,
            cost: data.costDollars?.total,
        });

        return data;
    } catch (error) {
        console.error('[Exa] Answer error:', error);
        throw error;
    }
}
