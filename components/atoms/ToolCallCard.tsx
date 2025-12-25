import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, BookOpen, Building2, Check, Code, Globe, Loader2, Newspaper, Search, Twitter } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ToolCall, ToolCallStatus } from '../../types';

interface ToolCallCardProps {
    toolCall: ToolCall;
}

const statusConfig: Record<ToolCallStatus, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
    pending: {
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: 'Preparing',
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
    },
    running: {
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: 'Searching',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    completed: {
        icon: <Check className="w-3 h-3" />,
        label: 'Found',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
    },
    error: {
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Failed',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
    },
};

// Tool type configurations with icons and labels
const toolTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    'web_search': { icon: <Globe className="w-2.5 h-2.5" />, label: 'Web', color: 'text-blue-500' },
    'search_news': { icon: <Newspaper className="w-2.5 h-2.5" />, label: 'News', color: 'text-orange-500' },
    'search_research_papers': { icon: <BookOpen className="w-2.5 h-2.5" />, label: 'Research', color: 'text-purple-500' },
    'search_github': { icon: <Code className="w-2.5 h-2.5" />, label: 'GitHub', color: 'text-gray-700' },
    'search_company': { icon: <Building2 className="w-2.5 h-2.5" />, label: 'Company', color: 'text-emerald-500' },
    'search_tweets': { icon: <Twitter className="w-2.5 h-2.5" />, label: 'Twitter', color: 'text-sky-500' },
    'crawl_website': { icon: <Search className="w-2.5 h-2.5" />, label: 'Crawl', color: 'text-indigo-500' },
};

