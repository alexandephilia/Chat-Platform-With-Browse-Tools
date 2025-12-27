import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AIModel, AVAILABLE_MODELS, ModelProvider } from '../../services/modelConfig';
import { ModelIcon, ProviderIcon, ProviderIconKey } from '../../services/modelIcons';
import { menuContainerVariants, menuItemVariants } from '../../utils/menuAnimations';
import { StatusPill } from '../atoms/StatusPill';

// Re-export types and models for backward compatibility
export { AVAILABLE_MODELS };
export type { AIModel, ModelProvider };

interface ProviderInfo {
    id: ModelProvider | string;
    label: string;
    iconKey: ProviderIconKey;
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
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);
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
                    iconKey: model.providerIcon,
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
        setMenuPosition(null);
        setSubmenuPosition(null);
    }, []);

    // Delayed close for submenu - allows moving between provider and submenu
    const handleSubmenuMouseLeave = useCallback(() => {
        closeTimeoutRef.current = setTimeout(() => {
            setActiveProvider(null);
            setSubmenuPosition(null);
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
                    flex items-center justify-center rounded-full overflow-hidden
                    ${isSmall ? 'w-5 h-5' : 'w-7 h-7'}
                    shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),_0_1px_0_rgba(255,255,255,0.5)] bg-gradient-to-b from-slate-50 to-slate-100
                `}>
                    <span style={{ flex: '0 0 auto', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ModelIcon
                            iconKey={selectedModel.icon}
                            size={isSmall ? 14 : 20}
                        />
                    </span>
                </div>

                <span className={`font-medium text-slate-600 leading-tight truncate ${isSmall ? 'text-[9px] max-w-[90px]' : 'text-[10px] max-w-[110px]'}`}>
                    {selectedModel.name}
                </span>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={isSmall ? "8" : "10"}
                    height={isSmall ? "8" : "10"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`lucide lucide-chevron-down text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                >
                    <path d="m6 9 6 6 6-6"></path>
                </svg>
            </button>

            {/* Dropdown Menu - Portal */}
            {createPortal(
                <AnimatePresence mode="sync">
                    {isOpen && menuPosition && (
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
                                variants={menuContainerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={{
                                    position: 'fixed',
                                    left: menuPosition.x,
                                    ...(menuPosition.placement === 'bottom'
                                        ? { top: menuPosition.y }
                                        : { bottom: window.innerHeight - menuPosition.y }
                                    ),
                                    transformOrigin: menuPosition.placement === 'bottom' ? 'top left' : 'bottom left',
                                    zIndex: 9999,
                                }}
                                className="w-[160px] p-1 bg-gradient-to-br from-white via-[#fafafa] to-slate-50 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
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
                                            <motion.button
                                                variants={menuItemVariants}
                                                key={provider.label}
                                                ref={(el) => {
                                                    if (el) providerItemRefs.current.set(provider.label, el);
                                                }}
                                                onMouseEnter={() => handleProviderMouseEnter(provider.label)}
                                                onClick={() => setActiveProvider(provider.label)}
                                                className={`
                                                    w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                    transition-colors duration-200 group/item relative
                                                    ${isActive
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
                                                        <ProviderIcon
                                                            iconKey={provider.iconKey}
                                                            size={18}
                                                        />
                                                    </div>
                                                </div>

                                                <span className={`flex-1 text-[11px] font-medium text-left ${hasSelectedModel ? 'text-blue-600' : 'text-slate-700'}`}>
                                                    {provider.label}
                                                </span>

                                                <ChevronRight size={10} className="text-slate-400" />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Model Submenu */}
                            {activeProvider && submenuPosition && (
                                <motion.div
                                    key={`model-submenu-${activeProvider}`}
                                    variants={menuContainerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        position: 'fixed',
                                        left: submenuPosition.x,
                                        top: submenuPosition.y,
                                        zIndex: 10000,
                                    }}
                                    className="w-[180px] p-1 bg-gradient-to-br from-white via-[#fafafa] to-slate-50 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
                                    onMouseEnter={handleSubmenuMouseEnter}
                                    onMouseLeave={handleSubmenuMouseLeave}
                                >
                                    <div className="space-y-1">
                                        {providers
                                            .find(p => p.label === activeProvider)
                                            ?.models.map((model) => {
                                                const isSelected = model.id === selectedModel.id;

                                                return (
                                                    <motion.button
                                                        variants={menuItemVariants}
                                                        key={model.id}
                                                        onClick={() => handleSelectModel(model)}
                                                        className={`
                                                            w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                            transition-colors duration-200 group/item
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
                                                                <ModelIcon
                                                                    iconKey={model.icon}
                                                                    size={18}
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
                                                            <div className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_1px_3px_rgba(37,99,235,0.5),0_0.5px_1px_rgba(37,99,235,0.6)]">
                                                                <Check size={8} className="text-white drop-shadow-[0_0.8px_1px_rgba(0,0,0,0.5)]" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </motion.button>
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
