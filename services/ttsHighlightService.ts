/**
 * TTS Highlight Service
 *
 * Uses CSS Custom Highlight API to highlight text during TTS playback
 * WITHOUT modifying the DOM structure. This preserves all markdown rendering
 * (code blocks, tables, links, etc.) while adding karaoke-style highlighting.
 *
 * Fallback: For browsers without Highlight API support, uses a TreeWalker
 * approach that wraps text nodes in spans while preserving structure.
 */

import { WordTiming } from './elevenLabsService';

// Check for CSS Custom Highlight API support
const supportsHighlightAPI = typeof CSS !== 'undefined' && 'highlights' in CSS;

// Highlight names
const HIGHLIGHT_CURRENT = 'tts-current-word';
const HIGHLIGHT_SPOKEN = 'tts-spoken-words';

/**
 * Text node with position info for mapping words to DOM
 */
interface TextNodeInfo {
    node: Text;
    startOffset: number;  // Character offset in the full text
    endOffset: number;
    text: string;
}

/**
 * Word position in the DOM
 */
interface WordPosition {
    word: string;
    nodes: Array<{
        node: Text;
        startOffset: number;  // Offset within this text node
        endOffset: number;
    }>;
}

/**
 * Collect all text nodes from an element, preserving order
 */
function collectTextNodes(element: HTMLElement): TextNodeInfo[] {
    const textNodes: TextNodeInfo[] = [];
    let currentOffset = 0;

    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip text in script/style tags
                const parent = node.parentElement;
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    return NodeFilter.FILTER_REJECT;
                }
                // Skip empty text nodes
                if (!node.textContent || node.textContent.trim() === '') {
                    // But count whitespace for offset tracking
                    if (node.textContent) {
                        currentOffset += node.textContent.length;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
        const text = node.textContent || '';
        textNodes.push({
            node,
            startOffset: currentOffset,
            endOffset: currentOffset + text.length,
            text
        });
        currentOffset += text.length;
    }

    return textNodes;
}

/**
 * Extract plain text from element (matching what TTS receives)
 */