// Image Gallery Component - Shows images from search results
interface ImageGalleryProps {
    images: string[];
    maxImages?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, maxImages = 8 }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const displayImages = images
        .filter(img => img && !failedImages.has(img))
        .slice(0, maxImages);

    useEffect(() => {
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                setShowLeftFade(scrollLeft > 10);
                setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            el?.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [displayImages]);

    if (displayImages.length === 0) return null;

    return (
        <div className="relative mt-4 mb-2 w-full">
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 px-2 pt-1 custom-scrollbar-hide"
                style={{
                    WebkitOverflowScrolling: 'touch',
                    WebkitMaskImage: `linear-gradient(to right,
                    transparent 0%,
                    ${showLeftFade ? 'rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.3) 15px, rgba(0,0,0,0.7) 30px, black 60px' : 'black 0%'},
                    black calc(100% - ${showRightFade ? '60px' : '0px'}),
                    ${showRightFade ? 'rgba(0,0,0,0.7) calc(100% - 30px), rgba(0,0,0,0.3) calc(100% - 15px), rgba(0,0,0,0.05) calc(100% - 5px), transparent 100%' : 'black 100%'}
                )`,
                    maskImage: `linear-gradient(to right,
                    transparent 0%,
                    ${showLeftFade ? 'rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.3) 15px, rgba(0,0,0,0.7) 30px, black 60px' : 'black 0%'},
                    black calc(100% - ${showRightFade ? '60px' : '0px'}),
                    ${showRightFade ? 'rgba(0,0,0,0.7) calc(100% - 30px), rgba(0,0,0,0.3) calc(100% - 15px), rgba(0,0,0,0.05) calc(100% - 5px), transparent 100%' : 'black 100%'}
                )`
                }}
            >
                <AnimatePresence mode="popLayout">
                    {displayImages.map((img, index) => (
                        <motion.a
                            key={img}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{
                                opacity: loadedImages.has(img) ? 1 : 0.6,
                                y: 0,
                                scale: 1
                            }}
                            whileHover={{
                                scale: 1.05,
                                y: -4,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="relative shrink-0 rounded-[20px] overflow-hidden group cursor-zoom-in"
                            style={{
                                width: '220px',
                                height: '140px',
                                background: 'rgba(241, 245, 249, 0.4)',
                                border: '1px solid rgba(226, 232, 240, 0.5)',
                                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.8)',
                            }}
                        >
                            {/* Inset shadow for depth */}
                            <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] rounded-[20px]" />

                            {/* Skeleton Loading State */}
                            {!loadedImages.has(img) && (
                                <div className="absolute inset-0 z-0 bg-slate-50 flex items-center justify-center">
                                    <div className="w-full h-full bg-gradient-to-r from-slate-50 via-slate-100/50 to-slate-50 animate-shimmer bg-[length:200%_100%]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-slate-200 animate-spin" />
                                    </div>
                                </div>
                            )}

                            <img
                                src={img}
                                alt=""
                                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${loadedImages.has(img) ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
                                onLoad={() => setLoadedImages(prev => new Set(prev).add(img))}
                                onError={() => setFailedImages(prev => new Set(prev).add(img))}
                                loading="lazy"
                            />

                            {/* Hover gloss effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.a>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
    const status = statusConfig[toolCall.status];
    const isActive = toolCall.status === 'running' || toolCall.status === 'pending';

    // Get tool type config or default to web search
    const toolType = toolTypeConfig[toolCall.name] || toolTypeConfig['web_search'];

    // Extract search query or URL for display
    const displayText = toolCall.name === 'crawl_website'
        ? (toolCall.args?.url || toolCall.name)
        : (toolCall.args?.query || toolCall.name);
    const displayQuery = displayText.length > 18 ? displayText.slice(0, 18) + '...' : displayText;

    // Count sources including subpages
    let sourceCount = toolCall.result?.results?.length || 0;
    if (toolCall.result?.results) {
        toolCall.result.results.forEach((r: any) => {
            if (r.subpages) sourceCount += r.subpages.length;
        });
    }

    // Check if category is specified in args
    const category = toolCall.args?.category;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0 transition-all duration-200`}
            style={{
                background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(241, 245, 249, 0.4)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), inset 0 1px 1px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.8)',
                borderColor: isActive ? 'rgba(191, 219, 254, 0.5)' : 'rgba(226, 232, 240, 0.4)'
            }}
            title={`${toolType.label}: ${displayText}`}
        >
            {/* Tool Type Icon */}
            <div className={`flex items-center justify-center w-4 h-4 rounded ${status.bgColor}`}>
                <span className={toolType.color}>{toolType.icon}</span>
            </div>

            {/* Status with tool type label */}
            <span className={`text-[10px] font-medium ${status.color} whitespace-nowrap`}>
                {status.label}
            </span>
            <span className={status.color}>{status.icon}</span>

            {/* Query text */}
            <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                {displayQuery}
            </span>

            {/* Source count on completion */}
            {toolCall.status === 'completed' && sourceCount > 0 && (
                <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap pl-1 border-l border-slate-200">
                    {sourceCount}
                </span>
            )}
        </motion.div>
    );
};

// Container with horizontal scroll and fade effects
interface ToolCallsContainerProps {
    toolCalls: ToolCall[];
}

export const ToolCallsContainer: React.FC<ToolCallsContainerProps> = ({ toolCalls }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                setShowLeftFade(scrollLeft > 5);
                setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5);
            }
        };

        checkScroll();
        const el = scrollRef.current;
        el?.addEventListener('scroll', checkScroll);

        // Also check on resize
        window.addEventListener('resize', checkScroll);

        return () => {
            el?.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [toolCalls]);

    // Extract all images from completed tool calls (including subpages)
    const allImages: string[] = [];
    toolCalls.forEach(tc => {
        if (tc.status === 'completed' && tc.result?.results) {
            tc.result.results.forEach((result: any) => {
                // Add main image if exists
                if (result.image) {
                    allImages.push(result.image);
                }
                // Add imageLinks from extras
                if (result.imageLinks && Array.isArray(result.imageLinks)) {
                    allImages.push(...result.imageLinks);
                }
                // Add images from subpages
                if (result.subpages && Array.isArray(result.subpages)) {
                    result.subpages.forEach((sp: any) => {
                        if (sp.image) {
                            allImages.push(sp.image);
                        }
                    });
                }
            });
        }
    });

    // Deduplicate images
    const uniqueImages = [...new Set(allImages)];

    if (!toolCalls?.length) return null;

    return (
        <div className="mb-2 w-full">
            {/* Tool call pills */}
            <div className="relative group">
                {/* Scrollable container with mask-image for smooth fading */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-2 px-1 transition-all duration-300 ease-in-out"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        maskImage: `linear-gradient(to right,
                            ${showLeftFade ? 'transparent' : 'black'} 0%,
                            black 40px,
                            black calc(100% - 40px),
                            ${showRightFade ? 'transparent' : 'black'} 100%)`,
                        WebkitMaskImage: `linear-gradient(to right,
                            ${showLeftFade ? 'transparent' : 'black'} 0%,
                            black 40px,
                            black calc(100% - 40px),
                            ${showRightFade ? 'transparent' : 'black'} 100%)`
                    }}
                >
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        div::-webkit-scrollbar { display: none !important; }
                    `}} />
                    <AnimatePresence mode="popLayout">
                        {toolCalls.map((tc) => (
                            <ToolCallCard key={tc.id} toolCall={tc} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Image gallery below pills */}
            {uniqueImages.length > 0 && (
                <ImageGallery images={uniqueImages} maxImages={6} />
            )}
        </div>
    );
};

export { ImageGallery };
export default ToolCallCard;
