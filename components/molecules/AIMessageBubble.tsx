/**
 * AIMessageBubble - Renders an AI message with thinking, tool calls, and actions
 */

import { AnimatedMarkdown } from 'flowtoken';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initAudioForMobile, isAudioPlaying, isElevenLabsConfigured, playAudio, stopAudio, textToSpeech } from '../../services/elevenLabsService';
import { ModelIcon } from '../../services/modelIcons';
import { Message } from '../../types';
import { CopyLinear, MoreDotsLinear, RefreshSquareLinear, StopCircleLinear, VolumeHighLinear } from '../atoms/Icons';
import { SearchTimeline } from '../atoms/SearchTimeline';
import { ThinkingBlock } from '../atoms/ThinkingBlock';
import { AVAILABLE_MODELS } from '../molecules/ModelPicker';

interface AIMessageBubbleProps {
    message: Message;
    isStreaming: boolean;
    isLastMessage: boolean;
    onCopy: (id: string) => void;
    onRetry: (id: string) => void;
    onDelete: (id: string) => void;
    isCopied: boolean;
    isMenuOpen: boolean;
    setOpenMenuId: (id: string | null) => void;
    setMenuPosition: (pos: { x: number; y: number } | null) => void;
    menuButtonRef: (el: HTMLButtonElement | null) => void;
}

// Memoized model indicator to prevent re-renders - skeuomorphic inset style
const ModelIndicator = memo(({ modelId }: { modelId: string }) => {
    const model = useMemo(() => AVAILABLE_MODELS.find(m => m.id === modelId), [modelId]);
    if (!model) return null;

    return (
        <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-b from-white to-slate-100/50 border border-slate-300/50"
            style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 1px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.7)'
            }}
        >
            <div
                className="w-5 h-5 rounded-md flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50 border border-white/80"
                style={{
                    boxShadow: '0 1px 1px rgba(0,0,0,0.12), 0 0.5px 0.5px rgba(0,0,0,0.08)'
                }}
            >
                <ModelIcon iconKey={model.icon} size={18} />
            </div>
            <span className="text-[9px] text-slate-600 font-semibold tracking-tight drop-shadow-[0_2px_0_rgba(255,255,255,0.5)]">
                {model.name}
            </span>
        </div>
    );
});

/**
 * Stable wrapper for AnimatedMarkdown that prevents remounting during streaming
 * The key insight: flowtoken's diff mode uses useRef internally to track previous content.
 * When animation prop changes, it recreates internal components causing refs to reset.
 * This wrapper keeps animation stable and only disables it after streaming completes.
 */
