/**
 * Groq Service with Tool Calling Support
 * Supports:
 * - Kimi K2 model with Exa search tools
 * - Groq Compound models with built-in web search, code execution, and Wolfram Alpha
 * API Docs: https://console.groq.com/docs/tool-use/overview
 * Compound Docs: https://console.groq.com/docs/compound
 */

import { Attachment, ToolCall, ToolCallStatus } from '../types';
import { getUserEnvironmentContext } from '../utils/context';
import { ExaCategory, exaAnswer, exaGetContents, exaSearch } from './exaService';
import { 
    getCreativeWritingPrompt, 
    getDefaultPrompt, 
    getSearchPrompt, 
    getSearchWithReasoningPrompt,
    getReasoningPrompt,
    getTTSInstructions
} from './prompts';
import { OPENAI_CREATIVE_ONLY_TOOLS, OPENAI_TOOLS } from './tools';

const GROQ_API_KEYS = [
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
].filter(Boolean) as string[];

const GROQ_BASE_URL = import.meta.env.VITE_GROQ_BASE_URL || 'https://api.groq.com/openai/v1';

let currentKeyIndex = 0;

function getNextApiKey(): string {
    if (GROQ_API_KEYS.length === 0) {
        throw new Error('No Groq API keys configured');
    }
    const key = GROQ_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
    console.log(`[Groq] Rotating to API key index: ${currentKeyIndex === 0 ? GROQ_API_KEYS.length - 1 : currentKeyIndex - 1}`);
    return key;
}

const MAX_RETRIES = Math.max(GROQ_API_KEYS.length, 1);
const MAX_ITERATIONS = 10; // Safety limit for multi-turn tool calling

/**
 * Check if model is a Groq Compound model (has built-in tools)
 */
function isCompoundModel(modelId: string): boolean {
    return modelId.startsWith('groq/compound');
}

/**
 * Check if model is the full Compound (not mini) - supports multiple tools
 */
function isFullCompoundModel(modelId: string): boolean {
    return modelId === 'groq/compound';
}

/**
 * Get enabled tools for Compound models
 * - groq/compound: All tools (web_search, code_interpreter, visit_website, browser_automation, wolfram_alpha)
 * - groq/compound-mini: Single tool per request, basic tools
 */
function getCompoundEnabledTools(modelId: string): string[] {
    if (isFullCompoundModel(modelId)) {
        // Full Compound supports all tools including browser automation and Wolfram Alpha
        return ['web_search', 'code_interpreter', 'visit_website', 'browser_automation', 'wolfram_alpha'];
    }
    // Compound Mini - basic tools (single tool per request)
    return ['web_search', 'code_interpreter', 'visit_website'];
}


/**
 * Compact formatter for Groq to minimize tokens
 */
function formatExaResultsCompact(results: any[]): string {
    if (!results?.length) return 'No results found.';

    const formatted = results.slice(0, 3).map((r, i) => {
        let s = `[${i + 1}] ${r.title || 'Untitled'}\nURL: ${r.url}`;
        if (r.text) s += `\n${r.text.slice(0, 250)}`;
        return s;
    }).join('\n\n');

    return `⚠️ MANDATORY: Cite EVERY fact using [Title](url) format after the sentence.
Use > blockquotes for key quotes/findings.

SOURCES:
${formatted}`;
}

interface ChatMessage {
    role: 'user' | 'model' | 'assistant' | 'system';
    content: string;
    attachments?: Attachment[];
}

// Event types for streaming with tool calls
export type GroqStreamEvent =
    | { type: 'text'; content: string }
    | { type: 'thinking'; content: string }
    | { type: 'thinking_done' }
    | { type: 'tool_call_start'; toolCall: ToolCall }
    | { type: 'tool_call_update'; id: string; status: ToolCallStatus; result?: any; error?: string; progress?: string }
    | { type: 'done' };

// Search type for Exa API
export type ExaSearchType = 'auto' | 'fast' | 'deep';

// Tool execution timeout in milliseconds
const TOOL_TIMEOUT_MS = 15000;

/**
 * Wrap a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, toolName: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${toolName} timed out after ${timeoutMs / 1000}s`)), timeoutMs)
        )
    ]);
}

/**
 * Execute a tool call - Optimized for Groq's 10K TPM limit
 * Always uses 'fast' search type to minimize response size and latency
 */
