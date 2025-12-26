import { getModelCapabilities, hasBuiltInTools } from '@/services/modelConfig';
import { IconWorldBolt, IconWorldSearch } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Mic, Paperclip, Plus, Send, Square, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { extractTextFromDocument } from '../../services/documentService';
import { isElevenLabsConfigured } from '../../services/elevenLabsService';
import { Attachment } from '../../types';
import { GlobalLinear, LightbulbLineDuotone } from '../atoms/Icons';
import { InfoPill } from '../atoms/InfoPill';
import { LazyImage } from '../atoms/LazyImage';
import ModelPicker, { AIModel, AVAILABLE_MODELS } from '../molecules/ModelPicker';
import VoicePicker from '../molecules/VoicePicker';

interface ChatInputProps {
    onSend: (message: string, attachments?: Attachment[], webSearchEnabled?: boolean, searchType?: 'auto' | 'fast' | 'deep') => void;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'embedded';
    selectedModel?: AIModel;
    onModelChange?: (model: AIModel) => void;
    webSearchEnabled?: boolean;
    onWebSearchToggle?: (enabled: boolean) => void;
    searchType?: 'auto' | 'fast' | 'deep';
    onSearchTypeChange?: (type: 'auto' | 'fast' | 'deep') => void;
    reasoningEnabled?: boolean;
    onReasoningToggle?: (enabled: boolean) => void;
    onAttachmentsChange?: (hasAttachments: boolean) => void;
}

