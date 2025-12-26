/**
 * MessageList - Renders the list of chat messages
 */

import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Message } from '../../types';
import { ShimmerText } from '../atoms/ShimmerText';
import { AIMessageBubble } from '../molecules/AIMessageBubble';
import { UserMessageBubble } from '../molecules/UserMessageBubble';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    onCopy: (id: string) => void;
    onRetry: (id: string) => void;
    onDelete: (id: string) => void;
    copiedId: string | null;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    setMenuPosition: (pos: { x: number; y: number } | null) => void;
    menuButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
    // Edit state
    editingMessageId: string | null;
    editingContent: string;
    setEditingContent: (content: string) => void;
    onStartEdit: (id: string) => void;
    onCancelEdit: () => void;
    onSubmitEdit: (id: string, content: string) => void;
}

// Memoized message item to prevent re-renders of unchanged messages
const MessageItem = memo(({
    msg,
    isLast,
    isLoading,
    onCopy,
    onRetry,
    onDelete,
    copiedId,
    openMenuId,
    setOpenMenuId,
    setMenuPosition,
    menuButtonRefs,
    editingMessageId,
    editingContent,
    setEditingContent,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
}: {
    msg: Message;
    isLast: boolean;
    isLoading: boolean;
    onCopy: (id: string) => void;
    onRetry: (id: string) => void;
    onDelete: (id: string) => void;
    copiedId: string | null;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    setMenuPosition: (pos: { x: number; y: number } | null) => void;
    menuButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
    editingMessageId: string | null;
    editingContent: string;
    setEditingContent: (content: string) => void;
    onStartEdit: (id: string) => void;
    onCancelEdit: () => void;
    onSubmitEdit: (id: string, content: string) => void;
}) => {
    const isStreaming = isLast && isLoading && msg.role === 'model';
    const isMenuOpen = openMenuId === msg.id;
    const isCopied = copiedId === msg.id;

    // Stable ref callback
    const setMenuButtonRef = useCallback((el: HTMLButtonElement | null) => {
        menuButtonRefs.current[msg.id] = el;
    }, [msg.id, menuButtonRefs]);

    return (
        <div
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ contain: 'layout style' }}
        >
            <div className={`flex max-w-[98%] md:max-w-[95%] gap-2 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse px-3' : 'flex-row px-1 md:px-3'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative ${msg.role === 'user' ? 'bg-slate-200 overflow-hidden shadow-sm' : 'bg-transparent border-transparent shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3),0_8px_10px_-6px_rgba(0,0,0,0.2)]'}`}>
                    {msg.role === 'user' ? (
                        <User size={14} className="text-slate-500" />
                    ) : (
                        <img
                            src={new URL('../atoms/branding/orb.png', import.meta.url).href}
                            alt="AI"
                            className="absolute -top-1 inset-0 w-full h-full object-cover"
                            style={{ transform: 'scale(2.05)' }}
                        />
                    )}
                </div>

                {/* Message Bubble */}
                {msg.role === 'user' ? (
                    <UserMessageBubble
                        message={msg}
                        isLoading={isLoading}
                        onStartEdit={onStartEdit}
                        onCancelEdit={onCancelEdit}
                        onSubmitEdit={onSubmitEdit}
                        editingMessageId={editingMessageId}
                        editingContent={editingContent}
                        setEditingContent={setEditingContent}
                    />
                ) : (
                    <AIMessageBubble
                        message={msg}
                        isStreaming={isStreaming}
                        isLastMessage={isLast}
                        onCopy={onCopy}
                        onRetry={onRetry}
                        onDelete={onDelete}
                        isCopied={isCopied}
                        isMenuOpen={isMenuOpen}
                        setOpenMenuId={setOpenMenuId}
                        setMenuPosition={setMenuPosition}
                        menuButtonRef={setMenuButtonRef}
                    />
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - compare message properties individually to avoid reference issues
    // This prevents full re-mount when only content changes (critical for flowtoken streaming)
    const prevMsg = prevProps.msg;
    const nextMsg = nextProps.msg;

    return (
        prevMsg.id === nextMsg.id &&
        prevMsg.content === nextMsg.content &&
        prevMsg.thinking === nextMsg.thinking &&
        prevMsg.isThinking === nextMsg.isThinking &&
        prevMsg.isError === nextMsg.isError &&
        prevMsg.planningText === nextMsg.planningText &&
        prevMsg.toolCalls === nextMsg.toolCalls &&
        prevProps.isLast === nextProps.isLast &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.copiedId === nextProps.copiedId &&
        prevProps.openMenuId === nextProps.openMenuId &&
        prevProps.editingMessageId === nextProps.editingMessageId &&
        prevProps.editingContent === nextProps.editingContent
    );
});

MessageItem.displayName = 'MessageItem';

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    isLoading,
    onCopy,
    onRetry,
    onDelete,
    copiedId,
    openMenuId,
    setOpenMenuId,
    setMenuPosition,
    menuButtonRefs,
    editingMessageId,
    editingContent,
    setEditingContent,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
}) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const shouldRenderMath = useMemo(() => {
        for (const m of messages) {
            if (m.content && (m.content.includes('$') || m.content.includes('\\(') || m.content.includes('\\['))) {
                return true;
            }
        }
        return false;
    }, [messages]);

    // Auto-scroll logic - use RAF for smoother scrolling
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            requestAnimationFrame(() => {
                if (behavior === 'smooth') {
                    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                } else {
                    container.scrollTop = container.scrollHeight;
                }
            });
        }
    }, []);

    // Debounced scroll during streaming to prevent jank
    const lastScrollRef = useRef<number>(0);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            
            // If we are editing, don't trigger auto-scroll to bottom on content changes
            if (editingMessageId) return;

            if (lastMessage.role === 'user') {
                scrollToBottom('smooth');
            } else if (messagesContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
                if (isNearBottom) {
                    // Throttle scroll updates during streaming to reduce jank
                    const now = Date.now();
                    if (now - lastScrollRef.current > 100) {
                        lastScrollRef.current = now;
                        scrollToBottom('auto');
                    }
                }
            }
        }
    }, [messages.length, messages[messages.length - 1]?.content.length, scrollToBottom, editingMessageId]);

    // KaTeX rendering
    useEffect(() => {
        if (!shouldRenderMath) return;
        if (!isLoading && messages.length > 0 && messagesContainerRef.current) {
            const renderMath = () => {
                if ((window as any).renderMathInElement) {
                    (window as any).renderMathInElement(messagesContainerRef.current, {
                        delimiters: [
                            { left: '$', right: '$', display: true },
                            { left: '$$', right: '$$', display: false },
                            { left: '\\[', right: '\\]', display: true },
                            { left: '\\(', right: '\\)', display: false }
                        ],
                        throwOnError: false,
                        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
                    });
                }
            };
            const timer = setTimeout(renderMath, 150);
            return () => clearTimeout(timer);
        }
    }, [isLoading, messages, shouldRenderMath]);

    return (
        <motion.div
            ref={messagesContainerRef}
            onScroll={() => {
                if (openMenuId) {
                    setOpenMenuId(null);
                    setMenuPosition(null);
                }
            }}
            initial={{ opacity: 0, y: 60, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
                filter: { duration: 0.6, delay: 0.3 }
            }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden pt-16 pb-44 md:pt-20 md:pb-40 custom-scrollbar overscroll-contain"
            style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                contain: 'layout style paint',
            }}
        >
            <div className="w-full max-w-5xl mx-auto px-1 md:px-8 space-y-8 md:space-y-12 min-h-full flex flex-col justify-end">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, index) => {
                        const isLast = index === messages.length - 1;

                        // Skip rendering empty AI messages if no thinking/isThinking/toolCalls
                        if (msg.role === 'model' && !msg.content && !msg.thinking && !msg.isThinking && !msg.toolCalls?.length && isLoading) {
                            return null;
                        }

                        return (
                            <div key={msg.id}>
                                <MessageItem
                                    msg={msg}
                                    isLast={isLast}
                                    isLoading={isLoading}
                                    onCopy={onCopy}
                                    onRetry={onRetry}
                                    onDelete={onDelete}
                                    copiedId={copiedId}
                                    openMenuId={openMenuId}
                                    setOpenMenuId={setOpenMenuId}
                                    setMenuPosition={setMenuPosition}
                                    menuButtonRefs={menuButtonRefs}
                                    editingMessageId={editingMessageId}
                                    editingContent={editingContent}
                                    setEditingContent={setEditingContent}
                                    onStartEdit={onStartEdit}
                                    onCancelEdit={onCancelEdit}
                                    onSubmitEdit={onSubmitEdit}
                                />
                            </div>
                        );
                    })}
                </AnimatePresence>

                {/* Loading shimmer */}
                {isLoading && messages[messages.length - 1]?.role === 'model' &&
                    !messages[messages.length - 1]?.content &&
                    !messages[messages.length - 1]?.thinking &&
                    !messages[messages.length - 1]?.isThinking &&
                    !messages[messages.length - 1]?.toolCalls?.length && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, filter: 'blur(16px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                                filter: { duration: 0.5 }
                            }}
                            className="flex justify-start"
                        >
                            <div className="flex max-w-[98%] md:max-w-[95%] gap-3 md:gap-4 pl-3 pr-1 md:px-3 flex-row">
                                <div className="w-10 h-10 rounded-full bg-transparent border-transparent flex items-center justify-center flex-shrink-0 mt-1 relative shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3),0_8px_10px_-6px_rgba(0,0,0,0.2)]">
                                    <img
                                        src={new URL('../atoms/branding/orb.png', import.meta.url).href}
                                        alt="AI"
                                        className="absolute -top-1 inset-0 w-full h-full object-cover"
                                        style={{ transform: 'scale(2.05)' }}
                                    />
                                </div>
                                <div className="flex flex-col chat-message-ai-container">
                                    <div className="chat-message-ai text-slate-700">
                                        <ShimmerText rotating className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                <div ref={messagesEndRef} className="h-0" />
            </div>
        </motion.div>
    );
};

export default MessageList;