async function executeToolCall(name: string, args: Record<string, any>): Promise<any> {
    console.log('[Groq] executeToolCall called:', { name, args });
    const numResults = Math.min(args.numResults || 3, 3);
    // Force 'fast' for Groq to avoid rate limits - 'auto' can return too much data
    const searchType = 'fast';

    const executeWithTimeout = async () => {
        switch (name) {
            case 'creative_writing': {
                // Creative writing tool - returns the content directly for special UI rendering
                return {
                    type: 'creative_writing',
                    title: args.title || 'Manuscript',
                    content: args.content || '',
                };
            }

            case 'web_search': {
                const searchResult = await exaSearch({
                    query: args.query,
                    numResults,
                    category: args.category as ExaCategory | undefined,
                    text: { maxCharacters: 300 },
                    type: searchType,
                    extras: { imageLinks: 2 },
                });
                // Strip to minimal content
                if (searchResult.results) {
                    searchResult.results = searchResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 300 ? r.text.slice(0, 300) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                    }));
                }
                return searchResult;
            }

            case 'search_news': {
                const newsResult = await exaSearch({
                    query: args.query,
                    numResults,
                    category: 'news',
                    text: { maxCharacters: 300 },
                    type: searchType,
                    extras: { imageLinks: 2 },
                });
                if (newsResult.results) {
                    newsResult.results = newsResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 300 ? r.text.slice(0, 300) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                    }));
                }
                return newsResult;
            }

            case 'search_github': {
                const githubResult = await exaSearch({
                    query: args.query,
                    numResults,
                    category: 'github',
                    text: { maxCharacters: 300 },
                    type: searchType,
                });
                if (githubResult.results) {
                    githubResult.results = githubResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 300 ? r.text.slice(0, 300) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                    }));
                }
                return githubResult;
            }

            case 'search_research_papers': {
                const researchResult = await exaSearch({
                    query: args.query,
                    numResults,
                    category: 'research paper',
                    text: { maxCharacters: 300 },
                    type: searchType,
                });
                if (researchResult.results) {
                    researchResult.results = researchResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 300 ? r.text.slice(0, 300) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                    }));
                }
                return researchResult;
            }

            case 'search_people': {
                const peopleResult = await exaSearch({
                    query: args.query,
                    numResults,
                    category: 'people',
                    text: { maxCharacters: 300 },
                    type: searchType,
                });
                if (peopleResult.results) {
                    peopleResult.results = peopleResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 300 ? r.text.slice(0, 300) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                    }));
                }
                return peopleResult;
            }

            case 'crawl_website': {
                const url = args.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                const searchQuery = args.query || url;

                const crawlResult = await exaSearch({
                    query: searchQuery,
                    numResults: 1,
                    includeDomains: [url],
                    text: { maxCharacters: 400 },
                    type: searchType,
                    subpages: 1,
                    livecrawl: 'preferred',
                    livecrawlTimeout: 5000,
                });
                if (crawlResult.results) {
                    crawlResult.results = crawlResult.results.map(r => ({
                        ...r,
                        text: r.text && r.text.length > 400 ? r.text.slice(0, 400) + '...' : r.text,
                        highlights: undefined,
                        highlightScores: undefined,
                        summary: undefined,
                        subpages: r.subpages?.slice(0, 1).map(sp => ({
                            ...sp,
                            text: sp.text && sp.text.length > 200 ? sp.text.slice(0, 200) + '...' : sp.text,
                        })),
                    }));
                }
                return crawlResult;
            }

            case 'visit_urls': {
                const urlsToVisit = (args.urls || []).slice(0, 1);
                console.log('[Groq] Visiting URL:', urlsToVisit);
                return await exaGetContents(urlsToVisit, 1000);
            }

            case 'quick_answer': {
                console.log('[Groq] Getting quick answer for:', args.query);
                return await exaAnswer({
                    query: args.query,
                    text: true,
                });
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    };

    return withTimeout(executeWithTimeout(), TOOL_TIMEOUT_MS, name);
}

/**
 * Streams a response from Groq Compound model (built-in web search)
 * Compound models handle search server-side automatically
 *
 * Strategy: Use non-streaming to get executed_tools reliably, then simulate streaming
 * for the UI. This ensures we get proper tool execution info.
 */
