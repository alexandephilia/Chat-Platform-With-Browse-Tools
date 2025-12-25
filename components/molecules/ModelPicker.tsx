import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AIModel, AVAILABLE_MODELS, ModelProvider, PROVIDER_ICONS } from '../../services/modelConfig';
import { LazyImage } from '../atoms/LazyImage';
import { StatusPill } from '../atoms/StatusPill';

// Re-export types and models for backward compatibility
export { AVAILABLE_MODELS };
export type { AIModel, ModelProvider };

interface ProviderInfo {
    id: ModelProvider | string;
    label: string;
    icon: string;
    models: AIModel[];
}

interface ModelPickerProps {
    selectedModel: AIModel;
    onSelectModel: (model: AIModel) => void;
    size?: 'default' | 'small';
    menuAlign?: 'left' | 'right';
}

const ModelPicker: React.FC<ModelPickerProps> = ({
    selectedModel,
    onSelectModel,
    size = 'default',
    menuAlign = 'left'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeProvider, setActiveProvider] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, placement: 'bottom' as 'top' | 'bottom' });
    const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const providerItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Group models by provider
    const providers = useMemo<ProviderInfo[]>(() => {
        const providerMap = new Map<string, ProviderInfo>();

        AVAILABLE_MODELS.forEach(model => {
            const key = model.providerLabel;
            if (!providerMap.has(key)) {
                providerMap.set(key, {
                    id: model.provider,
                    label: model.providerLabel,
                    icon: PROVIDER_ICONS[model.providerLabel] || '',
                    models: []
                });
            }
            providerMap.get(key)!.models.push(model);
        });

        return Array.from(providerMap.values());
    }, []);

    const handleOpen = useCallback(() => {
        if (!triggerRef.current) return;

        // Calculate position immediately before state update
        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = 160;
        const menuWidth = 160;
        const padding = 12;

        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const placement: 'top' | 'bottom' = spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

        let x: number;
        if (menuAlign === 'right') {
            x = rect.right - menuWidth;
        } else {
            x = rect.left;
        }

        if (x + menuWidth > window.innerWidth - padding) {
            x = Math.max(padding, window.innerWidth - menuWidth - padding);
        }
        if (x < padding) {
            x = padding;
        }

        const newPosition = {
            x,
            y: placement === 'bottom' ? rect.bottom + 4 : rect.top - 4,
            placement
        };

        // Set position immediately, then open
        setMenuPosition(newPosition);
        setIsOpen(true);
    }, [menuAlign]);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !isOpen) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuHeight = 160;
        const menuWidth = 160;
        const padding = 12;

        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const placement: 'top' | 'bottom' = spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

        let x: number;
        if (menuAlign === 'right') {
            x = rect.right - menuWidth;
        } else {
            x = rect.left;
        }

        if (x + menuWidth > window.innerWidth - padding) {
            x = Math.max(padding, window.innerWidth - menuWidth - padding);
        }
        if (x < padding) {
            x = padding;
        }

        setMenuPosition({
            x,
            y: placement === 'bottom' ? rect.bottom + 4 : rect.top - 4,
            placement
        });
    }, [menuAlign, isOpen]);

    const calculateSubmenuPosition = useCallback((providerLabel: string) => {
        const providerEl = providerItemRefs.current.get(providerLabel);
        if (!providerEl) return;

        const rect = providerEl.getBoundingClientRect();
        const submenuWidth = 180;
        const padding = 8;

        let x = rect.right + 4;

        if (x + submenuWidth > window.innerWidth - padding) {
            x = rect.left - submenuWidth - 4;
        }

        setSubmenuPosition({
            x,
            y: rect.top - 4
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('resize', calculatePosition);
            window.addEventListener('scroll', calculatePosition, true);
            return () => {
                window.removeEventListener('resize', calculatePosition);
                window.removeEventListener('scroll', calculatePosition, true);
            };
        }
    }, [isOpen, calculatePosition]);

    useEffect(() => {
        if (activeProvider) {
            calculateSubmenuPosition(activeProvider);
        }
    }, [activeProvider, calculateSubmenuPosition]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const handleSelectModel = useCallback((model: AIModel) => {
        onSelectModel(model);
        setIsOpen(false);
        setActiveProvider(null);
    }, [onSelectModel]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setActiveProvider(null);
    }, []);

    // Delayed close for submenu - allows moving between provider and submenu
    const handleSubmenuMouseLeave = useCallback(() => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveProvider(null);
        }, 100);
    }, []);

    const handleSubmenuMouseEnter = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, []);

    const handleProviderMouseEnter = useCallback((providerLabel: string) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setActiveProvider(providerLabel);
    }, []);

    const isSmall = size === 'small';

    return (
        <>
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                className={`
                    flex items-center transition-all duration-300 group relative
                    ${isSmall
                        ? 'gap-1 px-1.5 py-0.5 rounded-md'
                        : 'gap-1.5 px-2 py-1 rounded-lg'
                    }
                    ${isOpen
                        ? 'bg-gradient-to-br from-white via-white to-slate-100 shadow-[0_2px_6px_-1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] border-slate-200/80'
                        : 'bg-slate-50/50 shadow-[inset_0_1px_3px_rgb(0_0_0_/_18%),_0_1px_0_rgba(255,255,255,0.8)] border-slate-200/40'
                    }
                    border hover:border-slate-300/60
                    active:scale-[0.98]
                `}
            >
                <div className={`
                    flex items-center justify-center rounded overflow-hidden bg-slate-100
                    ${isSmall ? 'w-3.5 h-3.5' : 'w-5 h-5'}
                    shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]
                `}>
                    <LazyImage
                        src={selectedModel.icon}
                        alt={selectedModel.name}
                        className={`object-contain ${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`}
                        width={isSmall ? 12 : 16}
                        height={isSmall ? 12 : 16}
                    />
                </div>

                <span className={`font-medium text-slate-600 leading-tight truncate ${isSmall ? 'text-[9px] max-w-[60px]' : 'text-[10px] max-w-[80px]'}`}>
                    {selectedModel.name}
                </span>

                <ChevronDown
                    size={isSmall ? 8 : 10}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu - Portal */}
            {createPortal(
                <AnimatePresence mode="sync">
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="model-picker-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                onClick={handleClose}
                                className="fixed inset-0 z-[9998]"
                            />

                            {/* Provider Menu */}
                            <motion.div
                                key="model-picker-menu"
                                initial={{ opacity: 0, scale: 0.95, y: menuPosition.placement === 'bottom' ? -6 : 6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: menuPosition.placement === 'bottom' ? -6 : 6 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'fixed',
                                    left: menuPosition.x,
                                    ...(menuPosition.placement === 'bottom'
                                        ? { top: menuPosition.y }
                                        : { bottom: window.innerHeight - menuPosition.y }
                                    ),
                                    zIndex: 9999,
                                    transform: 'translateZ(0)',
                                    willChange: 'transform, opacity',
                                    background: 'rgb(250, 250, 250)'
                                }}
                                className="w-[160px] p-1 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
                            >
                                <div className="px-2 py-0.2 mb-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                                        Provider
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {providers.map((provider) => {
                                        const isActive = activeProvider === provider.label;
                                        const hasSelectedModel = provider.models.some(m => m.id === selectedModel.id);

                                        return (
                                            <button
                                                key={provider.label}
                                                ref={(el) => {
                                                    if (el) providerItemRefs.current.set(provider.label, el);
                                                }}
                                                onMouseEnter={() => handleProviderMouseEnter(provider.label)}
                                                onClick={() => setActiveProvider(provider.label)}
                                                className={`
                                                    w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                    transition-all duration-300 group/item relative
                                                    ${isActive
                                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                                                        : 'text-slate-500 hover:bg-slate-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]'
                                                    }
                                                `}
                                            >
                                                {provider.icon ? (
                                                    <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)]">
                                                        <div
                                                            className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center"
                                                            style={{
                                                                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                                                                boxShadow: '0_2px_4px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)'
                                                            }}
                                                        >
                                                            <LazyImage
                                                                src={provider.icon}
                                                                alt={provider.label}
                                                                className="w-3.5 h-3.5 object-contain"
                                                                width={14}
                                                                height={14}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)]">
                                                        <div
                                                            className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center text-[8px] font-bold"
                                                            style={{
                                                                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                                                                boxShadow: '0_2px_4px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)',
                                                                color: hasSelectedModel ? '#2563eb' : '#64748b'
                                                            }}
                                                        >
                                                            {provider.label.charAt(0)}
                                                        </div>
                                                    </div>
                                                )}

                                                <span className={`flex-1 text-[11px] font-medium text-left ${hasSelectedModel ? 'text-blue-600' : 'text-slate-700'}`}>
                                                    {provider.label}
                                                </span>

                                                <ChevronRight size={10} className="text-slate-400" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Model Submenu */}
                            {activeProvider && (
                                <motion.div
                                    key={`model-submenu-${activeProvider}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                        position: 'fixed',
                                        left: submenuPosition.x,
                                        top: submenuPosition.y,
                                        zIndex: 10000,
                                        transform: 'translateZ(0)',
                                        willChange: 'transform, opacity',
                                        background: 'rgb(250, 250, 250)'
                                    }}
                                    className="w-[180px] p-1 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
                                    onMouseEnter={handleSubmenuMouseEnter}
                                    onMouseLeave={handleSubmenuMouseLeave}
                                >
                                    <div className="space-y-1">
                                        {providers
                                            .find(p => p.label === activeProvider)
                                            ?.models.map((model) => {
                                                const isSelected = model.id === selectedModel.id;

                                                return (
                                                    <button
                                                        key={model.id}
                                                        onClick={() => handleSelectModel(model)}
                                                        className={`
                                                            w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                            transition-all duration-300 group/item
                                                            ${isSelected
                                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(59,130,246,0.1),0_0_0_1px_rgba(59,130,246,0.05)]'
                                                                : 'text-slate-500 hover:bg-slate-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.03),0_0_0_1px_rgba(0,0,0,0.02)]'
                                                            }
                                                        `}
                                                    >
                                                        <div className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center shrink-0 shadow-[inset_0_2px_3px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)]">
                                                            <div
                                                                className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 transform flex items-center justify-center"
                                                                style={{
                                                                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                                                                    boxShadow: '0_2px_4px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)'
                                                                }}
                                                            >
                                                                <LazyImage
                                                                    src={model.icon}
                                                                    alt={model.name}
                                                                    className="w-3.5 h-3.5 object-contain"
                                                                    width={14}
                                                                    height={14}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 flex flex-col items-start min-w-0">
                                                            <div className="flex items-center gap-1">
                                                                <span className={`text-[11px] font-medium truncate ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                                                                    {model.name}
                                                                </span>
                                                                {model.isFree ? (
                                                                    <StatusPill variant="free">
                                                                        Free
                                                                    </StatusPill>
                                                                ) : (
                                                                    <StatusPill variant="pro">
                                                                        Pro
                                                                    </StatusPill>
                                                                )}
                                                            </div>
                                                            <span className="text-[8px] text-slate-400 truncate w-full text-left">
                                                                {model.description}
                                                            </span>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_1px_3px_rgba(147,197,253,0.4),0_0.5px_1px_rgba(147,197,253,0.6)] opacity-90">
                                                                <Check size={8} className="text-white drop-shadow-[0_0.8px_1px_rgba(0,0,0,0.4)]" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default memo(ModelPicker);
