import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ExternalLink, Globe, Lightbulb, Loader2, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ToolCall } from '../../types';
import { CompassLinear, GlobalLinear } from './Icons';
import { LazyImage } from './LazyImage';

interface SearchTimelineProps {
    toolCalls: ToolCall[];
    isThinking?: boolean;
    thinkingContent?: string;
    isStreaming?: boolean; // Whether the AI is still generating response
    planningText?: string; // Planning text from model (e.g., "I'll search for...")
    hasResponseContent?: boolean; // Whether the model has started outputting response content
}

// Extract domain from URL
const getDomain = (url: string): string => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return domain;
    } catch {
        return url;
    }
};

// Get favicon URL
const getFavicon = (url: string): string => {
    try {
        const domain = new URL(url).origin;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return '';
    }
};

// Source item component
const SourceItem: React.FC<{ result: any; index: number }> = ({ result, index }) => {
    const [faviconError, setFaviconError] = useState(false);

    return (
        <motion.a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: "easeOut"
            }}
            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50/80 transition-colors group min-w-0"
        >
            {/* Fixed-size favicon container to prevent layout shift */}
            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                {!faviconError ? (
                    <img
                        src={result.favicon || getFavicon(result.url)}
                        alt=""
                        className="w-4 h-4 rounded-sm"
                        onError={() => setFaviconError(true)}
                    />
                ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-300" />
                )}
            </div>
            <span className="flex-1 text-[13px] text-slate-800 truncate group-hover:text-blue-600 transition-colors min-w-0">
                {result.title || 'Untitled'}
            </span>
            <span className="text-[11px] text-slate-400 shrink-0 hidden sm:block">
                {getDomain(result.url)}
            </span>
        </motion.a>
    );
};

// Sources list with expand functionality
const SourcesList: React.FC<{ results: any[] }> = ({ results }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayResults = isExpanded ? results : results.slice(0, 6);
    const hasMore = results.length > 6;

    return (
        <div
            className="rounded-xl overflow-hidden divide-y divide-slate-100/50"
            style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(226, 232, 240, 0.6)',
                width: 'fit-content',
                minWidth: '260px',
                maxWidth: '400px'
            }}
        >
            <AnimatePresence mode="popLayout">
                {displayResults.map((result: any, idx: number) => (
                    <SourceItem key={`source-${result.url || idx}-${idx}`} result={result} index={idx} />
                ))}
            </AnimatePresence>
            {hasMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-3 py-2 text-[11px] text-slate-800 font-medium text-center hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                    {isExpanded ? 'Show less' : `+${results.length - 6} more sources`}
                </button>
            )}
        </div>
    );
};

// Timeline step component
const TimelineStep: React.FC<{
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
    isCompleted?: boolean;
    isLast?: boolean;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
}> = ({ icon, title, isActive, isCompleted, isLast, children, defaultExpanded = true }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="relative pl-8" style={{ width: 'fit-content', minWidth: '200px', maxWidth: '100%' }}>
            {/* Timeline line - hide for last step */}
            {!isLast && (
                <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-slate-200/60" />
            )}

            {/* Timeline dot */}
            <div className={`absolute left-0 top-[5px] w-[18px] h-[18px] rounded-full flex items-center justify-center ${isActive || isCompleted ? 'text-blue-600' : 'text-slate-400'}`}
                style={{
                    background: 'linear-gradient(to bottom, #bfdbfe, #ffffff)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8)',
                    border: '1px solid rgba(147, 197, 253, 0.5)',
                    zIndex: 1
                }}
            >
                {isActive ? (
                    <Loader2 className="w-[10px] h-[10px] animate-spin" />
                ) : isCompleted ? (
                    <Check className="w-[10px] h-[10px]" />
                ) : (
                    <div className="w-[10px] h-[10px] flex items-center justify-center">
                        {icon}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={isLast ? '' : 'pb-4'}>
                <button
                    onClick={() => children && setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-2 text-[11px] font-semibold translate-y-[6px] ${isActive ? 'text-blue-600' :
                        isCompleted ? 'text-blue-600/80' :
                            'text-blue-500/60'
                        } ${children ? 'cursor-pointer hover:text-blue-600' : 'cursor-default'}`}
                >
                    {title}
                    {children && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </button>

                <AnimatePresence initial={false}>
                    {isExpanded && children && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="mt-2.5">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Image Gallery for timeline - Claymorphism style
const TimelineImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    // Memoize display images to prevent unnecessary re-renders
    const displayImages = useMemo(() =>
        images.filter(img => img && !failedImages.has(img)).slice(0, 8),
        [images, failedImages]
    );

    if (displayImages.length === 0) return null;

    return (
        <div className="mt-4 relative" style={{ width: 'fit-content', maxWidth: '500px' }}>
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-2 px-1"
                style={{
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    padding: '12px 8px 8px 8px',
                    borderRadius: '16px',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
                    maskImage: 'linear-gradient(to right, #00000054, black 12%, black calc(88%), #00000054 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, #00000054, black 12%, black calc(88%), #00000054 100%)'
                }}
            >
                {displayImages.map((img, idx) => (
                    <motion.a
                        key={img}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(8px)' }}
                        animate={{
                            opacity: loadedImages.has(img) ? 1 : 0.5,
                            scale: 1,
                            y: 0,
                            filter: loadedImages.has(img) ? 'blur(0px)' : 'blur(4px)'
                        }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        transition={{
                            delay: idx * 0.05,
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        className="relative shrink-0 rounded-2xl overflow-hidden group cursor-zoom-in"
                        style={{
                            width: '160px',
                            height: '100px',
                            background: 'rgba(241, 245, 249, 0.4)',
                            border: '1px solid rgba(226, 232, 240, 0.5)',
                            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.8)',
                        }}
                    >
                        {/* Loading skeleton handled by LazyImage */}
                        <LazyImage
                            src={img}
                            alt=""
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${loadedImages.has(img) ? 'opacity-100' : 'opacity-0'}`}
                            width={160}
                            height={100}
                            onLoad={() => setLoadedImages(prev => new Set(prev).add(img))}
                            onError={() => setFailedImages(prev => new Set(prev).add(img))}
                        />
                        {/* Hover gloss */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.a>
                ))}
            </div>
        </div>
    );
};