async function* streamCompoundModel(
    prompt: string,
    history: ChatMessage[],
    modelId: string,
    enableTools: boolean
): AsyncGenerator<GroqStreamEvent, void, unknown> {
    // Convert history to Groq's expected format
    const formattedHistory = history
        .filter(msg => msg.content && (msg.role === 'user' || msg.role === 'model' || msg.role === 'assistant'))
        .map(msg => {
            const role = msg.role === 'model' ? 'assistant' : msg.role as 'user' | 'assistant';
            let content = msg.content;

            // Append attachment content
            if (msg.attachments) {
                for (const att of msg.attachments) {
                    if (att.type === 'image') {
                        content += `\n\n[Image attached: ${att.name} - Note: This model cannot view images directly]`;
                    } else if (att.content) {
                        content += `\n\n[Attached File: ${att.name}]\n${att.content}\n[End of File]`;
                    }
                }
            }

            return { role, content };
        });

    // Build capabilities description based on model
    const isFullModel = isFullCompoundModel(modelId);
    const capabilitiesDesc = isFullModel
        ? `You have access to powerful tools:
- Web Search: Find real-time information from the internet
- Code Interpreter: Execute Python code for calculations, data analysis, and visualizations
- Visit Website: Fetch and analyze content from specific URLs
- Browser Automation: Interact with web pages programmatically
- Wolfram Alpha: Advanced mathematical computations, scientific data, and knowledge queries`
        : `You have access to web search, code execution, and website visiting capabilities.`;

    // System prompt for Compound - enforce proper citation format
    const systemPrompt = enableTools
        ? `You are a helpful AI assistant with powerful built-in tools.

${capabilitiesDesc}

WHEN TO USE TOOLS - BE PROACTIVE:
✅ USE tools when:
- User asks about current events, news, or recent information
- User needs real-time data (stock prices, weather, sports scores)
- User asks "what is the latest..." or "current status of..."
- User needs to verify facts that may have changed
- User asks about specific people, companies, or events
- User needs calculations, data analysis, or code execution
- User asks about anything that requires up-to-date information

❌ DO NOT use tools when:
- User asks general knowledge questions you already know
- User asks about concepts, definitions, or explanations
- User asks for opinions, advice, or creative content
- User asks about historical facts or established science
- User is having a casual conversation

RESPONSE STYLE:
- Be VERBOSE at a medium level — provide detailed, comprehensive responses
- Include context, background, and thorough explanations
- End with 2-3 open-ended follow-up questions to encourage exploration

CRITICAL CITATION RULES (ONLY WHEN USING SEARCH):
- NEVER use 【】brackets for citations
- NEVER use numbered references like [1], [2]
- ALWAYS use markdown link format: [Title](url)
- Citation goes AFTER the sentence period
- NEVER USE TABLE TO APPEND NEWS! NEVER USE TABLE FOR ANY REASON!

CORRECT FORMAT:
"The movie releases in December 2026." [Wikipedia](https://en.wikipedia.org/wiki/Example)

WRONG FORMAT (DO NOT USE):
❌ 【Title: Example, URL: https://...】
❌ [1] or [2]
❌ (Source: url)

BLOCKQUOTE USAGE - USE LIBERALLY:
Use > blockquotes for:
- Key quotes and findings from sources
- Important statistics or data points
- Synopsis of source content
- Expert opinions

Example:
> **Key Finding:** "AI adoption grew 47% in 2024." [Gartner](https://gartner.com)

Be detailed, informative, and engaging.

${getTTSInstructions()}

${getUserEnvironmentContext()}`
        : getDefaultPrompt();

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: prompt }
    ];

    // Tool call ID - will only be used if model actually uses tools
    const toolCallId = `compound_search_${Date.now()}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            // Build request with compound_custom tools configuration
            const enabledTools = getCompoundEnabledTools(modelId);
            const requestBody: any = {
                model: modelId,
                messages,
                stream: false, // Use non-streaming to get executed_tools reliably
                max_completion_tokens: 8192,
                temperature: 0.6,
            };

            // Only add compound_custom if tools are enabled
            if (enableTools) {
                requestBody.compound_custom = {
                    tools: {
                        enabled_tools: enabledTools
                    }
                };
            }

            console.log(`[Groq Compound] Using model: ${modelId}, enabled tools:`, enabledTools);

            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getNextApiKey()}`,
                    'Content-Type': 'application/json',
                    'Groq-Model-Version': 'latest',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.text();
                const errorMsg = `Groq API error: ${response.status} - ${error}`;

                // Check if rate limited - try next key
                if (response.status === 429 || error.includes('rate') || error.includes('quota')) {
                    console.log(`[Groq Compound] Rate limited on attempt ${attempt + 1}/${MAX_RETRIES}, trying next key...`);
                    lastError = new Error(errorMsg);
                    continue;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const message = data.choices?.[0]?.message;

            if (!message) {
                throw new Error('No message in response');
            }

            // Extract executed_tools from the response
            const executedTools = message.executed_tools || [];
            console.log('[Groq Compound] Executed tools:', executedTools.length);

            // Build search results from executed_tools
            let searchResults: any[] = [];
            if (executedTools.length > 0) {
                for (const tool of executedTools) {
                    console.log('[Groq Compound] Tool executed:', tool.type, tool.arguments);

                    // Parse search results from tool output
                    if (tool.output) {
                        // Try to extract URLs and titles from the output
                        const urlMatches = tool.output.match(/URL:\s*(https?:\/\/[^\s\n]+)/gi) || [];
                        const titleMatches = tool.output.match(/Title:\s*([^\n]+)/gi) || [];

                        for (let i = 0; i < Math.max(urlMatches.length, titleMatches.length); i++) {
                            const url = urlMatches[i]?.replace(/^URL:\s*/i, '').trim();
                            const title = titleMatches[i]?.replace(/^Title:\s*/i, '').trim() || 'Source';
                            if (url) {
                                searchResults.push({ title, url, text: '' });
                            }
                        }
                    }

                    // Also check for search_results structure
                    if (tool.search_results?.results) {
                        for (const result of tool.search_results.results) {
                            searchResults.push({
                                title: result.title || 'Untitled',
                                url: result.url,
                                text: result.content || '',
                                score: result.score,
                            });
                        }
                    }
                }
            }

            // Emit tool call events if tools were used
            if (enableTools && searchResults.length > 0) {
                const toolName = isFullCompoundModel(modelId) ? 'compound_tools' : 'web_search';
                yield {
                    type: 'tool_call_start',
                    toolCall: {
                        id: toolCallId,
                        name: toolName,
                        args: { query: prompt.slice(0, 100) },
                        status: 'completed',
                        startedAt: new Date(),
                    }
                };

                yield {
                    type: 'tool_call_update',
                    id: toolCallId,
                    status: 'completed',
                    result: { results: searchResults }
                };
            }

            // Process and stream the content
            let content = message.content || '';

            // Convert 【】 citations to markdown format
            content = content.replace(/【([^】]+?),\s*URL:\s*(https?:\/\/[^\s】]+)】/gi, (_: string, title: string, url: string) => {
                return `[${title.replace(/^Title:\s*/i, '')}](${url})`;
            });
            content = content.replace(/【([^】]+)】\((https?:\/\/[^\s\)]+)\)/gi, '[$1]($2)');
            content = content.replace(/【([^】]+)】/g, '[$1]');

            // Simulate streaming by chunking the response
            const chunkSize = 20; // Characters per chunk
            for (let i = 0; i < content.length; i += chunkSize) {
                const chunk = content.slice(i, i + chunkSize);
                yield { type: 'text', content: chunk };
                // Small delay to simulate streaming feel
                await new Promise(resolve => setTimeout(resolve, 5));
            }

            yield { type: 'done' };
            return;

        } catch (error) {
            lastError = error as Error;
            console.error(`[Groq Compound] API Error on attempt ${attempt + 1}/${MAX_RETRIES}:`, error);

            const errorMessage = String(error);
            if (errorMessage.includes('429') || errorMessage.includes('rate') || errorMessage.includes('quota')) {
                console.log(`[Groq Compound] Rate limited, trying next API key...`);
                continue;
            }
            throw error;
        }
    }

    console.error('[Groq Compound] All API keys exhausted');
    throw lastError || new Error('All Groq API keys failed');
}


