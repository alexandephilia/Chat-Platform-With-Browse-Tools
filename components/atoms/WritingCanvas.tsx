/**
 * WritingCanvas - A special container for creative writing output
 * Uses FLIP animation technique for seamless expand/collapse morphing across portal
 * Styled with clay/skeuomorphic theme matching the project
 */

import { AnimatedMarkdown } from 'flowtoken';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface WritingCanvasProps {
    content: string;
    isWriting: boolean;
    title?: string;
    onSave?: (editedContent: string) => void; // Save locally (update message content)
    onSendEdit?: (editedContent: string) => void; // Save and send to AI
}

// Quill/Feather Pen Icon - elegant writing icon
const QuillIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
);

// Expand Icon
const ExpandIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
);

// Close Icon
const CloseIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

// Edit Pencil Icon
const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
    </svg>
);

// Save Icon
const SaveIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

// Send Icon
const SendIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);

const matteCodeStyle: { [key: string]: React.CSSProperties } = {
    'code[class*="language-"]': { color: '#37474f', background: 'transparent' },
    'pre[class*="language-"]': { color: '#37474f', background: 'transparent' },
    'comment': { color: '#78909c', fontStyle: 'italic' },
    'string': { color: '#26a69a' },
    'keyword': { color: '#5c6bc0' },
    'function': { color: '#5c6bc0' },
};

// Memoized content renderer to prevent re-renders during streaming
const MemoizedContentRenderer = React.memo(({ content, isWriting, inModal = false }: {
    content: string;
    isWriting: boolean;
    inModal?: boolean
}) => {
    return (
        <div className={`prose prose-slate prose-sm max-w-none writing-content ${inModal ? 'prose-base' : ''}`}>
            <AnimatedMarkdown
                content={content || ' '}
                sep="diff"
                animation={isWriting ? "blurAndSharpen" : null}
                animationDuration="1s"
                animationTimingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
                codeStyle={matteCodeStyle}
            />
        </div>
    );
});

// Editable content that expands to fit - no internal scroll
const EditableContent = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize on mount and when value changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        // Resize immediately
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            className="w-full p-0 bg-transparent border-none focus:ring-0 focus:outline-none resize-none writing-content"
            style={{
                fontFamily: '"Source Serif 4", Georgia, serif',
                fontSize: '15px',
                lineHeight: '1.85',
                color: '#374151',
                overflow: 'hidden', // No internal scroll - parent handles it
                minHeight: '200px',
            }}
            autoFocus
        />
    );
};