function extractPlainText(element: HTMLElement): string {
    // Clone to avoid modifying original
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove code blocks (they're stripped for TTS)
    clone.querySelectorAll('pre, code').forEach(el => el.remove());

    return clone.textContent || '';
}

/**
 * Map word timings to DOM positions
 * This is the tricky part - we need to find where each word exists in the rendered DOM
 */
function mapWordsToDOM(
    element: HTMLElement,
    wordTimings: WordTiming[]
): WordPosition[] {
    const textNodes = collectTextNodes(element);
    const positions: WordPosition[] = [];

    // Build a combined text from all nodes for searching
    let combinedText = '';
    const nodeMap: Array<{ node: Text; globalStart: number; globalEnd: number }> = [];

    for (const info of textNodes) {
        nodeMap.push({
            node: info.node,
            globalStart: combinedText.length,
            globalEnd: combinedText.length + info.text.length
        });
        combinedText += info.text;
    }

    // Normalize for matching (lowercase, collapse whitespace)
    const normalizedCombined = combinedText.toLowerCase().replace(/\s+/g, ' ');

    let searchStart = 0;

    for (const timing of wordTimings) {
        const word = timing.word.toLowerCase().trim();
        if (!word) continue;

        // Find this word in the combined text
        let foundIndex = normalizedCombined.indexOf(word, searchStart);

        // If not found from searchStart, try from beginning (handles some edge cases)
        if (foundIndex === -1) {
            foundIndex = normalizedCombined.indexOf(word);
        }

        if (foundIndex === -1) {
            // Word not found in DOM - skip it
            continue;
        }

        const wordEnd = foundIndex + word.length;
        searchStart = wordEnd; // Move search forward

        // Find which text nodes contain this word
        const wordNodes: WordPosition['nodes'] = [];

        // Map normalized position back to original position
        // (This is approximate since we collapsed whitespace)
        let originalPos = 0;
        let normalizedPos = 0;

        for (let i = 0; i < combinedText.length && normalizedPos <= foundIndex; i++) {
            if (combinedText[i].match(/\s/)) {
                // Skip extra whitespace in original
                while (i + 1 < combinedText.length && combinedText[i + 1].match(/\s/)) {
                    i++;
                    originalPos++;
                }
            }
            if (normalizedPos === foundIndex) {
                originalPos = i;
                break;
            }
            originalPos++;
            normalizedPos++;
        }

        const originalStart = originalPos;
        const originalEnd = originalStart + timing.word.length;

        for (const nm of nodeMap) {
            // Check if this node overlaps with the word position
            if (nm.globalEnd <= originalStart || nm.globalStart >= originalEnd) {
                continue; // No overlap
            }

            // Calculate offsets within this node
            const nodeStart = Math.max(0, originalStart - nm.globalStart);
            const nodeEnd = Math.min(nm.node.textContent!.length, originalEnd - nm.globalStart);

            if (nodeEnd > nodeStart) {
                wordNodes.push({
                    node: nm.node,
                    startOffset: nodeStart,
                    endOffset: nodeEnd
                });
            }
        }

        if (wordNodes.length > 0) {
            positions.push({
                word: timing.word,
                nodes: wordNodes
            });
        }
    }

    return positions;
}

/**
 * Create highlights using CSS Custom Highlight API
 */
function createHighlightsAPI(
    wordPositions: WordPosition[],
    currentIndex: number
): void {
    if (!supportsHighlightAPI) return;

    // Clear existing highlights
    (CSS as any).highlights.delete(HIGHLIGHT_CURRENT);
    (CSS as any).highlights.delete(HIGHLIGHT_SPOKEN);

    if (currentIndex < 0 || wordPositions.length === 0) return;

    const spokenRanges: Range[] = [];
    const currentRanges: Range[] = [];

    for (let i = 0; i <= currentIndex && i < wordPositions.length; i++) {
        const pos = wordPositions[i];

        for (const nodeInfo of pos.nodes) {
            try {
                const range = document.createRange();
                range.setStart(nodeInfo.node, nodeInfo.startOffset);
                range.setEnd(nodeInfo.node, nodeInfo.endOffset);

                if (i === currentIndex) {
                    currentRanges.push(range);
                } else {
                    spokenRanges.push(range);
                }
            } catch (e) {
                // Range creation can fail if offsets are invalid
                console.warn('[TTS Highlight] Range creation failed:', e);
            }
        }
    }

    // Create highlight objects
    if (spokenRanges.length > 0) {
        (CSS as any).highlights.set(HIGHLIGHT_SPOKEN, new (window as any).Highlight(...spokenRanges));
    }
    if (currentRanges.length > 0) {
        (CSS as any).highlights.set(HIGHLIGHT_CURRENT, new (window as any).Highlight(...currentRanges));
    }
}

/**
 * Clear all TTS highlights
 */
export function clearTTSHighlights(): void {
    if (supportsHighlightAPI) {
        (CSS as any).highlights.delete(HIGHLIGHT_CURRENT);
        (CSS as any).highlights.delete(HIGHLIGHT_SPOKEN);
    }

    // Also clear any fallback highlights
    document.querySelectorAll('.tts-word-highlight').forEach(el => {
        el.classList.remove('tts-word-current', 'tts-word-spoken');
    });
}

/**
 * TTS Highlighter class - manages highlighting for a specific element
 */
export class TTSHighlighter {
    private element: HTMLElement;
    private wordPositions: WordPosition[] = [];
    private currentIndex: number = -1;
    private useFallback: boolean = false;
    private fallbackSpans: HTMLSpanElement[] = [];

    constructor(element: HTMLElement, wordTimings: WordTiming[]) {
        this.element = element;
        this.useFallback = !supportsHighlightAPI;

        // Map words to DOM positions
        this.wordPositions = mapWordsToDOM(element, wordTimings);

        console.log(`[TTS Highlight] Mapped ${this.wordPositions.length}/${wordTimings.length} words to DOM`);
        console.log(`[TTS Highlight] Using ${this.useFallback ? 'fallback (spans)' : 'CSS Highlight API'}`);

        if (this.useFallback) {
            this.setupFallbackHighlighting();
        }
    }

    /**
     * Setup fallback highlighting by wrapping words in spans
     * This modifies DOM but preserves structure
     */
    private setupFallbackHighlighting(): void {
        // For fallback, we need to wrap each word in a span
        // This is more invasive but works everywhere

        // Process in reverse order to avoid offset issues
        const processedNodes = new Set<Text>();

        for (let i = this.wordPositions.length - 1; i >= 0; i--) {
            const pos = this.wordPositions[i];

            for (const nodeInfo of pos.nodes) {
                if (processedNodes.has(nodeInfo.node)) continue;

                try {
                    const range = document.createRange();
                    range.setStart(nodeInfo.node, nodeInfo.startOffset);
                    range.setEnd(nodeInfo.node, nodeInfo.endOffset);

                    const span = document.createElement('span');
                    span.className = 'tts-word-highlight';
                    span.dataset.wordIndex = String(i);

                    range.surroundContents(span);
                    this.fallbackSpans.push(span);
                } catch (e) {
                    // surroundContents can fail if range crosses element boundaries
                    console.warn('[TTS Highlight] Fallback wrap failed:', e);
                }
            }
        }

        // Reverse to get correct order
        this.fallbackSpans.reverse();
    }

    /**
     * Update highlight to show current word
     */
    highlightWord(index: number): void {
        if (index === this.currentIndex) return;
        this.currentIndex = index;

        if (this.useFallback) {
            // Update fallback spans
            this.fallbackSpans.forEach((span, i) => {
                span.classList.remove('tts-word-current', 'tts-word-spoken');
                if (i === index) {
                    span.classList.add('tts-word-current');
                } else if (i < index) {
                    span.classList.add('tts-word-spoken');
                }
            });
        } else {
            // Use CSS Highlight API
            createHighlightsAPI(this.wordPositions, index);
        }
    }

    /**
     * Clean up highlights
     */
    cleanup(): void {
        this.currentIndex = -1;

        if (this.useFallback) {
            // Remove fallback spans, restore original text
            this.fallbackSpans.forEach(span => {
                const parent = span.parentNode;
                if (parent) {
                    while (span.firstChild) {
                        parent.insertBefore(span.firstChild, span);
                    }
                    parent.removeChild(span);
                }
            });
            this.fallbackSpans = [];
        } else {
            clearTTSHighlights();
        }
    }

    /**
     * Get the number of mapped words
     */
    get wordCount(): number {
        return this.wordPositions.length;
    }
}

/**
 * CSS styles for TTS highlighting
 * These need to be injected into the document
 */
export const TTS_HIGHLIGHT_STYLES = `
/* CSS Custom Highlight API styles */
::highlight(${HIGHLIGHT_CURRENT}) {
    background-color: rgba(59, 130, 246, 0.25);
    color: inherit;
}

::highlight(${HIGHLIGHT_SPOKEN}) {
    color: #94a3b8;
}

/* Fallback styles for browsers without Highlight API */
.tts-word-highlight {
    transition: background-color 0.1s ease, color 0.1s ease;
}

.tts-word-highlight.tts-word-current {
    background-color: rgba(59, 130, 246, 0.25);
    border-radius: 2px;
}

.tts-word-highlight.tts-word-spoken {
    color: #94a3b8;
}
`;

/**
 * Inject TTS highlight styles into document
 */
export function injectTTSHighlightStyles(): void {
    if (document.getElementById('tts-highlight-styles')) return;

    const style = document.createElement('style');
    style.id = 'tts-highlight-styles';
    style.textContent = TTS_HIGHLIGHT_STYLES;
    document.head.appendChild(style);
}

// Auto-inject styles when module loads
if (typeof document !== 'undefined') {
    injectTTSHighlightStyles();
}