/**
 * Streams a response from Groq API with tool calling support
 * Note: Groq/Kimi always uses 'fast' search type due to 10K TPM limit
 */
export async function* sendMessageToGroqStreamWithTools(
    prompt: string,
    history: ChatMessage[],
    modelId: string = 'moonshotai/kimi-k2-instruct-0905',
    enableTools: boolean = false,
    _searchType: ExaSearchType = 'auto', // Ignored - always uses 'fast' for Groq
    reasoningEnabled: boolean = false,
    creativeWritingOnly: boolean = false
): AsyncGenerator<GroqStreamEvent, void, unknown> {
    // Route to Compound model handler if applicable
    // Note: Compound models use built-in tools, not custom tools like creative_writing
    if (isCompoundModel(modelId)) {
        yield* streamCompoundModel(prompt, history, modelId, enableTools);
        return;
    }

    // Select appropriate tool set based on whether it's creative-writing-only or full tools
    const toolsToUse = creativeWritingOnly ? OPENAI_CREATIVE_ONLY_TOOLS : OPENAI_TOOLS;

    if (creativeWritingOnly) {
        console.log('[Groq/Kimi K2] Using creative_writing tool only (browse tools disabled)');
    }

    // Convert history to Groq's expected format
    const formattedHistory = history
        .filter(msg => msg.content && (msg.role === 'user' || msg.role === 'model' || msg.role === 'assistant'))
        .map(msg => {
            const role = msg.role === 'model' ? 'assistant' : msg.role as 'user' | 'assistant';
            let content = msg.content;

            // Append attachment content
            if (msg.attachments) {
                for (const att of msg.attachments) {
                    if (att.type === 'image') {
                        // Groq/Kimi doesn't support images natively - add a note
                        content += `\n\n[Image attached: ${att.name} - Note: This model cannot view images directly]`;
                    } else if (att.content) {
                        // Documents with extracted text
                        content += `\n\n[Attached File: ${att.name}]\n${att.content}\n[End of File]`;
                    }
                }
            }

            return { role, content };
        });

    // Build system prompt based on mode
    // Note: Groq always uses 'fast' search due to 10K TPM rate limit
    let systemPrompt: string;

    if (creativeWritingOnly) {
        // Use creative writing prompt when only creative_writing tool is enabled
        systemPrompt = getCreativeWritingPrompt();
    } else if (enableTools) {
        systemPrompt = getSearchPrompt('fast');
    } else if (reasoningEnabled) {
        systemPrompt = getReasoningPrompt();
    } else {
        systemPrompt = getDefaultPrompt();
    }

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: prompt }
    ];

    let isFirstIteration = true;
    let lastError: Error | null = null;
    let retryCount = 0;
    let continueLoop = true;

    let iterationCount = 0;
    while (continueLoop && iterationCount < MAX_ITERATIONS) {
        iterationCount++;
        // Reset continueLoop to false at the start of each iteration
        // We only set it back to true if we need to continue for model response or retry
        continueLoop = false;

        try {
            const requestBody: any = {
                model: modelId,
                messages,
                stream: true,
                max_completion_tokens: 8192,
                temperature: 0.6,
            };

            if (enableTools) {
                requestBody.tools = toolsToUse;
                // Use 'auto' to let the model decide when to use tools, especially in multi-turn conversations
                requestBody.tool_choice = 'auto';
                console.log(`[Groq/Kimi K2] Tools enabled with tool_choice: auto (iteration: ${isFirstIteration ? 'first' : 'subsequent'})`);
            }

            isFirstIteration = false;

            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getNextApiKey()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('[Groq/Kimi] API error:', response.status, error);

                // Check if rate limited - try next key
                if (response.status === 429 || error.includes('rate') || error.includes('quota')) {
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                        console.log(`[Groq/Kimi] Rate limited on attempt ${retryCount}/${MAX_RETRIES}, trying next key...`);
                        continueLoop = true;
                        continue;
                    }
                    throw new Error(`RATE_LIMITED: ${response.status} - ${error}`);
                }
                throw new Error(`Groq API error: ${response.status} - ${error}`);
            }

            console.log('[Groq/Kimi] Response OK, status:', response.status);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
            let toolCalls: Array<{ id: string; name: string; arguments: string }> = [];
            let currentToolCallIndex = -1;

            // For reasoning mode - track thinking state
            let isInThinkingBlock = false;
            // Buffer for accumulating content to handle split tags
            let pendingContent = '';

            // Buffer pre-tool text when tools are enabled - discard if tools are called
            let preToolTextBuffer = '';
            let hasSeenToolCall = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('[Groq/Kimi] Reader done, remaining buffer:', buffer);
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;

                    const data = trimmed.slice(6);
                    if (data === '[DONE]') {
                        console.log('[Groq/Kimi] Received [DONE]');
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta;

                        if (!delta) continue;

                        // Handle text content
                        if (delta.content) {
                            fullContent += delta.content;

                            // When tools are enabled, buffer text until we know if tools will be called
                            // This prevents "I will search..." planning text from showing
                            if (enableTools && !hasSeenToolCall) {
                                preToolTextBuffer += delta.content;
                                // Don't yield yet - wait to see if tools are called
                            } else if (reasoningEnabled) {
                                // Parse thinking tags with robust buffering for split tags
                                pendingContent += delta.content;

                                while (true) {
                                    if (!isInThinkingBlock) {
                                        const openIdx = pendingContent.indexOf('<thinking>');
                                        if (openIdx === -1) {
                                            if (pendingContent.length > 10) {
                                                const toEmit = pendingContent.slice(0, -10);
                                                pendingContent = pendingContent.slice(-10);
                                                if (toEmit) yield { type: 'text', content: toEmit };
                                            }
                                            break;
                                        } else {
                                            const beforeTag = pendingContent.slice(0, openIdx);
                                            if (beforeTag) yield { type: 'text', content: beforeTag };
                                            pendingContent = pendingContent.slice(openIdx + 10);
                                            isInThinkingBlock = true;
                                        }
                                    } else {
                                        const closeIdx = pendingContent.indexOf('</thinking>');
                                        if (closeIdx === -1) {
                                            if (pendingContent.length > 11) {
                                                const toEmit = pendingContent.slice(0, -11);
                                                pendingContent = pendingContent.slice(-11);
                                                if (toEmit) yield { type: 'thinking', content: toEmit };
                                            }
                                            break;
                                        } else {
                                            const thinkingContent = pendingContent.slice(0, closeIdx);
                                            if (thinkingContent) yield { type: 'thinking', content: thinkingContent };
                                            yield { type: 'thinking_done' };
                                            pendingContent = pendingContent.slice(closeIdx + 11);
                                            isInThinkingBlock = false;
                                        }
                                    }
                                }
                            } else {
                                yield { type: 'text', content: delta.content };
                            }
                        }

                        // Handle tool calls
                        if (delta.tool_calls) {
                            // Mark that we've seen tool calls - discard buffered pre-tool text
                            if (!hasSeenToolCall) {
                                hasSeenToolCall = true;
                                preToolTextBuffer = ''; // Discard planning text
                            }

                            for (const tc of delta.tool_calls) {
                                if (tc.index !== undefined && tc.index !== currentToolCallIndex) {
                                    currentToolCallIndex = tc.index;
                                    toolCalls[tc.index] = {
                                        id: tc.id || `call_${Date.now()}_${tc.index}`,
                                        name: tc.function?.name || '',
                                        arguments: tc.function?.arguments || '',
                                    };
                                } else if (tc.function?.arguments) {
                                    toolCalls[currentToolCallIndex].arguments += tc.function.arguments;
                                }
                                if (tc.function?.name && toolCalls[currentToolCallIndex]) {
                                    toolCalls[currentToolCallIndex].name = tc.function.name;
                                }
                                if (tc.id && toolCalls[currentToolCallIndex]) {
                                    toolCalls[currentToolCallIndex].id = tc.id;
                                }
                            }
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }

            // Flush any remaining pending content for reasoning mode
            if (reasoningEnabled && pendingContent) {
                if (isInThinkingBlock) {
                    yield { type: 'thinking', content: pendingContent };
                    yield { type: 'thinking_done' };
                } else {
                    yield { type: 'text', content: pendingContent };
                }
            }

            // If tools were enabled but no tool calls happened, emit the buffered text
            if (enableTools && !hasSeenToolCall && preToolTextBuffer) {
                console.log('[Groq/Kimi] No tool calls detected, emitting buffered text');
                yield { type: 'text', content: preToolTextBuffer };
            }

            // Process tool calls if any - filter out incomplete ones
            const validToolCalls = toolCalls.filter(tc => tc.name && tc.arguments);
            console.log('[Groq/Kimi] Valid tool calls:', validToolCalls.length, 'of', toolCalls.length);

            if (validToolCalls.length > 0) {
                // Add assistant message with tool calls to history
                messages.push({
                    role: 'assistant',
                    content: fullContent || null,
                    tool_calls: validToolCalls.map(tc => ({
                        id: tc.id,
                        type: 'function',
                        function: {
                            name: tc.name,
                            arguments: tc.arguments,
                        },
                    })),
                });

                // Execute tool calls and handle results
                const pendingToolCalls: Array<{ tc: typeof validToolCalls[0]; toolCall: ToolCall }> = [];

                for (const tc of validToolCalls) {
                    let args = {};
                    try {
                        args = JSON.parse(tc.arguments);
                    } catch {
                        console.error('[Groq/Kimi] Failed to parse tool arguments:', tc.arguments);
                        args = {};
                    }

                    const toolCall: ToolCall = {
                        id: tc.id,
                        name: tc.name,
                        args,
                        status: 'pending',
                        startedAt: new Date(),
                    };

                    yield { type: 'tool_call_start', toolCall };
                    pendingToolCalls.push({ tc, toolCall });
                }

                // Mark all as running
                for (const { tc } of pendingToolCalls) {
                    yield { type: 'tool_call_update', id: tc.id, status: 'running' };
                }

                // Execute all tool calls in parallel
                const results = await Promise.all(
                    pendingToolCalls.map(async ({ tc, toolCall }) => {
                        try {
                            const result = await executeToolCall(tc.name, toolCall.args);
                            return { tc, result, error: null };
                        } catch (error) {
                            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                            return { tc, result: null, error: errorMsg };
                        }
                    })
                );

                // Process results and add to messages
                for (const { tc, result, error } of results) {
                    if (error) {
                        yield { type: 'tool_call_update', id: tc.id, status: 'error', error };
                        messages.push({
                            role: 'tool',
                            tool_call_id: tc.id,
                            name: tc.name,
                            content: JSON.stringify({ error }),
                        });
                    } else {
                        yield { type: 'tool_call_update', id: tc.id, status: 'completed', result };
                        
                        let toolContent: string;
                        if (tc.name === 'creative_writing') {
                            // For creative writing, explicitly tell the AI it has finished the task
                            toolContent = `SUCCESS: The manuscript "${result.title}" has been successfully delivered to the user through the special writing canvas tool. 
Do NOT repeat the content here. The user can already see it.
Provide only a tiny one-sentence confirmation or sign-off, or simply end your response.`;
                        } else {
                            // For search tools, use compact results
                            toolContent = formatExaResultsCompact(result.results);
                        }

                        messages.push({
                            role: 'tool',
                            tool_call_id: tc.id,
                            name: tc.name,
                            content: toolContent,
                        });
                    }
                }

                // Emit line breaks to separate pre-tool text from post-tool response
                if (fullContent && fullContent.trim()) {
                    yield { type: 'text', content: '\n\n' };
                }

                // Set continueLoop to true to get the model's final response
                continueLoop = true;
                console.log('[Groq/Kimi] Tool calls processed, continuing loop for model response.');
            } else {
                // No tool calls, we are done
                console.log('[Groq/Kimi] No tool calls, response complete.');
                continueLoop = false;
            }

        } catch (error) {
            lastError = error as Error;
            const errorMessage = String(error);

            // Rate limiting is already handled above in the response.ok check for immediate retries
            // This catch handles unexpected exceptions
            console.error('[Groq] API Error:', error);
            throw error;
        }
    }

    if (iterationCount >= MAX_ITERATIONS) {
        console.warn(`[Groq] Reached maximum iterations (${MAX_ITERATIONS}). Stopping to prevent infinite loop.`);
    }

    console.log('[Groq/Kimi] Stream complete');
    yield { type: 'done' };
}

/**
 * Simple streaming without tools (for backward compatibility)
 */
export async function* sendMessageToGroqStream(
    prompt: string,
    history: ChatMessage[],
    modelId: string = 'moonshotai/kimi-k2-instruct-0905'
): AsyncGenerator<string, void, unknown> {
    for await (const event of sendMessageToGroqStreamWithTools(prompt, history, modelId, false)) {
        if (event.type === 'text') {
            yield event.content;
        }
    }
}
// getCreativeWritingPrompt is now imported from prompts.ts