const StatusPill = ({ isWriting }: { isWriting: boolean }) => (
    <AnimatePresence mode="wait">
        {isWriting ? (
            <motion.div
                key="writing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md w-fit"
                style={{
                    background: 'linear-gradient(to bottom, rgba(251, 146, 60, 0.18), rgba(234, 88, 12, 0.08))',
                    border: '1px solid rgba(251, 146, 60, 0.25)',
                    boxShadow: '0 1px 2px rgba(251, 146, 60, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                }}
            >
                <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-0.5 h-0.5 rounded-full bg-orange-500"
                            animate={{ y: [0, -1, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
                <span className="text-[9px] font-bold text-orange-600 tracking-tight">Writing</span>
            </motion.div>
        ) : (
            <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md w-fit"
                style={{
                    background: 'linear-gradient(to bottom, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.05))',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 1px 2px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                }}
            >
                <svg className="w-2 h-2 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[9px] font-bold text-green-600 tracking-tight">Done</span>
            </motion.div>
        )}
    </AnimatePresence>
);

export function WritingCanvas({ content, isWriting, title = 'Manuscript', onSave, onSendEdit }: WritingCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHeaderFade, setShowHeaderFade] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [originRect, setOriginRect] = useState<DOMRect | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [localContent, setLocalContent] = useState(content); // Track locally saved content
    const lastContentLength = useRef(0);

    // Sync local content with prop when not editing
    useEffect(() => {
        if (!isEditing) {
            setEditedContent(localContent);
        }
    }, [localContent, isEditing]);

    // Update local content when prop changes (initial load or AI streaming)
    useEffect(() => {
        if (isWriting || localContent === '') {
            setLocalContent(content);
        }
    }, [content, isWriting]);

    useEffect(() => {
        if (shouldAutoScroll && contentRef.current && content.length > lastContentLength.current && !isExpanded) {
            contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
        }
        lastContentLength.current = content.length;
    }, [content, shouldAutoScroll, isExpanded]);

    // Track previous isWriting state to detect when streaming finishes
    const prevIsWritingRef = useRef(isWriting);
    const hasInitializedRef = useRef(false);

    // On mount or when content loads from history, scroll to top if not writing
    useEffect(() => {
        if (!hasInitializedRef.current && content && !isWriting && contentRef.current) {
            // Content loaded from history (not streaming) - scroll to top
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
            hasInitializedRef.current = true;
        }
    }, [content, isWriting]);

    // When streaming finishes, scroll back to top
    useEffect(() => {
        if (prevIsWritingRef.current && !isWriting && contentRef.current) {
            // Streaming just finished - scroll back to top after a brief delay
            setTimeout(() => {
                contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
            hasInitializedRef.current = true;
        }
        prevIsWritingRef.current = isWriting;
    }, [isWriting]);

    useEffect(() => {
        if (isWriting) setShouldAutoScroll(true);
    }, [isWriting]);

    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setIsEditing(false);
            setShowHeaderFade(false);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isExpanded]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
        setShowHeaderFade(scrollTop > 10);
    }, []);

    const handleExpand = useCallback(() => {
        if (containerRef.current) {
            setOriginRect(containerRef.current.getBoundingClientRect());
        }
        setIsExpanded(true);
    }, []);

    const handleClose = useCallback(() => {
        if (!isEditing) {
            if (containerRef.current) {
                setOriginRect(containerRef.current.getBoundingClientRect());
            }
            setIsExpanded(false);
        }
    }, [isEditing]);

    const handleEditClick = useCallback(() => {
        setIsEditing(true);
        setEditedContent(localContent);
    }, [localContent]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditedContent(localContent); // Revert to last saved content
    }, [localContent]);

    // Save locally - updates the content but doesn't send to AI
    const handleSave = useCallback(() => {
        if (editedContent.trim()) {
            setLocalContent(editedContent);
            if (onSave) onSave(editedContent);
        }
        setIsEditing(false);
        setIsExpanded(false);
    }, [editedContent, onSave]);

    // Save and send to AI for continuation
    const handleSaveAndSend = useCallback(() => {
        if (editedContent.trim()) {
            setLocalContent(editedContent);
            if (onSendEdit) onSendEdit(editedContent);
        }
        setIsEditing(false);
        setIsExpanded(false);
    }, [editedContent, onSendEdit]);



    // Calculate modal insets based on screen size
    const getModalInsets = () => {
        const w = window.innerWidth;
        if (w >= 1024) return { top: 64, right: 64, bottom: 64, left: 64 };
        if (w >= 768) return { top: 48, right: 48, bottom: 48, left: 48 };
        if (w >= 640) return { top: 32, right: 32, bottom: 32, left: 32 };
        return { top: 16, right: 16, bottom: 16, left: 16 };
    };

    const insets = getModalInsets();
    const modalTarget = {
        top: insets.top,
        left: insets.left,
        width: window.innerWidth - insets.left - insets.right,
        height: window.innerHeight - insets.top - insets.bottom,
    };

    return (
        <>
            {/* Collapsed Card - Clay Style with bottom fade mask on entire card */}
            <div
                ref={containerRef}
                className="relative w-full my-3 group"
                style={{
                    visibility: isExpanded ? 'hidden' : 'visible',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Card with mask applied to entire thing - smoother natural fade */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02), inset 0 1px 2px rgba(0,0,0,0.01), 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px -4px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(226, 232, 240, 0.6)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)',
                    }}
                >
                    {/* Header - High-gloss shine with subtle bottom border */}
                    <div className="relative flex items-center gap-2.5 px-3.5 pt-4 pb-3 border-b border-slate-200/40"
                        style={{
                            zIndex: 5,
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 50%, rgba(248,250,252,0.3) 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                        }}
                    >
                        {/* Header fade effect */}
                        <div
                            className="absolute inset-x-0 -bottom-6 h-6 pointer-events-none transition-opacity duration-200"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,0))',
                                opacity: showHeaderFade ? 1 : 0,
                            }}
                        />
                        {/* Icon */}
                        <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                            style={{
                                background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
                                boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(203, 213, 225, 0.4)',
                            }}
                        >
                            <QuillIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        {/* Title and status stacked */}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-[15px] font-semibold text-slate-700 tracking-tight truncate">{title}</span>
                            <StatusPill isWriting={isWriting} />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div
                        ref={contentRef}
                        onScroll={handleScroll}
                        className="px-3.5 pt-1 pb-8 overflow-y-auto writing-canvas-content"
                        style={{ maxHeight: '200px', minHeight: '100px' }}
                    >
                        <MemoizedContentRenderer content={isWriting ? content : localContent} isWriting={isWriting} />
                    </div>
                </div>

                {/* Expand button - higher position, accent orange style, hover on desktop, always on mobile */}
                <motion.div
                    className="absolute bottom-6 left-0 right-0 flex justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        // Always visible on mobile (touch devices)
                        opacity: 'var(--expand-btn-opacity, 0)',
                    }}
                >
                    <style>{`
                        @media (hover: none) {
                            .writing-expand-btn-wrapper { --expand-btn-opacity: 1 !important; }
                        }
                        @media (hover: hover) {
                            .group:hover .writing-expand-btn-wrapper { --expand-btn-opacity: 1 !important; }
                        }
                    `}</style>
                    <button
                        type="button"
                        onClick={handleExpand}
                        className="writing-expand-btn-wrapper flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                        style={{
                            background: 'linear-gradient(to bottom, #ffffff 0%, #fcfdfe 45%, #f8fafc 55%, #f1f5f9 100%)',
                            border: '1px solid rgba(226, 232, 240, 0.9)',
                            color: '#475569',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,1), 0 1px 0 rgba(255,255,255,0.5)',
                        }}
                    >
                        <ExpandIcon className="w-3 h-3" />
                        Expand
                    </button>
                </motion.div>
            </div>

            {/* Modal Portal */}
            {createPortal(
                <AnimatePresence mode="wait">
                    {isExpanded && (
                        <>
                            {/* Backdrop - immersive deep blur reveal */}
                            <motion.div
                                initial={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
                                animate={{ opacity: 1, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                                exit={{ opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
                                transition={{
                                    duration: 0.45,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="fixed inset-0 bg-black/45"
                                style={{ zIndex: 99998 }}
                                onClick={handleClose}
                            />

                            {/* Modal - animates from origin rect */}
                            <motion.div
                                initial={originRect ? {
                                    position: 'fixed',
                                    top: originRect.top,
                                    left: originRect.left,
                                    width: originRect.width,
                                    height: originRect.height,
                                    borderRadius: 16,
                                    opacity: 0,
                                    filter: 'blur(24px)',
                                } : {
                                    opacity: 0,
                                    scale: 0.92,
                                    filter: 'blur(24px)',
                                }}
                                animate={{
                                    position: 'fixed',
                                    top: modalTarget.top,
                                    left: modalTarget.left,
                                    width: modalTarget.width,
                                    height: modalTarget.height,
                                    borderRadius: 20,
                                    opacity: 1,
                                    scale: 1,
                                    filter: 'blur(0px)',
                                }}
                                exit={originRect ? {
                                    position: 'fixed',
                                    top: originRect.top,
                                    left: originRect.left,
                                    width: originRect.width,
                                    height: originRect.height,
                                    borderRadius: 16,
                                    opacity: 0,
                                    filter: 'blur(12px)',
                                } : {
                                    opacity: 0,
                                    scale: 0.92,
                                    filter: 'blur(12px)',
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 28,
                                    mass: 0.6,
                                    opacity: { duration: 0.2 },
                                    filter: { duration: 0.4 },
                                }}
                                className="overflow-hidden flex flex-col"
                                style={{
                                    zIndex: 99999,
                                    background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                                }}
                            >
                                {/* Modal Header */}
                                <div className="relative flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ zIndex: 10 }}>
                                    <div
                                        className="absolute inset-x-0 -bottom-6 h-6 pointer-events-none transition-opacity duration-200"
                                        style={{
                                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(255,255,255,0))',
                                            opacity: showHeaderFade ? 1 : 0,
                                        }}
                                    />
                                    <div className="flex items-center gap-3">
                                        {/* Icon with depth - larger in modal */}
                                        <div
                                            className="flex items-center justify-center w-12 h-12 rounded-xl"
                                            style={{
                                                background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)',
                                                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.04), 0 3px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9)',
                                                border: '1px solid rgba(203, 213, 225, 0.5)',
                                            }}
                                        >
                                            <QuillIcon className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[16px] font-semibold text-slate-800">{title}</span>
                                            <StatusPill isWriting={isWriting} />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                                        style={{
                                            background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                                            border: '1px solid rgba(226, 232, 240, 0.6)',
                                        }}
                                    >
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Content - scrollable area with notebook stripes */}
                                <motion.div
                                    initial={{ opacity: 0, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(226, 232, 240, 0.4) 27px, rgba(226, 232, 240, 0.4) 28px)',
                                        backgroundSize: '100% 28px',
                                        backgroundPosition: '0 12px',
                                    }}
                                >
                                    <div className="max-w-3xl mx-auto pb-24 px-6 py-6 sm:px-8 md:px-12 lg:px-16">
                                        {isEditing ? (
                                            <EditableContent
                                                value={editedContent}
                                                onChange={setEditedContent}
                                            />
                                        ) : (
                                            <MemoizedContentRenderer content={isWriting ? content : localContent} isWriting={isWriting} inModal />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Floating Action Buttons - Mobile responsive with Vertical Slide & Blur Transition */}
                                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 z-20">
                                    <AnimatePresence mode="wait">
                                        {isEditing ? (
                                            <motion.div
                                                key="editing-buttons"
                                                initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                                                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                                exit={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="flex items-center justify-between w-full"
                                            >
                                                {/* Left side - Cancel and Save */}
                                                <div className="flex items-center gap-2">
                                                    {/* Cancel Button - Matte Red Icon-Only */}
                                                    <motion.button
                                                        type="button"
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={handleCancelEdit}
                                                        title="Cancel"
                                                        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white transition-colors"
                                                        style={{
                                                            background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                                                            boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.4), 0 4px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                                                            border: '1px solid #dc2626',
                                                        }}
                                                    >
                                                        <CloseIcon className="w-5 h-5" />
                                                    </motion.button>

                                                    {/* Save Button - Matte Blue Icon-Only */}
                                                    <motion.button
                                                        type="button"
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={handleSave}
                                                        title="Save"
                                                        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white transition-colors"
                                                        style={{
                                                            background: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
                                                            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4), 0 4px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                                                            border: '1px solid #2563eb',
                                                        }}
                                                    >
                                                        <SaveIcon className="w-5 h-5" />
                                                    </motion.button>
                                                </div>

                                                {/* Right side - Save & Send - Primary Matte Blue Icon-Only */}
                                                <motion.button
                                                    type="button"
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleSaveAndSend}
                                                    title="Save & Send"
                                                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white transition-colors"
                                                    style={{
                                                        background: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
                                                        boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4), 0 4px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                                                        border: '1px solid #2563eb',
                                                    }}
                                                >
                                                    <SendIcon className="w-5 h-5" />
                                                </motion.button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="view-button"
                                                initial={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                                                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                                exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="flex justify-end"
                                            >
                                                {/* Edit FAB - Glossy Top / Dark Grey Base Gradient */}
                                                <motion.button
                                                    type="button"
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleEditClick}
                                                    title="Edit writing"
                                                    className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white transition-colors"
                                                    style={{
                                                        background: 'linear-gradient(to bottom, #475569 0%, #1e293b 45%, #0f172a 100%)',
                                                        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.5), 0 4px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
                                                        border: '1px solid #0f172a',
                                                    }}
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </motion.button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence >,
                document.body
            )
            }
        </>
    );
}

export default WritingCanvas;
