/**
 * AIMessageBubble - Renders an AI message with thinking, tool calls, and actions
 */

import { AnimatedMarkdown } from 'flowtoken';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Message } from '../../types';
import { CopyLinear, MoreDotsLinear, RefreshSquareLinear } from '../atoms/Icons';
import { LazyImage } from '../atoms/LazyImage';
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

// Memoized model indicator to prevent re-renders
const ModelIndicator = memo(({ modelId }: { modelId: string }) => {
    const model = useMemo(() => AVAILABLE_MODELS.find(m => m.id === modelId), [modelId]);
    if (!model) return null;

    return (
        <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/40 border border-slate-200/40"
        >
            <div className="w-4 h-4 rounded-md flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-200">
                <LazyImage
                    src={model.icon}
                    alt=""
                    className="w-3 h-3 object-contain"
                    width={12}
                    height={12}
                />
            </div>
            <span className="text-[9px] text-slate-500 font-semibold tracking-tight">
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
            animationDuration="0.6s"
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

    // Track touch events to prevent double-firing on mobile
    const touchHandledRef = useRef(false);

    // Create tap handler for mobile-friendly button interactions
    const createTapHandler = useCallback((handler: () => void) => ({
        onClick: (e: React.MouseEvent) => {
            if (touchHandledRef.current) {
                touchHandledRef.current = false;
                return;
            }
            e.preventDefault();
            handler();
        },
        onTouchEnd: (e: React.TouchEvent) => {
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
            <div className="chat-message-ai text-slate-700" data-message-id={message.id}>
                <StableAnimatedContent
                    content={message.content}
                    messageId={message.id}
                    isStreaming={isStreaming}
                />
            </div>

            {/* Action buttons - show when not streaming AND (has content OR is error) */}
            {!isStreaming && (message.content || message.isError) && (
                <div className="flex items-center justify-between mt-1.5">
                    {/* Left side: Copy & Retry */}
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
