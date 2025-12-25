import { AnimatedMarkdown } from 'flowtoken';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, ChevronDown } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';

interface ThinkingBlockProps {
    thinking: string;
    isThinking?: boolean;
    hasRunningTools?: boolean; // New prop to track if tools are still running
}

/**
 * Stable wrapper for thinking content animation
 * Prevents remounting when isThinking changes
 */
const StableThinkingContent = memo(({
    content,
    isThinking
}: {
    content: string;
    isThinking: boolean;
}) => {
    const hasStreamedRef = useRef(false);
    const [animationEnabled, setAnimationEnabled] = useState(isThinking);

    useEffect(() => {
        if (isThinking) {
            hasStreamedRef.current = true;
            setAnimationEnabled(true);
        }
    }, [isThinking]);

    useEffect(() => {
        if (!isThinking && hasStreamedRef.current) {
            const timer = setTimeout(() => {
                setAnimationEnabled(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isThinking]);

    return (
        <AnimatedMarkdown
            content={content}
            sep="diff"
            animation={animationEnabled ? "fadeIn" : null}
            animationDuration="0.4s"
            animationTimingFunction="ease-out"
        />
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.content === nextProps.content &&
        prevProps.isThinking === nextProps.isThinking
    );
});

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ thinking, isThinking = false, hasRunningTools = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [dynamicStatus, setDynamicStatus] = useState('Thinking...');
    const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const statuses = [
        'Analyzing request...',
        'Consulting neural patterns...',
        'Expanding multi-perspective loops...',
        'Cross-referencing context...',
        'Synthesizing insights...',
        'Refining reasoning path...',
        'Deep thinking...'
    ];

    // Determine if we're still "working" (thinking OR tools running)
    const isWorking = isThinking || hasRunningTools;

    useEffect(() => {
        if (!isWorking) {
            setDynamicStatus('Reasoning');
            // Only auto-collapse once when ALL work is done (thinking + tools)
            if (!hasAutoCollapsed) {
                const timer = setTimeout(() => {
                    setIsExpanded(false);
                    setHasAutoCollapsed(true);
                }, 1200); // Slightly longer delay to let user see completion
                return () => clearTimeout(timer);
            }
        } else {
            // Reset auto-collapse flag when work starts again
            setHasAutoCollapsed(false);
        }

        if (!isThinking) return;

        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % statuses.length;
            setDynamicStatus(statuses[index]);
        }, 3000);

        return () => clearInterval(interval);
    }, [isWorking, isThinking, hasAutoCollapsed]);

    // Auto-scroll to bottom of reasoning as it generates
    useEffect(() => {
        if (isThinking && isExpanded && scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [thinking, isThinking, isExpanded]);

    if (!thinking && !isThinking) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 w-full max-w-[95%] lg:max-w-[85%]"
        >
            {/* Scoped styles for thinking markdown */}
            <style>{`
                .thinking-markdown {
                    font-size: 11px !important;
                    line-height: 1.6 !important;
                    color: #64748b !important;
                }
                .thinking-markdown p { margin: 0 0 0.75rem 0 !important; }
                .thinking-markdown p:last-child { margin-bottom: 0 !important; }
                .thinking-markdown strong { font-weight: 600 !important; color: #475569 !important; }
                .thinking-markdown code {
                    font-size: 10px !important;
                    background: rgba(148, 163, 184, 0.1) !important;
                    padding: 0.1rem 0.3rem !important;
                    border-radius: 4px !important;
                }
            `}</style>

            {/* Header - Persistent Inset Depth */}
            <button
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2.5 px-3 py-1.5 transition-all duration-150 group relative z-10"
                style={{
                    background: isWorking ? 'rgba(241, 245, 249, 0.4)' : 'rgba(239, 246, 255, 0.4)',
                    borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
                    border: isWorking ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(191, 219, 254, 0.4)',
                    boxShadow: isPressed
                        ? 'rgb(0 0 0 / 34%) 0px 2px 4px inset, rgba(0, 0, 0, 0.04) 0px 1px 1px inset, rgba(255, 255, 255, 0.21) 0px 1px 0px'
                        : 'inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
                    width: 'fit-content',
                    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                }}
            >
                <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full ${isThinking ? 'bg-indigo-50' : isWorking ? 'bg-slate-50' : 'bg-blue-50'}`}
                    style={{
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06), inset 0 -1px 1px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8)'
                    }}
                >
                    <Brain className={`w-3 h-3 ${isThinking ? 'text-indigo-500 animate-pulse' : isWorking ? 'text-slate-400' : 'text-blue-500'}`} />
                </div>
                <span className={`text-[11px] font-semibold tracking-tight transition-all duration-500 ${isWorking ? 'text-slate-600' : 'text-blue-700'}`}>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={dynamicStatus}
                            initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {dynamicStatus}
                        </motion.span>
                    </AnimatePresence>
                </span>
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isWorking ? 'text-slate-400' : 'text-blue-500'} ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Content Container - No inset shadow, just subtle border */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                        exit={{ height: 0, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div
                            className="p-4 text-xs relative"
                            style={{
                                background: isWorking ? 'rgba(241, 245, 249, 0.3)' : 'rgba(239, 246, 255, 0.3)',
                                borderRadius: '0 18px 18px 18px',
                                border: isWorking ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(191, 219, 254, 0.4)',
                                borderTop: 'none',
                                marginTop: '-1px'
                            }}
                        >
                            <div
                                ref={scrollRef}
                                className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pt-3 pb-3"
                                style={{
                                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)',
                                    maskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)'
                                }}
                            >
                                {thinking ? (
                                    <div className="thinking-markdown">
                                        <StableThinkingContent
                                            content={thinking}
                                            isThinking={isThinking}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 py-1">
                                        <span className="text-slate-400 italic font-medium tracking-tight">Accessing neural patterns...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ThinkingBlock;
