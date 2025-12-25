/**
 * Shared Tool Definitions
 * Centralized tool configurations for all AI providers
 * This avoids duplication and ensures consistency across services
 */

import { Type } from '@google/genai';

// =============================================================================
// TOOL DEFINITIONS - OpenAI Compatible Format (for OpenRouter, Groq)
// =============================================================================

export const OPENAI_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'web_search',
            description: 'Search the web for current information. Use for general queries, facts, or any topic needing up-to-date data.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    category: {
                        type: 'string',
                        description: 'Optional focus: "news", "github", "company", "research paper", "tweet", "people"',
                    },
                    numResults: {
                        type: 'number',
                        description: 'Results count (1-10, default 5)',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_news',
            description: 'Search recent news articles. Use for current events, breaking news, or recent developments.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The news topic to search',
                    },
                    numResults: {
                        type: 'number',
                        description: 'Results count (1-10, default 5)',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_people',
            description: 'Search for people/professionals by role, company, skills. Use for finding LinkedIn profiles, executives, employees, or anyone by their professional info. Examples: "VP of Product at Microsoft", "enterprise sales reps in EMEA", "AI researchers at Google".',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Person search query - include role, company, location, or skills',
                    },
                    numResults: {
                        type: 'number',
                        description: 'Results count (1-10, default 5)',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_github',
            description: 'Search GitHub for repositories, code, and documentation.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Repository or code topic to search',
                    },
                    numResults: {
                        type: 'number',
                        description: 'Results count (1-10, default 5)',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'crawl_website',
            description: 'Crawl a website and its subpages for comprehensive information.',
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'Website URL to crawl',
                    },
                    query: {
                        type: 'string',
                        description: 'Optional query to focus the crawl',
                    },
                    subpages: {
                        type: 'number',
                        description: 'Subpages to crawl (1-10, default 5)',
                    },
                },
                required: ['url'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'visit_urls',
            description: 'Get full content from specific URLs. Use AFTER web_search to read detailed content from results.',
            parameters: {
                type: 'object',
                properties: {
                    urls: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'URLs to visit (1-5 recommended)',
                    },
                },
                required: ['urls'],
            },
        },
    },
];

// =============================================================================
// TOOL DEFINITIONS - Gemini Format
// =============================================================================

export const GEMINI_TOOLS = [
    {
        functionDeclarations: [
            {
                name: 'web_search',
                description: 'Search the web for current information. Use for general queries, facts, or any topic needing up-to-date data.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'The search query',
                        },
                        category: {
                            type: Type.STRING,
                            description: 'Optional focus: "news", "github", "company", "research paper", "tweet", "pdf", "personal site", "people", "financial report"',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_news',
                description: 'Search recent news articles. Use for current events, breaking news, or recent developments.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'The news topic to search',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_people',
                description: 'Search for people/professionals by role, company, skills. Use for finding LinkedIn profiles, executives, employees, or anyone by their professional info. Examples: "VP of Product at Microsoft", "enterprise sales reps in EMEA", "AI researchers at Google".',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'Person search query - include role, company, location, or skills',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_research_papers',
                description: 'Search academic research papers and scientific publications.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'Research topic or paper title',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_github',
                description: 'Search GitHub for repositories, code, and documentation.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'Repository or code topic to search',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_company',
                description: 'Search for company information and business details.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'Company name or business topic',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'search_tweets',
                description: 'Search Twitter/X posts for social discussions and opinions.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: 'Topic or hashtag to search',
                        },
                        numResults: {
                            type: Type.NUMBER,
                            description: 'Results count (1-10, default 5)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'crawl_website',
                description: 'Crawl a website and its subpages for comprehensive information.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        url: {
                            type: Type.STRING,
                            description: 'Website URL to crawl',
                        },
                        query: {
                            type: Type.STRING,
                            description: 'Optional query to focus the crawl',
                        },
                        subpages: {
                            type: Type.NUMBER,
                            description: 'Subpages to crawl (1-10, default 5)',
                        },
                        targets: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Target sections to prioritize (e.g., ["docs", "api"])',
                        },
                    },
                    required: ['url'],
                },
            },
            {
                name: 'visit_urls',
                description: 'Get full content from specific URLs. Use AFTER web_search to read detailed content from results.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        urls: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'URLs to visit (1-5 recommended)',
                        },
                    },
                    required: ['urls'],
                },
            },
        ],
    },
];