export const SearchTimeline: React.FC<SearchTimelineProps> = ({ toolCalls, isStreaming = false, planningText, hasResponseContent = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef<number | null>(null);

    // Memoize expensive calculations to prevent unnecessary re-renders
    const { totalSources, allResults, allImages } = useMemo(() => {
        let totalSources = 0;
        const allResults: any[] = [];
        const allImages: string[] = [];

        toolCalls.forEach(tc => {
            if (tc.result?.results) {
                tc.result.results.forEach((r: any) => {
                    totalSources++;
                    allResults.push(r);
                    // Prioritize imageLinks (actual content images) over image (og:image/preview)
                    // imageLinks are extracted from page content and more likely to be relevant
                    if (r.imageLinks && r.imageLinks.length > 0) {
                        allImages.push(...r.imageLinks);
                    } else if (r.image) {
                        // Fallback to og:image only if no imageLinks
                        allImages.push(r.image);
                    }
                    if (r.subpages) {
                        totalSources += r.subpages.length;
                        r.subpages.forEach((sp: any) => {
                            allResults.push(sp);
                            // Same priority for subpages
                            if (sp.imageLinks && sp.imageLinks.length > 0) {
                                allImages.push(...sp.imageLinks);
                            } else if (sp.image) {
                                allImages.push(sp.image);
                            }
                        });
                    }
                });
            }
        });

        return { totalSources, allResults, allImages };
    }, [toolCalls]);

    const uniqueImages = useMemo(() => [...new Set(allImages)], [allImages]);
    const isSearching = useMemo(() =>
        toolCalls.some(tc => tc.status === 'running' || tc.status === 'pending'),
        [toolCalls]
    );
    const isCompleted = useMemo(() =>
        toolCalls.every(tc => tc.status === 'completed') && !isStreaming,
        [toolCalls, isStreaming]
    );

    // Track elapsed time while searching
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSearching && !startTimeRef.current) {
            startTimeRef.current = Date.now();
        }

        if (isSearching) {
            interval = setInterval(() => {
                if (startTimeRef.current) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 100);
        } else if (!isSearching && startTimeRef.current) {
            // Reset when searching stops
            startTimeRef.current = null;
            setElapsedTime(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isSearching]);

    // Auto-collapse when model starts outputting response content (only once)
    useEffect(() => {
        if (hasResponseContent && !hasAutoCollapsed) {
            setIsExpanded(false);
            setHasAutoCollapsed(true);
        }
    }, [hasResponseContent, hasAutoCollapsed]);

    // Memoize styles to prevent inline object creation
    const containerStyle = useMemo(() => ({
        width: 'fit-content' as const,
        maxWidth: '100%' as const,
    }), []);

    const headerStyle = useMemo(() => ({
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9)',
        border: '1px solid rgba(226, 232, 240, 0.6)'
    }), []);

    const contentStyle = useMemo(() => ({
        width: 'fit-content' as const,
        maxWidth: '100%' as const,
        minWidth: '280px' as const,
    }), []);

    if (!toolCalls?.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-4 inline-block max-w-full"
            style={containerStyle}
        >
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2.5 mb-3 px-3 py-2 rounded-xl select-none"
                style={headerStyle}
                aria-expanded={isExpanded}
                aria-controls="search-timeline-content"
                aria-label={isSearching ? `Searching... ${elapsedTime} seconds` : `Reviewed ${totalSources} sources, ${isExpanded ? 'collapse' : 'expand'}`}
            >
                {isSearching ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-spin" />
                ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="text-[12px] font-medium text-slate-600 truncate max-w-[220px] sm:max-w-[280px]">
                    {isSearching ? (
                        <>Searching... <span className="text-slate-400 tabular-nums">{elapsedTime}s</span></>
                    ) : (
                        `Reviewed ${totalSources} sources`
                    )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        id="search-timeline-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={contentStyle}
                    >
                        {/* Timeline */}
                        <div className="relative">
                            {/* Planning step - shows DeepSeek's planning text */}
                            {planningText && (
                                <TimelineStep
                                    icon={<Lightbulb className="w-3 h-3" />}
                                    title="Planning"
                                    isCompleted={true}
                                    defaultExpanded={true}
                                >
                                    <div
                                        className="inline-flex items-start gap-2 px-3 py-2 rounded-lg text-[12px] text-slate-600 italic"
                                        style={{
                                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
                                            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9)',
                                            border: '1px solid rgba(226, 232, 240, 0.6)',
                                            maxWidth: '350px'
                                        }}
                                    >
                                        "{planningText}"
                                    </div>
                                </TimelineStep>
                            )}

                            {toolCalls.map((tc, tcIndex) => {
                                const isActive = tc.status === 'running' || tc.status === 'pending';
                                const isDone = tc.status === 'completed';
                                const isLastTool = tcIndex === toolCalls.length - 1;

                                // Handle visit_urls tool - shows as "Navigating"
                                if (tc.name === 'visit_urls') {
                                    const urls = tc.args?.urls || [];
                                    const visitedResults = tc.result?.results || [];

                                    return (
                                        <div key={tc.id}>
                                            <TimelineStep
                                                icon={<CompassLinear className="w-4 h-4" />}
                                                title="Navigating"
                                                isActive={isActive}
                                                isCompleted={isDone}
                                                defaultExpanded={true}
                                            >
                                                <div
                                                    className="rounded-xl overflow-hidden divide-y divide-slate-100/50"
                                                    style={{
                                                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
                                                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9)',
                                                        border: '1px solid rgba(226, 232, 240, 0.6)',
                                                        width: 'fit-content',
                                                        minWidth: '260px',
                                                        maxWidth: '400px'
                                                    }}
                                                >
                                                    {urls.map((url: string, idx: number) => (
                                                        <a
                                                            key={url}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 py-2 px-3 min-w-0 hover:bg-slate-50/80 transition-colors group"
                                                        >
                                                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-[12px] text-slate-800 truncate group-hover:text-blue-600 transition-colors">{url}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </TimelineStep>

                                            {/* Show visited sources */}
                                            {visitedResults.length > 0 && (
                                                <TimelineStep
                                                    icon={<ExternalLink className="w-3 h-3" />}
                                                    title={`Reviewing source`}
                                                    isCompleted={isDone}
                                                    isLast={isLastTool && !isCompleted}
                                                    defaultExpanded={true}
                                                >
                                                    <SourcesList results={visitedResults} />
                                                </TimelineStep>
                                            )}
                                        </div>
                                    );
                                }

                                // Handle search tools
                                const query = tc.args?.query || tc.args?.url || 'Search';
                                const results = tc.result?.results || [];
                                const hasResults = results.length > 0;

                                return (
                                    <div key={tc.id}>
                                        {/* Searching step */}
                                        <TimelineStep
                                            icon={<GlobalLinear className="w-4 h-4" />}
                                            title="Searching the web"
                                            isActive={isActive}
                                            isCompleted={isDone}
                                            defaultExpanded={true}
                                        >
                                            {/* Search query pill */}
                                            <div
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                                style={{
                                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
                                                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.9)',
                                                    border: '1px solid rgba(226, 232, 240, 0.6)',
                                                    maxWidth: '350px'
                                                }}
                                            >
                                                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-[12px] text-slate-600 truncate">{query}</span>
                                            </div>
                                        </TimelineStep>

                                        {/* Sources step */}
                                        {hasResults && (
                                            <TimelineStep
                                                icon={<CompassLinear className="w-4 h-4" />}
                                                title={`Reviewing sources · ${results.length}`}
                                                isCompleted={isDone}
                                                isLast={isLastTool && !isCompleted}
                                                defaultExpanded={true}
                                            >
                                                <SourcesList results={results} />
                                            </TimelineStep>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Finished step - no animation to prevent layout shift */}
                            {isCompleted && (
                                <TimelineStep
                                    icon={<Check className="w-3 h-3" />}
                                    title="Finished"
                                    isCompleted={true}
                                    isLast={true}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image gallery - show outside collapsible section so it's always visible when completed */}
            {isCompleted && uniqueImages.length > 0 && (
                <TimelineImageGallery images={uniqueImages} />
            )}
        </motion.div>
    );
};

export default SearchTimeline;