export const Ufo3Outline = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <g fill="currentColor">
            <path d="M12.707 12.707a1 1 0 1 1-1.414-1.415a1 1 0 0 1 1.414 1.415ZM9.879 8.464A1 1 0 1 1 8.465 7.05a1 1 0 0 1 1.414 1.414Zm7.071 7.071a1 1 0 1 1-1.414-1.414a1 1 0 0 1 1.414 1.414Z"></path>
            <path fillRule="evenodd" d="M8.104 4.316c-.95-.162-1.517.015-1.815.313c-.223.223-.377.59-.373 1.169c.004.583.17 1.32.52 2.173c.7 1.702 2.073 3.72 3.973 5.62s3.918 3.272 5.62 3.972c.852.35 1.59.517 2.173.52c.58.005.946-.15 1.169-.373c.297-.297.475-.864.312-1.815c-.126-.74-.448-1.62-.96-2.583a1.177 1.177 0 0 1-.76.12c-.721-.13-2.077-.729-4.372-3.023c-2.295-2.295-2.893-3.651-3.023-4.372a1.177 1.177 0 0 1 .12-.761c-.963-.512-1.844-.833-2.584-.96Zm3.732-.119c-1.22-.7-2.414-1.177-3.479-1.36c-1.166-.198-2.333-.064-3.128.731c-.592.592-.819 1.398-.813 2.24c.006.838.238 1.772.634 2.734c.791 1.925 2.293 4.104 4.299 6.11c2.005 2.004 4.183 3.506 6.11 4.298c.96.395 1.894.628 2.733.634c.842.005 1.648-.221 2.24-.813c.795-.795.93-1.962.73-3.128c-.182-1.066-.66-2.259-1.36-3.48a5.48 5.48 0 0 0-.716-6.866l-.383-.384a5.48 5.48 0 0 0-6.867-.716Zm.243 1.714c.128.42.631 1.495 2.573 3.437c1.941 1.941 3.017 2.444 3.437 2.572a3.979 3.979 0 0 0-.063-5.562l-.384-.384a3.979 3.979 0 0 0-5.563-.063Zm-7.327 4.851a.75.75 0 0 1 0 1.06l-2.121 2.122a.75.75 0 1 1-1.06-1.06l2.12-2.122a.75.75 0 0 1 1.061 0Zm3.536 4.95a.75.75 0 0 1 0 1.06l-4.122 4.122a.75.75 0 0 1-1.06-1.06l4.121-4.122a.75.75 0 0 1 1.06 0Zm4.95 3.535a.75.75 0 0 1 0 1.061l-2.122 2.121a.75.75 0 0 1-1.06-1.06l2.12-2.122a.75.75 0 0 1 1.062 0Z" clipRule="evenodd"></path>
        </g>
    </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled,
    className = "",
    variant = 'default',
    selectedModel = AVAILABLE_MODELS[0],
    onModelChange,
    webSearchEnabled = false,
    onWebSearchToggle,
    searchType = 'auto',
    onSearchTypeChange,
    reasoningEnabled = false,
    onReasoningToggle,
    onAttachmentsChange
}) => {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchTypeMenuOpen, setIsSearchTypeMenuOpen] = useState(false);

    // Voice recorder hook
    const {
        state: voiceState,
        startRecording,
        stopRecording,
        duration: recordingDuration,
        isSupported: isVoiceSupported,
    } = useVoiceRecorder({
        onTranscription: (text) => {
            setInput(prev => prev ? `${prev} ${text}` : text);
            toast.success('Voice transcribed!');
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const [menuPlacement, setMenuPlacement] = useState<'top' | 'bottom'>('top');
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [searchTypeMenuPosition, setSearchTypeMenuPosition] = useState({ x: 0, y: 0 });
    const [searchTypeMenuPlacement, setSearchTypeMenuPlacement] = useState<'top' | 'bottom'>('top');
    const menuContainerRef = useRef<HTMLDivElement>(null);
    const searchTypeButtonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const isFirstMount = useRef(true);
    const rafIdRef = useRef<number | null>(null);
    const lastMenuPosRef = useRef<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);
    const lastSearchMenuPosRef = useRef<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);

    // Track if touch event was handled to prevent double-firing on mobile
    const touchHandledRef = useRef(false);

    // Helper to create mobile-friendly button handlers that prevent double-firing
    const createTapHandler = (handler: () => void) => ({
        onClick: (e: React.MouseEvent) => {
            // Skip if touch already handled this interaction
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
            // Reset after a short delay to allow for next interaction
            setTimeout(() => { touchHandledRef.current = false; }, 300);
        }
    });

    // Search type configurations with icons
    const SEARCH_TYPES = {
        auto: { label: 'Auto', description: 'High quality, ~1s', color: 'blue' },
        fast: { label: 'Fast', description: '<500ms latency', color: 'emerald' },
        deep: { label: 'Deep', description: 'Most comprehensive, 2-4s', color: 'violet' }
    } as const;

    // Get icon for search type with color
    // When useResponsive is true, uses Tailwind classes for responsive sizing (w-4 h-4 md:w-5 md:h-5)
    // When useResponsive is false, uses fixed pixel size
    const getSearchTypeIcon = (type: 'auto' | 'fast' | 'deep', size: number = 16, inheritColor: boolean = false, useResponsive: boolean = false) => {
        const colorClass = inheritColor ? '' : type === 'fast' ? 'text-emerald-500' : type === 'deep' ? 'text-violet-500' : 'text-blue-500';
        const responsiveClass = useResponsive ? 'w-4 h-4 md:w-5 md:h-5' : '';

        switch (type) {
            case 'fast':
                return useResponsive
                    ? <IconWorldBolt stroke={2} className={`${colorClass} ${responsiveClass}`} />
                    : <IconWorldBolt size={size} stroke={2} className={colorClass} />;
            case 'deep':
                return useResponsive
                    ? <IconWorldSearch stroke={2} className={`${colorClass} ${responsiveClass}`} />
                    : <IconWorldSearch size={size} stroke={2} className={colorClass} />;
            default:
                return useResponsive
                    ? <GlobalLinear className={`${colorClass} ${responsiveClass}`} />
                    : <GlobalLinear width={size} height={size} className={colorClass} />;
        }
    };

    // Notify parent when attachments state changes
    useEffect(() => {
        onAttachmentsChange?.(attachments.length > 0);
    }, [attachments.length, onAttachmentsChange]);

    // Reset animation state when variant changes (welcome mode toggle)
    useEffect(() => {
        if (variant === 'embedded') {
            isFirstMount.current = true;
        } else {
            isFirstMount.current = false;
        }
    }, [variant]);


    // Allowed file types
    const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const ALLOWED_FILES = ['application/pdf'];
    const ALLOWED_DOCS = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/msword', // .doc
        'application/vnd.ms-excel' // .xls
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file' | 'doc') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const allowedTypes = type === 'image' ? ALLOWED_IMAGES : type === 'file' ? ALLOWED_FILES : ALLOWED_DOCS;
        const typeLabel = type === 'image' ? 'Images (JPG, PNG, GIF, WebP)' : type === 'file' ? 'PDFs' : 'Word/Excel documents';

        Array.from(files).forEach(async (file) => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Invalid file format. Only ${typeLabel} are allowed.`);
                return;
            }

            // Extract text for documents immediately
            let extractedText = '';
            if (type !== 'image') {
                try {
                    extractedText = await extractTextFromDocument(file);
                } catch (err) {
                    console.error('Text extraction failed:', err);
                    toast.error(`Failed to read text from ${file.name}`);
                }
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const newAttachment: Attachment = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: type === 'image' ? 'image' : 'file',
                    url: e.target?.result as string,
                    name: file.name,
                    file,
                    content: extractedText,
                    dataUrl: true
                };
                setAttachments(prev => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
        setIsMenuOpen(false);
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    // Update menu position when open
    useEffect(() => {
        if (isMenuOpen && menuContainerRef.current) {
            const compute = () => {
                const rect = menuContainerRef.current!.getBoundingClientRect();
                const menuWidth = 160;
                const menuHeight = 140; // Approximate menu height
                const padding = 12;

                // Calculate x position with viewport awareness
                let menuX = rect.left;
                const maxX = window.innerWidth - menuWidth - padding;
                const minX = padding;
                menuX = Math.max(minX, Math.min(maxX, menuX));

                // Calculate placement based on available space
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const placement: 'top' | 'bottom' = spaceBelow >= menuHeight || spaceBelow > spaceAbove ? 'bottom' : 'top';

                const next = { x: menuX, y: placement === 'top' ? rect.top : rect.bottom, placement };
                const last = lastMenuPosRef.current;
                if (!last || last.x !== next.x || last.y !== next.y || last.placement !== next.placement) {
                    lastMenuPosRef.current = next;
                    setMenuPlacement(placement);
                    setMenuPosition({ x: next.x, y: next.y });
                }
            };

            const schedule = () => {
                if (rafIdRef.current !== null) return;
                rafIdRef.current = window.requestAnimationFrame(() => {
                    rafIdRef.current = null;
                    compute();
                });
            };

            schedule();
            window.addEventListener('scroll', schedule, { capture: true, passive: true });
            window.addEventListener('resize', schedule, { passive: true });
            return () => {
                window.removeEventListener('scroll', schedule, { capture: true } as any);
                window.removeEventListener('resize', schedule as any);
                if (rafIdRef.current !== null) {
                    window.cancelAnimationFrame(rafIdRef.current);
                    rafIdRef.current = null;
                }
            };
        }
    }, [isMenuOpen, menuPlacement]);

    // Update search type menu position
    useEffect(() => {
        if (isSearchTypeMenuOpen && searchTypeButtonRef.current) {
            const compute = () => {
                const rect = searchTypeButtonRef.current!.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const menuHeight = 280; // Increased to account for full menu height
                const menuWidth = 200;
                const padding = 12; // Safe padding from screen edges

                // Choose placement: prefer top on mobile (input is usually at bottom)
                // Use bottom only if there's clearly more space below
                const placement: 'top' | 'bottom' = spaceAbove >= menuHeight
                    ? 'top'
                    : (spaceBelow >= menuHeight ? 'bottom' : (spaceAbove > spaceBelow ? 'top' : 'bottom'));

                // Calculate x position with viewport awareness
                // Align to button's left edge on mobile for better positioning
                let menuX = rect.left;

                // Clamp to viewport bounds
                const maxX = window.innerWidth - menuWidth - padding;
                const minX = padding;
                menuX = Math.max(minX, Math.min(maxX, menuX));

                const next = { x: menuX, y: placement === 'bottom' ? rect.bottom : rect.top, placement };
                const last = lastSearchMenuPosRef.current;
                if (!last || last.x !== next.x || last.y !== next.y || last.placement !== next.placement) {
                    lastSearchMenuPosRef.current = next;
                    setSearchTypeMenuPlacement(placement);
                    setSearchTypeMenuPosition({ x: next.x, y: next.y });
                }
            };

            const schedule = () => {
                if (rafIdRef.current !== null) return;
                rafIdRef.current = window.requestAnimationFrame(() => {
                    rafIdRef.current = null;
                    compute();
                });
            };

            schedule();
            window.addEventListener('scroll', schedule, { capture: true, passive: true });
            window.addEventListener('resize', schedule, { passive: true });
            return () => {
                window.removeEventListener('scroll', schedule, { capture: true } as any);
                window.removeEventListener('resize', schedule as any);
                if (rafIdRef.current !== null) {
                    window.cancelAnimationFrame(rafIdRef.current);
                    rafIdRef.current = null;
                }
            };
        }
    }, [isSearchTypeMenuOpen, variant]);

    const toggleMenu = () => {
        if (!isMenuOpen && menuContainerRef.current) {
            const rect = menuContainerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setMenuPlacement(spaceBelow < 200 ? 'top' : 'bottom');
        }
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSubmit = () => {
        if ((input.trim() || attachments.length > 0) && !disabled) {
            onSend(input, attachments, webSearchEnabled, searchType);
            setInput('');
            setAttachments([]);
            // Don't reset webSearchEnabled - let it persist until user toggles it off
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            className={`w-full relative group z-0 ${variant === 'default'
                ? 'rounded-[17px] p-[5px]'
                : 'bg-transparent'
                } ${className}`}
            style={variant === 'default' ? {
                background: 'radial-gradient(144.11% 100% at 50% 0%, rgba(247, 249, 250, 0.99) 0%, rgba(234, 236, 241, 0.8) 100%)',
                boxShadow: 'rgba(246, 241, 241, 0.97) 0px 1.5px 0px 0px inset, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px'
            } : undefined}
        >
            {/* Inner White Card (The Actual Input Surface) */}
            <div
                className={`relative z-10 w-full flex flex-col bg-white transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[rgba(0,0,0,0.07)] border-[rgba(0,0,0,0.05)] focus-within:border-[rgba(0,0,0,0.08)] ${variant === 'default' ? 'rounded-[14px] border' : 'rounded-[14px] md:rounded-[18px]'}`}
                style={variant === 'default' ? {
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 10px 0px'
                } : undefined}
            >
                {/* Header - Model Picker for default variant, nothing for embedded */}
                {variant === 'default' && (
                    <div className="px-3 py-1.5 border-b border-slate-100/50 flex items-center justify-between bg-white/50 backdrop-blur-[2px] rounded-t-[14px]">
                        <div className="flex items-center gap-2">
                            <ModelPicker
                                selectedModel={selectedModel}
                                onSelectModel={(model) => onModelChange?.(model)}
                                size='small'
                            />
                            {isElevenLabsConfigured() && <VoicePicker size="small" />}
                        </div>
                        <div className="hidden md:block">
                            <InfoPill variant="white" size="sm">Voice Update is here</InfoPill>
                        </div>
                    </div>
                )}

                {/* Text Area and Attachments Preview */}
                <div className="flex flex-col">
                    {/* Attachments Preview Area - Horizontal compact layout */}
                    <AnimatePresence initial={false} mode="sync">
                        {attachments.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
                                animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                                exit={{ height: 0, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.15 } }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.25, 1, 0.20, 1],
                                    height: { duration: 0.2 },
                                    filter: { duration: 0.25 }
                                }}
                                className="overflow-hidden"
                            >
                                <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
                                    {attachments.map((att, index) => (
                                        <motion.div
                                            key={att.id}
                                            initial={{
                                                opacity: 0,
                                                y: 8,
                                                scale: 0.9,
                                                filter: 'blur(12px)'
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                filter: 'blur(0px)',
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                                filter: 'blur(8px)',
                                                transition: { duration: 0.2 }
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 20,
                                                delay: index * 0.08,
                                                filter: { duration: 0.35, delay: index * 0.08 }
                                            }}
                                            className="relative group"
                                        >
                                            <div
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200/60 bg-slate-50/80 hover:bg-slate-100/80 transition-all duration-150"
                                                style={{
                                                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
                                                }}
                                            >
                                                {att.type === 'image' ? (
                                                    <LazyImage
                                                        src={att.url}
                                                        alt={att.name}
                                                        className="h-5 w-5 object-cover rounded shrink-0"
                                                        width={20}
                                                        height={20}
                                                    />
                                                ) : (
                                                    <FileText size={14} className="text-slate-400 shrink-0" />
                                                )}
                                                <span className="text-[10px] text-slate-600 font-medium truncate max-w-[100px]">{att.name}</span>
                                                <button
                                                    onClick={() => removeAttachment(att.id)}
                                                    className="ml-0.5 p-0.5 rounded hover:bg-slate-200/80 transition-colors"
                                                >
                                                    <X size={10} className="text-slate-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text Area Container */}
                    <div className="p-0.5 px-3 flex items-start gap-3">
                        {!input && (
                            <div className="mt-2.5 text-slate-400">
                                <Ufo3Outline width={20} height={20} />
                            </div>
                        )}
                        <div className="relative flex-1">
                            {!input && (
                                <div className="absolute inset-0 pointer-events-none select-none text-slate-400 text-sm leading-relaxed py-2 md:py-2.5 flex items-start gap-1">
                                    <span>Ask</span>
                                    <span style={{ fontFamily: '"Instrument Serif", serif', fontSize: '1.4rem', fontStyle: 'italic', lineHeight: '1', display: 'inline-block', transform: 'translateY(-1px)', color: '#94a3b8' }}>Zeta</span>
                                    <span>Assistant...</span>
                                </div>
                            )}
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={disabled}
                                className={`w-full resize-none outline-none text-slate-700 bg-transparent text-sm leading-relaxed py-2 md:py-2.5 max-h-[200px] overflow-y-auto scrollbar-hide ${variant === 'embedded' ? 'min-h-[60px]' : 'min-h-[40px]'
                                    }`}
                                rows={variant === 'embedded' ? 2 : 1}
                            />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div
                    className="px-3 pb-[0.475rem] sm:pb-1.5 mt-1 flex items-center justify-between"
                >
                    <div className="flex items-center space-x-1 relative">
                        {/* Plus Button with Menu Trigger */}
                        <div className="relative" ref={menuContainerRef}>
                            {isMenuOpen && createPortal(
                                <AnimatePresence>
                                    {/* Invisible Backdrop for Click-Outside */}
                                    <motion.div
                                        key="menu-backdrop"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="fixed inset-0 z-[9998]"
                                    />
                                    {/* Menu */}
                                    <motion.div
                                        key="plus-menu-content"
                                        initial={{
                                            opacity: 0,
                                            scale: 0.95,
                                            y: menuPlacement === 'bottom' ? -8 : 8,
                                            filter: 'blur(8px)'
                                        }}
                                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.95,
                                            y: menuPlacement === 'bottom' ? -8 : 8,
                                            filter: 'blur(4px)'
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        style={{
                                            position: 'fixed',
                                            left: menuPosition.x,
                                            ...(menuPlacement === 'bottom'
                                                ? { top: menuPosition.y + 8 }
                                                : { top: 'auto', bottom: window.innerHeight - menuPosition.y + 8 }
                                            ),
                                            zIndex: 9999,
                                        }}
                                        className="p-1.5 bg-gradient-to-br from-white via-[#fafafa] to-slate-50 backdrop-blur-xl rounded-xl border border-slate-200/60 min-w-[160px]"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 text-left group/item text-slate-500 hover:bg-slate-50/80">
                                                <Paperclip size={14} className="text-slate-400" />
                                                <span className="text-[11px] font-medium">Upload File</span>
                                            </button>
                                            <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 text-left group/item text-slate-500 hover:bg-slate-50/80">
                                                <ImageIcon size={14} className="text-slate-400" />
                                                <span className="text-[11px] font-medium">Upload Image</span>
                                            </button>
                                            <button onClick={() => docInputRef.current?.click()} className="flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 text-left group/item text-slate-500 hover:bg-slate-50/80">
                                                <FileText size={14} className="text-slate-400" />
                                                <span className="text-[11px] font-medium">Document</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>,
                                document.body
                            )}
                            <button
                                {...createTapHandler(toggleMenu)}
                                className={`
                                    w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-xl transition-colors duration-200 group touch-manipulation
                                    ${isMenuOpen
                                        ? 'bg-gradient-to-br from-white via-white to-slate-100 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] border-slate-300/60 text-blue-600'
                                        : 'text-slate-400 hover:text-blue-600 bg-slate-50/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(0,0,0,0.04),0_1px_0_rgba(255,255,255,0.8)] border-slate-200/40'
                                    }
                                    border active:scale-95
                                `}
                            >
                                <Plus
                                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`}
                                    strokeWidth={2.5}
                                />
                            </button>
                        </div>

                        <div className="h-3 w-[1px] bg-slate-200 mx-1"></div>

                        {/* Reasoning Toggle (Lightbulb) - Disabled for models that don't support thinking */}
                        {(() => {
                            const capabilities = getModelCapabilities(selectedModel.id);
                            const supportsThinking = capabilities?.supportsThinking ?? false;

                            if (!supportsThinking) {
                                // Disabled state for models that don't support reasoning
                                return (
                                    <div
                                        className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-xl border touch-manipulation text-slate-400 bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-slate-200/40 cursor-not-allowed"
                                        title="Reasoning not supported by this model"
                                    >
                                        <LightbulbLineDuotone className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                );
                            }

                            return (
                                <button
                                    {...createTapHandler(() => onReasoningToggle?.(!reasoningEnabled))}
                                    className={`
                                        w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-xl transition-colors duration-200 border touch-manipulation
                                        ${reasoningEnabled
                                            ? 'text-amber-500 bg-amber-50 shadow-[inset_0_2px_4px_rgba(245,158,11,0.15),0_0_8px_rgba(245,158,11,0.2)] border-amber-200/60'
                                            : 'text-slate-400 hover:text-amber-500 bg-slate-50/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(0,0,0,0.04),0_1px_0_rgba(255,255,255,0.8)] border-slate-200/40 hover:bg-amber-50 hover:border-amber-200/40'
                                        }
                                        active:scale-95
                                    `}
                                    title={reasoningEnabled ? "Reasoning enabled" : "Enable reasoning mode"}
                                >
                                    <LightbulbLineDuotone className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            );
                        })()}

                        {/* Web Search Toggle with Type Selector */}
                        <div className="relative flex items-center">
                            {/* Globe Button - Click to open menu (disabled for built-in tool models or models without tool support) */}
                            {(() => {
                                const capabilities = getModelCapabilities(selectedModel.id);
                                const supportsTools = capabilities?.supportsTools ?? false;

                                // If model doesn't support tools at all (like Routeway models)
                                if (!supportsTools) {
                                    return (
                                        <div
                                            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-xl gap-0.5 border touch-manipulation text-slate-400 bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-slate-200/40 cursor-not-allowed"
                                            title="Web search not supported by this model"
                                        >
                                            <GlobalLinear className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    );
                                }

                                // If model has built-in tools (like Groq Compound)
                                if (hasBuiltInTools(selectedModel.id)) {
                                    return (
                                        <div
                                            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-xl gap-0.5 border touch-manipulation text-blue-600 bg-blue-50 shadow-[inset_0_2px_4px_rgba(59,130,246,0.15)] border-blue-200/40 cursor-default"
                                            title="Built-in tools always enabled"
                                        >
                                            <GlobalLinear className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    );
                                }

                                // Normal interactive button for Exa-based models
                                return (
                                    <button
                                        ref={searchTypeButtonRef}
                                        {...createTapHandler(() => setIsSearchTypeMenuOpen(!isSearchTypeMenuOpen))}
                                        className={`
                                            w-7 h-7 md:w-9 md:h-9 flex items-center justify-center transition-colors duration-200 rounded-xl gap-0.5 border touch-manipulation
                                            ${isSearchTypeMenuOpen
                                                ? 'bg-gradient-to-br from-white via-white to-slate-100 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] border-slate-300/60'
                                                : webSearchEnabled
                                                    ? `${searchType === 'fast' ? 'text-emerald-600 bg-emerald-50 shadow-[inset_0_2px_4px_rgba(16,185,129,0.15)] border-emerald-200/40' : searchType === 'deep' ? 'text-violet-600 bg-violet-50 shadow-[inset_0_2px_4px_rgba(139,92,246,0.15)] border-violet-200/40' : 'text-blue-600 bg-blue-50 shadow-[inset_0_2px_4px_rgba(59,130,246,0.15)] border-blue-200/40'}`
                                                    : 'text-slate-400 hover:text-blue-500 bg-slate-50/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(0,0,0,0.04),0_1px_0_rgba(255,255,255,0.8)] border-slate-200/40 hover:bg-blue-50 hover:border-blue-200/40'
                                            }
                                            active:scale-95
                                        `}
                                        title="Web search options"
                                    >
                                        {webSearchEnabled
                                            ? getSearchTypeIcon(searchType, 16, true, true)
                                            : <GlobalLinear className="w-4 h-4 md:w-5 md:h-5" />
                                        }
                                    </button>
                                );
                            })()}
                        </div>

                        {/* Search Type Menu Portal - Outside the button container (only for non-built-in models) */}
                        {!hasBuiltInTools(selectedModel.id) && createPortal(
                            <AnimatePresence>
                                {isSearchTypeMenuOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <motion.div
                                            key="search-type-backdrop"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsSearchTypeMenuOpen(false)}
                                            className="fixed inset-0 z-[9998]"
                                        />
                                        {/* Menu */}
                                        <motion.div
                                            key="search-type-menu"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                                y: searchTypeMenuPlacement === 'bottom' ? -8 : 8,
                                                filter: 'blur(8px)'
                                            }}
                                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.95,
                                                y: searchTypeMenuPlacement === 'bottom' ? -8 : 8,
                                                filter: 'blur(4px)'
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="p-1 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] min-w-[200px]"
                                            style={{
                                                position: 'fixed',
                                                left: searchTypeMenuPosition.x,
                                                ...(searchTypeMenuPlacement === 'bottom'
                                                    ? { top: searchTypeMenuPosition.y + 8 }
                                                    : { top: 'auto', bottom: window.innerHeight - searchTypeMenuPosition.y + 8 }
                                                ),
                                                zIndex: 9999,
                                                transform: 'translateZ(0)',
                                                willChange: 'transform, opacity, filter',
                                                background: 'rgb(250, 250, 250)'
                                            }}
                                        >
                                            {/* Toggle Web Search On/Off */}
                                            <button
                                                onClick={() => {
                                                    onWebSearchToggle?.(!webSearchEnabled);
                                                }}
                                                className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 text-left mb-0.5 ${webSearchEnabled
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                                                    : 'text-slate-500 hover:bg-slate-50/80'
                                                    }`}
                                            >
                                                <div className={`w-8 h-5 rounded-full transition-all duration-300 relative flex items-center shrink-0 ${webSearchEnabled
                                                    ? 'bg-blue-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'
                                                    : 'bg-slate-200/50 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                                    }`}>
                                                    <div className={`absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center ${webSearchEnabled
                                                        ? 'translate-x-4 shadow-[0_2px_5px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]'
                                                        : 'translate-x-0.5 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)]'
                                                        }`}
                                                        style={{
                                                            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
                                                        }}
                                                    >
                                                        {/* Rim light highlight */}
                                                        <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-[11px] font-bold leading-none mb-0.5 ${webSearchEnabled ? 'text-blue-500' : 'text-slate-400'}`}>{webSearchEnabled ? 'Deep Search Enabled' : 'Search Disabled'}</span>
                                                    <span className="text-[9px] text-slate-400 leading-none">Toggle live web access</span>
                                                </div>
                                            </button>

                                            <div className="space-y-1">
                                                {(Object.keys(SEARCH_TYPES) as Array<'auto' | 'fast' | 'deep'>).map((type) => {
                                                    const config = SEARCH_TYPES[type];
                                                    const isSelected = searchType === type;
                                                    const variants = {
                                                        auto: {
                                                            selected: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1)]',
                                                            hover: 'hover:bg-blue-50/60 hover:text-blue-600',
                                                            iconBg: 'bg-transparent',
                                                            activeDot: 'bg-blue-500'
                                                        },
                                                        fast: {
                                                            selected: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(16,185,129,0.1)]',
                                                            hover: 'hover:bg-emerald-50/60 hover:text-emerald-600',
                                                            iconBg: 'bg-transparent',
                                                            activeDot: 'bg-emerald-500'
                                                        },
                                                        deep: {
                                                            selected: 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(139,92,246,0.1)]',
                                                            hover: 'hover:bg-violet-50/60 hover:text-violet-600',
                                                            iconBg: 'bg-transparent',
                                                            activeDot: 'bg-violet-500'
                                                        }
                                                    };

                                                    const currentVariant = variants[type];

                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                onSearchTypeChange?.(type);
                                                                if (!webSearchEnabled) {
                                                                    onWebSearchToggle?.(true);
                                                                }
                                                                setIsSearchTypeMenuOpen(false);
                                                            }}
                                                            className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-300 text-left group/item relative ${isSelected && webSearchEnabled
                                                                ? currentVariant.selected + ' shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                                                                : `text-slate-500 hover:bg-slate-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)] ${currentVariant.hover}`
                                                                }`}
                                                        >
                                                            <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)]">
                                                                <div
                                                                    className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center"
                                                                    style={{
                                                                        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                    }}
                                                                >
                                                                    {getSearchTypeIcon(type, 12)}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-[11px] font-bold truncate leading-tight">{config.label}</div>
                                                                <div className="text-[9px] text-slate-400 truncate tracking-tight">{config.description}</div>
                                                            </div>
                                                            {isSelected && webSearchEnabled && (
                                                                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.1)] ${currentVariant.activeDot}`} />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>,
                            document.body
                        )}

                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,application/pdf"
                            onChange={(e) => handleFileSelect(e, 'file')}
                        />
                        <input
                            type="file"
                            ref={imageInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            multiple
                            onChange={(e) => handleFileSelect(e, 'image')}
                        />
                        <input
                            type="file"
                            ref={docInputRef}
                            className="hidden"
                            accept=".docx,.xlsx,.doc,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.ms-excel"
                            onChange={(e) => handleFileSelect(e, 'doc')}
                        />
                    </div>

                    {/* Send Button Container - with shine border wrapper when loading */}
                    <div className="flex items-center gap-2">
                        {/* Voice Recording Button */}
                        {isVoiceSupported && (
                            <div className="relative">
                                {/* Recording pulse animation */}
                                {voiceState === 'recording' && (
                                    <div className="absolute inset-0 rounded-full bg-red-200/20 animate-ping" />
                                )}

                                <button
                                    onClick={async () => {
                                        if (voiceState === 'idle') {
                                            await startRecording();
                                        } else if (voiceState === 'recording') {
                                            await stopRecording();
                                        }
                                    }}
                                    disabled={disabled || voiceState === 'processing'}
                                    className={`
                                        relative w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all duration-300 overflow-hidden group/voice
                                        ${voiceState === 'recording'
                                            ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(239,68,68,1)] active:scale-[0.96]'
                                            : voiceState === 'processing'
                                                ? 'bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] cursor-wait'
                                                : 'bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(239,68,68,1)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(239,68,68,1)] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] active:scale-[0.96] active:translate-y-0.5'
                                        }
                                    `}
                                    title={
                                        voiceState === 'recording'
                                            ? `Recording... ${recordingDuration}s (click to stop)`
                                            : voiceState === 'processing'
                                                ? 'Transcribing...'
                                                : 'Voice input'
                                    }
                                >
                                    {voiceState === 'recording' ? (
                                        <Square size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" />
                                    ) : voiceState === 'processing' ? (
                                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Mic className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
                                    )}
                                </button>

                                {/* Recording duration badge */}
                                {voiceState === 'recording' && (
                                    <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                                        {recordingDuration}s
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Separator between voice and send */}
                        {isVoiceSupported && (
                            <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-slate-300 to-transparent mx-1" />
                        )}

                        {/* Send Button Container - with shine border wrapper when loading */}
                        <div className="relative">
                            {/* Animated Shine Border (only when loading) */}
                            {disabled && (
                                <>
                                    <div
                                        className="absolute inset-[-2px] rounded-full overflow-hidden"
                                    >
                                        <div
                                            className="absolute inset-[-100%]"
                                            style={{
                                                background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 60deg, #598de0ff 120deg, #60A5FA 180deg, #3b83f6e4 240deg, transparent 300deg, transparent 360deg)',
                                                animation: 'spin 2s linear infinite'
                                            }}
                                        />
                                    </div>
                                    {/* Glow effect behind */}
                                    <div
                                        className="absolute inset-[-4px] rounded-full blur-md opacity-50"
                                        style={{
                                            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 60deg, #598de0ff 120deg, #60A5FA 180deg, #3B82F6 240deg, transparent 300deg, transparent 360deg)',
                                            animation: 'spin 2s linear infinite'
                                        }}
                                    />
                                </>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={(!input.trim() && attachments.length === 0) || disabled}
                                className={`
                                relative w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full transition-all duration-300 overflow-hidden group/btn
                                ${(input.trim() || attachments.length > 0) && !disabled
                                        ? 'bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(59,130,246,1)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(59,130,246,1)] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] active:scale-[0.96] active:translate-y-0.5'
                                        : 'bg-slate-100 text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'
                                    }
                            `}
                            >
                                {/* Reflection Shine Overlay - Adjusted to top */}
                                {(input.trim() || attachments.length > 0) && !disabled && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-transparent opacity-100 pointer-events-none rounded-full -top-1" />
                                )}

                                {/* Top Edge Highlight (Rim Light) - Nudged to the absolute top */}
                                {(input.trim() || attachments.length > 0) && !disabled && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-white/50 blur-[0.4px] rounded-full pointer-events-none z-20" />
                                )}

                                <Send
                                    className={`w-3 h-3 md:w-3.5 md:h-3.5 relative z-10 transition-transform duration-300 ${(input.trim() || attachments.length > 0) && !disabled ? "ml-0.5 group-hover/btn:scale-110" : ""}`}
                                    fill={(input.trim() || attachments.length > 0) && !disabled ? "currentColor" : "none"}
                                />
                            </button>
                        </div>
                    </div>
                </div>
                {/* Close Inner Content Container */}
            </div >
        </div >
    );
};

export default ChatInput;
