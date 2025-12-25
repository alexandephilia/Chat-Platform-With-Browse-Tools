/**
 * AIMessageBubble - Renders an AI message with thinking, tool calls, and actions
 */

import { AnimatedMarkdown } from 'flowtoken';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    initAudioForMobile,
    isAudioPlaying,
    isElevenLabsConfigured,
    playAudioWithHighlighting,
    stopAudio,
    textToSpeechWithTimestamps
} from '../../services/elevenLabsService';
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

// Memoized model indicator
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
                style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.12), 0 0.5px 0.5px rgba(0,0,0,0.08)' }}
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
 * Stable wrapper for AnimatedMarkdown
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
    const hasStreamedRef = useRef(false);
    const [animationEnabled, setAnimationEnabled] = useState(isStreaming);

    useEffect(() => {
        if (isStreaming) {
            hasStreamedRef.current = true;
            setAnimationEnabled(true);
        }
    }, [isStreaming]);

    useEffect(() => {
        if (!isStreaming && hasStreamedRef.current) {
            const timer = setTimeout(() => setAnimationEnabled(false), 900);
            return () => clearTimeout(timer);
        }
    }, [isStreaming]);

    const customComponents = useMemo(() => ({
        table: ({ children, animateText, ...props }: any) => (
            <div className="table-wrapper" style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table {...props}>{children}</table>
            </div>
        ),
        blockquote: ({ children, animateText, ...props }: any) => (
            <blockquote {...props}>{animateText ? animateText(children) : children}</blockquote>
        ),
        thead: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
        tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
        tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
        td: ({ children, animateText, ...props }: any) => <td {...props}>{animateText ? animateText(children) : children}</td>,
        th: ({ children, animateText, ...props }: any) => <th {...props}>{animateText ? animateText(children) : children}</th>,
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
}, (prevProps, nextProps) => (
    prevProps.content === nextProps.content &&
    prevProps.messageId === nextProps.messageId &&
    prevProps.isStreaming === nextProps.isStreaming
));

/**
 * Highlighted text component - shows words with karaoke-style highlighting
 * This overlays on top of the rendered markdown during TTS playback
 */
const HighlightedTextOverlay = memo(({
    words,
    currentWordIndex
}: {
    words: string[];
    currentWordIndex: number;
}) => {
    return (
        <div className="tts-highlight-overlay">
            {words.map((word, index) => (
                <span
                    key={index}
                    className={`tts-word ${index === currentWordIndex
                        ? 'tts-word-active'
                        : index < currentWordIndex
                            ? 'tts-word-spoken'
                            : ''
                        }`}
                >
                    {word}{' '}
                </span>
            ))}
        </div>
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
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [ttsWords, setTtsWords] = useState<string[]>([]);
    const ttsEnabledRef = useRef(isElevenLabsConfigured());
    const touchHandledRef = useRef(false);

    // Handle TTS playback with REAL word-level timestamps
    const handleSpeak = useCallback(async () => {
        if (isLoadingTTS) return;

        if (isSpeaking) {
            stopAudio();
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setTtsWords([]);
            return;
        }

        if (isAudioPlaying()) {
            stopAudio();
        }

        await initAudioForMobile();
        setIsLoadingTTS(true);

        try {
            // Get audio with REAL word-level timestamps from ElevenLabs
            const { audioBlob, wordTimings, processedText } = await textToSpeechWithTimestamps(message.content);

            console.log(`[TTS] Got ${wordTimings.length} words with timestamps`);

            // If we got word timings, use them for precise highlighting
            if (wordTimings.length > 0) {
                const words = wordTimings.map(wt => wt.word);
                setTtsWords(words);
                setIsSpeaking(true);
                setCurrentWordIndex(0);

                // Play audio with synchronized highlighting using REAL timestamps
                const audio = await playAudioWithHighlighting(
                    audioBlob,
                    wordTimings,
                    (wordIndex: number) => {
                        setCurrentWordIndex(wordIndex);
                    }
                );

                audio.onended = () => {
                    setIsSpeaking(false);
                    setCurrentWordIndex(-1);
                    setTtsWords([]);
                };

                audio.onerror = () => {
                    setIsSpeaking(false);
                    setCurrentWordIndex(-1);
                    setTtsWords([]);
                };
            } else {
                // Fallback: estimate word timing based on audio duration
                console.log('[TTS] No timestamps, using estimated timing');
                const words = processedText.split(/\s+/).filter(w => w.length > 0);
                setTtsWords(words);
                setIsSpeaking(true);

                // Create URL and play
                const url = URL.createObjectURL(audioBlob);
                const audio = new Audio(url);
                audio.preload = 'auto';

                const startHighlighting = () => {
                    const duration = audio.duration;
                    if (!duration) return;
                    const wordsPerSecond = words.length / duration;

                    const interval = setInterval(() => {
                        if (audio.paused || audio.ended) {
                            clearInterval(interval);
                            return;
                        }
                        const idx = Math.floor(audio.currentTime * wordsPerSecond);
                        setCurrentWordIndex(Math.min(idx, words.length - 1));
                    }, 80);

                    audio.onended = () => {
                        clearInterval(interval);
                        URL.revokeObjectURL(url);
                        setIsSpeaking(false);
                        setCurrentWordIndex(-1);
                        setTtsWords([]);
                    };
                };

                if (audio.duration) {
                    startHighlighting();
                } else {
                    audio.addEventListener('loadedmetadata', startHighlighting, { once: true });
                }

                await audio.play();
            }
        } catch (error) {
            console.error('[TTS] Error:', error);
            setIsSpeaking(false);
            setCurrentWordIndex(-1);
            setTtsWords([]);
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
            {hasThinking && (
                <ThinkingBlock
                    thinking={message.thinking || ''}
                    isThinking={message.isThinking}
                    hasRunningTools={hasRunningTools}
                />
            )}

            {hasToolCalls && (
                <SearchTimeline
                    toolCalls={message.toolCalls!}
                    isStreaming={isStreaming}
                    planningText={message.planningText}
                    hasResponseContent={!!message.content}
                />
            )}

            {/* Message Content with TTS Highlighting */}
            <div className="chat-message-ai text-slate-700 relative" data-message-id={message.id}>
                {/* Show highlighted text overlay when speaking */}
                {isSpeaking && ttsWords.length > 0 ? (
                    <HighlightedTextOverlay
                        words={ttsWords}
                        currentWordIndex={currentWordIndex}
                    />
                ) : (
                    <StableAnimatedContent
                        content={message.content}
                        messageId={message.id}
                        isStreaming={isStreaming}
                    />
                )}
            </div>

            {/* Action buttons */}
            {!isStreaming && (message.content || message.isError) && (
                <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-0.5">
                        {message.content && !message.isError && (
                            <button
                                {...createTapHandler(() => onCopy(message.id))}
                                className={`p-1.5 rounded-md transition-colors touch-manipulation ${isCopied ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                                title={isCopied ? "Copied!" : "Copy message"}
                            >
                                <CopyLinear className="w-4 h-4" />
                            </button>
                        )}
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

                    <div className="flex items-center gap-1">
                        {message.modelId && <ModelIndicator modelId={message.modelId} />}
                        <div className="relative">
                            <button
                                ref={menuButtonRef}
                                {...createTapHandler(() => {
                                    if (isMenuOpen) {
                                        setOpenMenuId(null);
                                        setMenuPosition(null);
                                    } else {
                                        const btn = document.querySelector(`[data-message-id="${message.id}"]`)?.parentElement?.querySelector('[title="More options"]');
                                        if (btn) {
                                            const rect = btn.getBoundingClientRect();
                                            const viewportHeight = window.innerHeight;
                                            const menuHeight = 40;
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