const StableAnimatedContent = memo(({
    content,
    messageId,
    isStreaming
}: {
    content: string;
    messageId: string;
    isStreaming: boolean;
}) => {
    // Track if this message has ever been in streaming mode
    const hasStreamedRef = useRef(false);
    // Track if streaming just ended (to disable animation after a delay)
    const [animationEnabled, setAnimationEnabled] = useState(isStreaming);

    // When streaming starts, enable animation
    useEffect(() => {
        if (isStreaming) {
            hasStreamedRef.current = true;
            setAnimationEnabled(true);
        }
    }, [isStreaming]);

    // When streaming ends, disable animation after content settles
    // Use longer delay to ensure all animations complete (animation duration is 0.85s)
    useEffect(() => {
        if (!isStreaming && hasStreamedRef.current) {
            // Wait for animation to fully complete before disabling
            // This prevents visual "jump" when animation prop changes
            const timer = setTimeout(() => {
                setAnimationEnabled(false);
            }, 900); // Slightly longer than animationDuration (0.85s = 850ms)
            return () => clearTimeout(timer);
        }
    }, [isStreaming]);

    // Memoize customComponents to prevent recreation
    // These override flowtoken's default components to ensure proper animation
    const customComponents = useMemo(() => ({
        // Table wrapper for horizontal scrolling - fit content, don't stretch
        table: ({ children, animateText, ...props }: any) => (
            <div className="table-wrapper" style={{
                overflowX: 'auto',
                maxWidth: '100%',
                WebkitOverflowScrolling: 'touch'
            }}>
                <table {...props}>{children}</table>
            </div>
        ),
        // Blockquote - flowtoken doesn't have this by default!
        blockquote: ({ children, animateText, ...props }: any) => (
            <blockquote {...props}>
                {animateText ? animateText(children) : children}
            </blockquote>
        ),
        // Table structure elements - ensure proper rendering during streaming
        thead: ({ children, animateText, ...props }: any) => (
            <thead {...props}>{children}</thead>
        ),
        tbody: ({ children, animateText, ...props }: any) => (
            <tbody {...props}>{children}</tbody>
        ),
        tr: ({ children, animateText, ...props }: any) => (
            <tr {...props}>{children}</tr>
        ),
        // Table cells - ensure content is animated
        td: ({ children, animateText, ...props }: any) => (
            <td {...props}>
                {animateText ? animateText(children) : children}
            </td>
        ),
        th: ({ children, animateText, ...props }: any) => (
            <th {...props}>
                {animateText ? animateText(children) : children}
            </th>
        ),
    }), []);

    return (
        <AnimatedMarkdown
            content={content}
            sep="diff"
            animation={animationEnabled ? "blurAndSharpen" : null}
            animationDuration="1.8s"
            animationTimingFunction="ease-in-out"
            customComponents={customComponents}
        />
    );
}, (prevProps, nextProps) => {
    // Only re-render when content changes or streaming state changes
    return (
        prevProps.content === nextProps.content &&
        prevProps.messageId === nextProps.messageId &&
        prevProps.isStreaming === nextProps.isStreaming
    );
});

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = memo(({
    message,
    isStreaming,
    isLastMessage,
    onCopy,
    onRetry,
    onDelete,
    isCopied,
    isMenuOpen,
    setOpenMenuId,
    setMenuPosition,
    menuButtonRef,
}) => {
    const hasThinking = message.thinking || message.isThinking;
    const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
    const hasRunningTools = message.toolCalls?.some(tc => tc.status === 'pending' || tc.status === 'running');

    // TTS state
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoadingTTS, setIsLoadingTTS] = useState(false);
    const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
    const [displayWords, setDisplayWords] = useState<string[]>([]);
    const ttsEnabledRef = useRef(isElevenLabsConfigured());
    const highlightIntervalRef = useRef<number | null>(null);

    // Track touch events to prevent double-firing on mobile
    const touchHandledRef = useRef(false);

    // Handle TTS playback with highlighting
    const handleSpeak = useCallback(async () => {
        if (isLoadingTTS) return;

        // If already speaking, stop
        if (isSpeaking) {
            stopAudio();
            if (highlightIntervalRef.current) {
                clearInterval(highlightIntervalRef.current);
                highlightIntervalRef.current = null;
            }
            setIsSpeaking(false);
            setHighlightedWordIndex(-1);
            setDisplayWords([]);
            return;
        }

        // Check if another message is playing
        if (isAudioPlaying()) {
            stopAudio();
        }

        // Initialize audio context for mobile
        await initAudioForMobile();

        setIsLoadingTTS(true);
        try {
            // Get audio blob
            const audioBlob = await textToSpeech(message.content);

            // Parse words from the message content (strip markdown first)
            const plainText = message.content
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/`[^`]+`/g, '') // Remove inline code
                .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
                .replace(/\*([^*]+)\*/g, '$1') // Remove italic
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
                .replace(/^#{1,6}\s+/gm, '') // Remove headers
                .replace(/^[-*+]\s+/gm, '') // Remove list markers
                .trim();

            const words = plainText.split(/\s+/).filter(w => w.length > 0);
            setDisplayWords(words);

            // Play audio
            const audio = await playAudio(audioBlob);
            setIsSpeaking(true);

            // Estimate word timing based on audio duration
            const startHighlighting = () => {
                const duration = audio.duration;
                if (!duration || duration === 0) return;

                const wordsPerSecond = words.length / duration;

                highlightIntervalRef.current = window.setInterval(() => {
                    if (audio.paused || audio.ended) {
                        if (highlightIntervalRef.current) {
                            clearInterval(highlightIntervalRef.current);
                            highlightIntervalRef.current = null;
                        }
                        return;
                    }

                    const currentTime = audio.currentTime;
                    const estimatedWordIndex = Math.floor(currentTime * wordsPerSecond);
                    setHighlightedWordIndex(Math.min(estimatedWordIndex, words.length - 1));
                }, 80); // Update every 80ms for smooth highlighting
            };

            // Wait for duration to be available
            if (audio.duration && audio.duration > 0) {
                startHighlighting();
            } else {
                audio.addEventListener('loadedmetadata', startHighlighting, { once: true });
            }

            audio.onended = () => {
                if (highlightIntervalRef.current) {
                    clearInterval(highlightIntervalRef.current);
                    highlightIntervalRef.current = null;
                }
                setIsSpeaking(false);
                setHighlightedWordIndex(-1);
                setDisplayWords([]);
            };
            audio.onerror = () => {
                if (highlightIntervalRef.current) {
                    clearInterval(highlightIntervalRef.current);
                    highlightIntervalRef.current = null;
                }
                setIsSpeaking(false);
                setHighlightedWordIndex(-1);
                setDisplayWords([]);
            };
        } catch (error) {
            console.error('[TTS] Error:', error);
            setIsSpeaking(false);
            setHighlightedWordIndex(-1);
            setDisplayWords([]);
        } finally {
            setIsLoadingTTS(false);
        }
    }, [message.content, isSpeaking, isLoadingTTS]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSpeaking) {
                stopAudio();
            }
        };
    }, [isSpeaking]);

    // Create tap handler for mobile-friendly button interactions
    const createTapHandler = useCallback((handler: () => void, disabled?: boolean) => ({
        onClick: (e: React.MouseEvent) => {
            if (disabled) return;
            if (touchHandledRef.current) {
                touchHandledRef.current = false;
                return;
            }
            e.preventDefault();
            handler();
        },
        onTouchEnd: (e: React.TouchEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            touchHandledRef.current = true;
            handler();
            setTimeout(() => { touchHandledRef.current = false; }, 300);
        }
    }), []);

    return (
        <div className="flex flex-col chat-message-ai-container">
            {/* Thinking Block */}
            {hasThinking && (
                <ThinkingBlock
                    thinking={message.thinking || ''}
                    isThinking={message.isThinking}
                    hasRunningTools={hasRunningTools}
                />
            )}

            {/* Tool Calls Display */}
            {hasToolCalls && (
                <SearchTimeline
                    toolCalls={message.toolCalls!}
                    isStreaming={isStreaming}
                    planningText={message.planningText}
                    hasResponseContent={!!message.content}
                />
            )}

            {/* Message Content - Only animate if streaming */}
            <div className="chat-message-ai text-slate-700 relative" data-message-id={message.id}>
                {/* Show highlighted text overlay when speaking */}
                {isSpeaking && displayWords.length > 0 ? (
                    <div className="tts-highlighted-text leading-relaxed">
                        {displayWords.map((word, index) => (
                            <span
                                key={index}
                                className={`inline transition-colors duration-75 ${index === highlightedWordIndex
                                        ? 'bg-blue-100 text-blue-700 rounded px-0.5'
                                        : index < highlightedWordIndex
                                            ? 'text-slate-400'
                                            : 'text-slate-700'
                                    }`}
                            >
                                {word}{' '}
                            </span>
                        ))}
                    </div>
                ) : (
                    <StableAnimatedContent
                        content={message.content}
                        messageId={message.id}
                        isStreaming={isStreaming}
                    />
                )}
            </div>

            {/* Action buttons - show when not streaming AND (has content OR is error) */}
            {!isStreaming && (message.content || message.isError) && (
                <div className="flex items-center justify-between mt-1.5">
                    {/* Left side: Copy, Speak & Retry */}
                    <div className="flex items-center gap-0.5">
                        {/* Only show copy if there's actual content */}
                        {message.content && !message.isError && (
                            <button
                                {...createTapHandler(() => onCopy(message.id))}
                                className={`p-1.5 rounded-md transition-colors touch-manipulation ${isCopied ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                                title={isCopied ? "Copied!" : "Copy message"}
                            >
                                <CopyLinear className="w-4 h-4" />
                            </button>
                        )}
                        {/* TTS button - only show if configured and has content */}
                        {ttsEnabledRef.current && message.content && !message.isError && (
                            <button
                                {...createTapHandler(handleSpeak, isLoadingTTS)}
                                disabled={isLoadingTTS}
                                aria-disabled={isLoadingTTS}
                                className={`p-1.5 min-w-[28px] min-h-[28px] rounded-md transition-colors touch-manipulation select-none ${isLoadingTTS
                                    ? 'text-slate-300 cursor-wait pointer-events-none'
                                    : isSpeaking
                                        ? 'text-blue-500 bg-blue-50 active:bg-blue-100'
                                        : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 active:bg-blue-100'
                                    }`}
                                title={isLoadingTTS ? "Loading..." : isSpeaking ? "Stop speaking" : "Read aloud"}
                            >
                                {isLoadingTTS ? (
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : isSpeaking ? (
                                    <StopCircleLinear className="w-4 h-4" />
                                ) : (
                                    <VolumeHighLinear className="w-4 h-4" />
                                )}
                            </button>
                        )}
                        <button
                            {...createTapHandler(() => onRetry(message.id))}
                            className={`p-1.5 rounded-md transition-colors touch-manipulation ${message.isError ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                            title="Retry response"
                        >
                            <RefreshSquareLinear className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right side: Model indicator + More menu */}
                    <div className="flex items-center gap-1">
                        {message.modelId && <ModelIndicator modelId={message.modelId} />}

                        {/* More menu button */}
                        <div className="relative">
                            <button
                                ref={menuButtonRef}
                                {...createTapHandler(() => {
                                    if (isMenuOpen) {
                                        setOpenMenuId(null);
                                        setMenuPosition(null);
                                    } else {
                                        // Need to get rect in a different way for touch
                                        const btn = document.querySelector(`[data-message-id="${message.id}"]`)?.parentElement?.querySelector('[title="More options"]');
                                        if (btn) {
                                            const rect = btn.getBoundingClientRect();
                                            const viewportHeight = window.innerHeight;
                                            const menuHeight = 40; // Approximate menu height

                                            // Adjust position if menu would go beyond viewport
                                            let adjustedY = rect.bottom + 4;
                                            if (adjustedY + menuHeight > viewportHeight) {
                                                adjustedY = rect.top - menuHeight - 4;
                                            }

                                            setMenuPosition({ x: rect.right, y: adjustedY });
                                        }
                                        setOpenMenuId(message.id);
                                    }
                                })}
                                className={`p-1.5 rounded-md transition-colors touch-manipulation ${isMenuOpen ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                title="More options"
                            >
                                <MoreDotsLinear className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render when these change
    // Don't compare callback references - they're stable from parent
    // Compare toolCalls by length and status to avoid reference issues
    const prevToolCalls = prevProps.message.toolCalls;
    const nextToolCalls = nextProps.message.toolCalls;
    const toolCallsEqual =
        prevToolCalls?.length === nextToolCalls?.length &&
        prevToolCalls?.every((tc, i) =>
            tc.id === nextToolCalls?.[i]?.id &&
            tc.status === nextToolCalls?.[i]?.status
        );

    return (
        prevProps.message.id === nextProps.message.id &&
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.thinking === nextProps.message.thinking &&
        prevProps.message.isThinking === nextProps.message.isThinking &&
        prevProps.message.isError === nextProps.message.isError &&
        prevProps.message.planningText === nextProps.message.planningText &&
        toolCallsEqual &&
        prevProps.isStreaming === nextProps.isStreaming &&
        prevProps.isCopied === nextProps.isCopied &&
        prevProps.isMenuOpen === nextProps.isMenuOpen
    );
});

export default AIMessageBubble;
