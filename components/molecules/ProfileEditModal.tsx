import { AnimatePresence, motion, PanInfo, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Camera, Check, Globe2, Pencil, UserCircle, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../contexts/AuthContext';
import getCroppedImg from '../../utils/cropImage';

// Custom BlackHole icon for profile
const BlackHoleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
        <g fill="currentColor">
            <path d="M12.735 14.654a.75.75 0 0 1-.23-1.44c.224-.094.441-.237.645-.44a.75.75 0 0 1 .996-.058a.751.751 0 0 1 .705.954c-.21.746-.6 1.477-1.105 2.147a.75.75 0 0 1-1.197-.903c.065-.087.127-.173.186-.26Zm-2.248.041a.75.75 0 0 0 .953-.707a.75.75 0 0 0-.058-.994a2.017 2.017 0 0 1-.442-.646a.75.75 0 0 0-1.438.23a6.448 6.448 0 0 1-.26-.186a.75.75 0 0 0-.903 1.198c.67.505 1.4.894 2.148 1.105Zm-3.811-2.749a.75.75 0 0 0 1.18-.925a7.882 7.882 0 0 1-1.01-1.677a.75.75 0 1 0-1.372.604c.317.72.728 1.394 1.202 1.998ZM4.84 7.672a.75.75 0 0 0 1.49-.178a5.115 5.115 0 0 1 .108-1.862a.75.75 0 0 0-1.454-.366a6.615 6.615 0 0 0-.144 2.406ZM6.008 3.08a.75.75 0 1 0 1.218.875c.177-.246.383-.49.62-.727a.75.75 0 0 0-1.06-1.061a7.396 7.396 0 0 0-.778.912Zm5.755 6.006a6.492 6.492 0 0 0-.187.26a.75.75 0 0 1 .23 1.439a2.018 2.018 0 0 0-.645.441a.75.75 0 0 1-.995.058a.752.752 0 0 1-.706-.954c.211-.746.6-1.477 1.105-2.147a.75.75 0 0 1 1.198.903Zm2.062.219a.75.75 0 0 0-.954.707a.75.75 0 0 0 .059.994c.204.204.347.421.441.645a.75.75 0 0 0 1.439-.23c.086.06.173.122.26.187a.75.75 0 0 0 .902-1.198c-.67-.505-1.4-.894-2.147-1.105Zm3.81 2.749a.75.75 0 1 0-1.18.925c.4.511.746 1.079 1.01 1.677a.75.75 0 0 0 1.372-.604a9.379 9.379 0 0 0-1.202-1.998Zm1.836 4.274a.75.75 0 1 0-1.489.178a5.114 5.114 0 0 1-.109 1.862a.75.75 0 0 0 1.455.366a6.612 6.612 0 0 0 .143-2.406Zm-1.168 4.592a.75.75 0 0 0-1.218-.875a5.9 5.9 0 0 1-.62.727a.75.75 0 0 0 1.06 1.06c.294-.292.553-.597.779-.911ZM12.082 7.573a.75.75 0 0 1 .127-1.053a9.384 9.384 0 0 1 1.998-1.202a.75.75 0 0 1 .604 1.373a7.881 7.881 0 0 0-1.677 1.01a.75.75 0 0 1-1.053-.128Zm3.746-2.056a.75.75 0 0 1 .655-.833a6.615 6.615 0 0 1 2.406.143a.75.75 0 1 1-.366 1.455a5.115 5.115 0 0 0-1.862-.109a.75.75 0 0 1-.834-.656Zm4.202.506a.75.75 0 0 1 1.046-.171c.314.226.619.485.912.778a.75.75 0 1 1-1.06 1.06a5.888 5.888 0 0 0-.728-.62a.75.75 0 0 1-.17-1.047ZM12.102 17.48a.75.75 0 0 0-.925-1.18A7.92 7.92 0 0 1 9.5 17.31a.75.75 0 1 0 .604 1.372a9.382 9.382 0 0 0 1.998-1.202Zm-4.274 1.836a.75.75 0 1 0-.178-1.49a5.119 5.119 0 0 1-1.862-.108a.75.75 0 1 0-.366 1.454a6.612 6.612 0 0 0 2.406.144Zm-4.592-1.168a.75.75 0 1 0 .875-1.218a5.9 5.9 0 0 1-.727-.62a.75.75 0 0 0-1.06 1.06c.292.293.597.552.912.778Z" opacity=".5"></path>
            <path d="M8.928 12.453c.406.836 1.016 1.541 1.825 1.942c-.793.183-1.71.22-2.648.087C5.315 14.087 2.75 12.284 2.75 9a.75.75 0 0 0-1.5 0c0 4.316 3.436 6.513 6.645 6.968c1.612.228 3.27.042 4.558-.584c.868-.422 1.596-1.065 1.988-1.921c.142.741.162 1.578.041 2.432c-.395 2.79-2.198 5.355-5.482 5.355a.75.75 0 0 0 0 1.5c4.316 0 6.513-3.436 6.968-6.645c.228-1.612.042-3.27-.584-4.558c-.346-.712-.84-1.33-1.48-1.745a7.677 7.677 0 0 1 1.99.027c2.792.396 5.356 2.198 5.356 5.482a.75.75 0 0 0 1.5 0c0-4.315-3.436-6.512-6.645-6.967c-1.612-.228-3.27-.043-4.558.584c-.692.336-1.294.812-1.709 1.425a7.565 7.565 0 0 1-.009-2.248c.396-2.79 2.198-5.355 5.482-5.355a.75.75 0 0 0 0-1.5c-4.315 0-6.512 3.436-6.967 6.645c-.228 1.612-.043 3.27.584 4.558Z"></path>
        </g>
    </svg>
);

// Clay Button with outer rim and inset layers
interface ClayButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    className?: string;
}

const ClayButton: React.FC<ClayButtonProps> = ({ children, onClick, variant = 'secondary', disabled, className = '' }) => {
    const isPrimary = variant === 'primary';

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            className={`relative cursor-pointer select-none ${disabled ? 'pointer-events-none opacity-60' : ''} ${className}`}
            onClick={disabled ? undefined : onClick}
        >
            {/* Outer rim */}
            <div className={`p-[2px] rounded-xl ${isPrimary
                ? 'bg-gradient-to-b from-[rgb(70,130,180)] to-[rgb(30,75,115)]'
                : 'bg-gradient-to-b from-white to-slate-300'
                } shadow-[0_2px_6px_rgba(0,0,0,0.1)]`}>
                {/* Inset track */}
                <div className={`p-[1px] rounded-[10px] ${isPrimary
                    ? 'bg-[rgb(36,89,133)]/50'
                    : 'bg-slate-200/80'
                    } shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]`}>
                    {/* Inner button surface */}
                    <div className={`relative px-4 py-2 rounded-lg ${isPrimary
                        ? 'bg-gradient-to-b from-[rgb(50,110,160)] to-[rgb(36,89,133)] text-white'
                        : 'bg-gradient-to-b from-white to-slate-50 text-slate-600 hover:text-slate-700'
                        } shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]`}>
                        {/* Top highlight line */}
                        <div className={`absolute inset-x-0 top-0 h-[1px] ${isPrimary
                            ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
                            : 'bg-gradient-to-r from-transparent via-white/90 to-transparent'
                            }`} />
                        {/* Content */}
                        <span className="relative z-10 text-[13px] font-semibold flex items-center justify-center">{children}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Pending name - only saved when user clicks "Save"
    const [pendingName, setPendingName] = useState<string | null>(null);
    const dragY = useMotionValue(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Cropping State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    // Pending changes - only saved when user clicks "Done"
    const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

    // 3D Card tilt effect
    const cardRef = useRef<HTMLDivElement>(null);
    const rotateXRaw = useMotionValue(0);
    const rotateYRaw = useMotionValue(0);
    // Smooth spring animation for tilt
    const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 20 });
    const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 20 });

    // Track isMobile state - lock when modal opens
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            dragY.set(0);
            setFirstName(user?.firstName || '');
            setIsEditing(false);
            // Reset image state on open
            setImageSrc(null);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
            setPendingAvatar(null); // Reset pending avatar
            setPendingName(null); // Reset pending name
        }
    }, [isOpen, dragY, user?.firstName]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (isProcessingImage) return; // Prevent saving while processing image

        const trimmedName = firstName.trim();

        if (!trimmedName) {
            // Reset to pending name or original user name
            setIsEditing(false);
            setFirstName(pendingName || user?.firstName || '');
            return;
        }

        // Format the name
        const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();

        // Store as pending instead of saving immediately
        setPendingName(formattedName);
        setFirstName(formattedName);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            if (imageSrc) {
                setImageSrc(null); // Cancel crop on escape
            } else {
                setIsEditing(false);
                setFirstName(pendingName || user?.firstName || '');
            }
        }
    };

    const handleModalClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        // Prevent click from bubbling to outside elements if portal logic fails
        // but allow interaction within the modal
    }, []);

    const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
        // Disable drag to dismiss when cropping
        if (imageSrc) return;

        const shouldClose = info.velocity.y > 500 || (info.velocity.y >= 0 && info.offset.y > 150);
        if (shouldClose) {
            onClose();
        } else {
            dragY.set(0);
        }
    }, [onClose, dragY, imageSrc]);

    // 3D Card tilt handlers - responsive to corner/edge position
    const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Normalize position from -1 to 1
        const normalizedX = (x - centerX) / centerX;
        const normalizedY = (y - centerY) / centerY;

        // Calculate distance from center for intensity scaling
        const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        const intensity = Math.min(distance, 1); // Cap at 1

        // Stronger tilt at corners/edges - max 10 degrees
        const maxTilt = 10;
        const tiltX = -normalizedY * maxTilt * intensity;
        const tiltY = normalizedX * maxTilt * intensity;

        rotateXRaw.set(tiltX);
        rotateYRaw.set(tiltY);
    }, [rotateXRaw, rotateYRaw]);

    const handleCardMouseLeave = useCallback(() => {
        rotateXRaw.set(0);
        rotateYRaw.set(0);
    }, [rotateXRaw, rotateYRaw]);

    const handleCardTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (!cardRef.current || e.touches.length === 0) return;
        const touch = e.touches[0];
        const rect = cardRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Normalize position from -1 to 1
        const normalizedX = (x - centerX) / centerX;
        const normalizedY = (y - centerY) / centerY;

        // Calculate distance from center for intensity scaling
        const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        const intensity = Math.min(distance, 1);

        // Stronger tilt at corners/edges - max 10 degrees
        const maxTilt = 10;
        const tiltX = -normalizedY * maxTilt * intensity;
        const tiltY = normalizedX * maxTilt * intensity;

        rotateXRaw.set(tiltX);
        rotateYRaw.set(tiltY);
    }, [rotateXRaw, rotateYRaw]);

    const handleCardTouchEnd = useCallback(() => {
        rotateXRaw.set(0);
        rotateYRaw.set(0);
    }, [rotateXRaw, rotateYRaw]);

    // Image Upload Handlers
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                // Reset file input so same file can be selected again if needed
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const saveCroppedImage = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsProcessingImage(true);
        try {
            const croppedImageBase64 = await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            );

            // Store in pending state instead of saving immediately
            setPendingAvatar(croppedImageBase64);
            setImageSrc(null); // Close cropper
        } catch (e) {
            console.error('Failed to crop image', e);
        } finally {
            setIsProcessingImage(false);
        }
    }, [imageSrc, croppedAreaPixels]);

    // Handle Save button - save all pending changes
    const handleDone = useCallback(() => {
        // Build updates object with all pending changes
        const updates: { firstName?: string; avatar?: string } = {};

        if (pendingName && pendingName !== user?.firstName) {
            updates.firstName = pendingName;
        }
        if (pendingAvatar) {
            updates.avatar = pendingAvatar;
        }

        // Apply all updates at once
        if (Object.keys(updates).length > 0) {
            updateUser(updates);
        }

        // Force cleanup and close
        requestAnimationFrame(() => {
            onClose();
        });
    }, [pendingAvatar, pendingName, user?.firstName, updateUser, onClose]);

    const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);
    const sheetBlurFilter = useTransform(dragY, [0, 300], ['blur(0px)', 'blur(8px)']);

    // Use the locked state for animation consistency
    const currentVariants = isMobile ? {
        initial: { y: '100vh', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100vh', opacity: 0 }
    } : {
        initial: { y: 20, opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        animate: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { y: 10, opacity: 0, scale: 0.98, filter: 'blur(8px)' }
    };

    const currentTransition = isMobile ? {
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1] // Native-style smooth ease
    } : {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
    };

    return createPortal(
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    key="profile-modal-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`fixed inset-0 z-[10003] flex ${isMobile ? 'items-end' : 'items-center'} justify-center pointer-events-none`}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* Backdrop - no click to dismiss, explicit pointer-events handling */}
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }} // FORCE pointer-events none on exit
                        transition={{ duration: 0.2 }}
                        style={isMobile ? { opacity: backdropOpacity } : undefined}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Modal Content with Multi-rim depth effect */}
                    <motion.div
                        key="modal-content"
                        ref={sheetRef}
                        variants={currentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={isMobile ? currentTransition : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        drag={isMobile && !imageSrc ? 'y' : false} // Disable drag when cropping
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.3 }}
                        onDragEnd={handleDragEnd}
                        onClick={handleModalClick}
                        onTouchEnd={handleModalClick}
                        className="relative w-full sm:max-w-[420px] touch-none sm:touch-auto pointer-events-auto"
                        style={isMobile ? { y: dragY, filter: sheetBlurFilter } : {}}
                    >
                        {/* Outer rim - gradient border */}
                        <div className="p-1 bg-gradient-to-b from-white to-slate-300 rounded-t-[24px] sm:rounded-[24px] shadow-sm">
                            {/* Middle rim - inset track */}
                            <div className="p-1 bg-slate-100 rounded-t-[22px] sm:rounded-[22px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                                {/* Inner content card */}
                                <div
                                    className="bg-gradient-to-b from-white to-[#FAFAFA] rounded-t-[20px] sm:rounded-[20px] overflow-hidden border border-white/80 min-h-[400px] flex flex-col relative"
                                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)' }}
                                >
                                    {imageSrc ? (
                                        // CROPPER VIEW
                                        <div key="cropper-view" className="flex-1 flex flex-col h-full bg-slate-50">
                                            <div className="relative flex-1 w-full bg-slate-100 rounded-t-[18px] overflow-hidden">
                                                <Cropper
                                                    image={imageSrc}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    cropShape="round"
                                                    showGrid={false}
                                                    onCropChange={setCrop}
                                                    onCropComplete={onCropComplete}
                                                    onZoomChange={setZoom}
                                                    style={{ containerStyle: { background: 'transparent' } }}
                                                />
                                            </div>

                                            {/* Cropper Controls */}
                                            <div className="px-5 sm:px-6 py-4 bg-white/60 backdrop-blur-md border-t border-slate-200/50 space-y-4">
                                                <div className="flex items-center gap-4 px-2">
                                                    <ZoomOut size={16} className="text-slate-400" />
                                                    <input
                                                        type="range"
                                                        value={zoom}
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        aria-labelledby="Zoom"
                                                        onChange={(e) => setZoom(Number(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer transition-all"
                                                        style={{ accentColor: 'rgb(36, 89, 133)' }}
                                                    />
                                                    <ZoomIn size={16} className="text-slate-400" />
                                                </div>
                                                <div className="flex gap-3 pt-1">
                                                    <ClayButton onClick={() => setImageSrc(null)} variant="secondary" className="flex-1">
                                                        Cancel
                                                    </ClayButton>
                                                    <ClayButton onClick={saveCroppedImage} variant="primary" disabled={isProcessingImage} className="flex-1">
                                                        {isProcessingImage ? 'Saving...' : 'Set Avatar'}
                                                    </ClayButton>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // NORMAL PROFILE VIEW
                                        <div key="profile-view" className="contents">
                                            {/* Drag Handle for Mobile */}
                                            <div className="sm:hidden flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                                                <div className="w-10 h-1 bg-slate-300/80 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                                            </div>

                                            {/* Header */}
                                            <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between shrink-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-white">
                                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)]" style={{ color: 'rgb(36 89 133 / 95%)' }}>
                                                            <BlackHoleIcon size={22} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h2 className="text-xl sm:text-[22px] font-bold text-slate-800" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>Profile</h2>
                                                        <span className="text-[10px] text-slate-400">Manage your account</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={onClose}
                                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] active:bg-slate-100 focus:outline-none"
                                                >
                                                    <X size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>

                                            {/* Body - ID Card Style */}
                                            <div className="px-5 sm:px-6 pb-6">
                                                {/* Hidden File Input */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={onSelectFile}
                                                    className="hidden"
                                                />

                                                {/* ID Card Container with 3D tilt */}
                                                <motion.div
                                                    ref={cardRef}
                                                    onMouseMove={handleCardMouseMove}
                                                    onMouseLeave={handleCardMouseLeave}
                                                    onTouchMove={handleCardTouchMove}
                                                    onTouchEnd={handleCardTouchEnd}
                                                    style={{
                                                        rotateX,
                                                        rotateY,
                                                        transformStyle: 'preserve-3d',
                                                    }}
                                                    className="p-0.5 bg-gradient-to-b from-white to-slate-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] cursor-default"
                                                >
                                                    <div className="p-0.5 bg-slate-100 rounded-[14px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                                                        <div className="bg-gradient-to-br from-white via-white to-slate-50/80 rounded-xl p-4 sm:p-5 overflow-hidden relative">
                                                            {/* Planet watermark */}
                                                            <div className="absolute -right-6 -bottom-6 opacity-[0.04] pointer-events-none">
                                                                <Globe2 size={140} strokeWidth={0.8} />
                                                            </div>

                                                            {/* Card Title - Zetanian */}
                                                            <div className="text-center mb-4 relative z-10">
                                                                <h4 className="text-2xl sm:text-3xl text-slate-700/90 tracking-wide" style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic' }}>
                                                                    Zetanian
                                                                </h4>
                                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-300" />
                                                                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-medium">Citizen ID</span>
                                                                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-300" />
                                                                </div>
                                                            </div>

                                                            {/* Card Content - Horizontal Layout */}
                                                            <div className="flex gap-4 sm:gap-5 relative z-10">
                                                                {/* Left: Avatar */}
                                                                <div className="shrink-0">
                                                                    <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="group relative p-1 bg-gradient-to-b from-white to-slate-200 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_5px_14px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] focus:outline-none"
                                                                    >
                                                                        <div className="p-0.5 bg-slate-100 rounded-[14px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] relative overflow-hidden">
                                                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] overflow-hidden relative">
                                                                                {(pendingAvatar || user?.avatar) ? (
                                                                                    <img src={pendingAvatar || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <UserCircle size={40} className="text-[rgb(36,89,133)]/70" strokeWidth={1.5} />
                                                                                )}
                                                                                {/* Film laminate glare effect - multi-layer */}
                                                                                {/* Base glossy layer */}
                                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none" />
                                                                                {/* Top highlight streak */}
                                                                                <div className="absolute -top-1 -left-1 w-[120%] h-[40%] bg-gradient-to-br from-white/35 via-white/10 to-transparent rotate-[-8deg] pointer-events-none" />
                                                                                {/* Subtle diagonal shine line */}
                                                                                <div className="absolute top-[15%] -left-[10%] w-[60%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[35deg] pointer-events-none blur-[0.5px]" />
                                                                                {/* Secondary softer shine */}
                                                                                <div className="absolute top-[25%] left-[5%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-[35deg] pointer-events-none" />
                                                                                {/* Edge reflection */}
                                                                                <div className="absolute inset-0 rounded-xl shadow-[inset_1px_1px_0_rgba(255,255,255,0.3),inset_-1px_-1px_0_rgba(0,0,0,0.05)] pointer-events-none" />
                                                                            </div>

                                                                            {/* Hover Overlay */}
                                                                            <div className="absolute inset-0.5 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
                                                                                <Camera size={20} className="text-white drop-shadow-md" />
                                                                            </div>
                                                                        </div>
                                                                        {/* Edit badge */}
                                                                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-slate-100 text-slate-400 group-hover:text-[rgb(36,89,133)] transition-colors">
                                                                            <Pencil size={10} />
                                                                        </div>
                                                                    </button>
                                                                </div>

                                                                {/* Right: Info */}
                                                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                                    {/* Name - Editable */}
                                                                    <div>
                                                                        {isEditing ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    ref={inputRef}
                                                                                    type="text"
                                                                                    value={firstName}
                                                                                    onChange={(e) => setFirstName(e.target.value)}
                                                                                    onKeyDown={handleKeyDown}
                                                                                    onBlur={handleSave}
                                                                                    className="flex-1 min-w-0 px-3 py-1.5 text-xl sm:text-2xl font-semibold bg-slate-50/80 border border-slate-200/60 rounded-lg focus:outline-none text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_0_0_2px_rgba(36,89,133,0.15)] focus:border-[rgba(36,89,133,0.3)]"
                                                                                    style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}
                                                                                    maxLength={20}
                                                                                />
                                                                                <button
                                                                                    onClick={handleSave}
                                                                                    className="p-2 rounded-lg text-white transition-all bg-gradient-to-b from-[rgb(50,110,160)] to-[rgb(36,89,133)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_6px_rgba(36,89,133,0.35)] hover:shadow-[0_4px_10px_rgba(36,89,133,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] focus:outline-none"
                                                                                >
                                                                                    <Check size={14} strokeWidth={2.5} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 group/name">
                                                                                <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>{pendingName || user?.firstName || 'Unknown'}</h3>
                                                                                <button
                                                                                    onClick={() => setIsEditing(true)}
                                                                                    className="p-1 rounded-md text-slate-300 hover:text-slate-500 opacity-0 group-hover/name:opacity-100 transition-all hover:bg-slate-100 focus:outline-none"
                                                                                >
                                                                                    <Pencil size={12} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Email */}
                                                                    <div className="flex items-center gap-2 text-slate-400">
                                                                        <span className="text-xs sm:text-xs truncate" style={{ fontFamily: 'Geist Mono, monospace' }}>{user?.email || 'No email'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent relative z-10" />

                                                            {/* Bottom: Citizen Info */}
                                                            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 relative z-10">
                                                                <span className="uppercase tracking-wider font-medium">Citizen Since</span>
                                                                <span className="font-medium text-slate-500" style={{ fontFamily: 'Geist Mono, monospace' }}>
                                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    }) : 'Unknown'}
                                                                </span>
                                                            </div>

                                                            {/* Striped corner brackets */}
                                                            {/* Top-left */}
                                                            <div className="absolute top-3 left-3 flex flex-col gap-[2px]">
                                                                <div className="flex gap-[2px]">
                                                                    <div className="w-1 h-1 bg-slate-300/60 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                </div>
                                                                <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                            </div>
                                                            {/* Top-right */}
                                                            <div className="absolute top-3 right-3 flex flex-col gap-[2px] items-end">
                                                                <div className="flex gap-[2px]">
                                                                    <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/60 rounded-full" />
                                                                </div>
                                                                <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                            </div>
                                                            {/* Bottom-left */}
                                                            <div className="absolute bottom-3 left-3 flex flex-col gap-[2px]">
                                                                <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                <div className="flex gap-[2px]">
                                                                    <div className="w-1 h-1 bg-slate-300/60 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                </div>
                                                            </div>
                                                            {/* Bottom-right */}
                                                            <div className="absolute bottom-3 right-3 flex flex-col gap-[2px] items-end">
                                                                <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                <div className="flex gap-[2px]">
                                                                    <div className="w-1 h-1 bg-slate-300/20 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/40 rounded-full" />
                                                                    <div className="w-1 h-1 bg-slate-300/60 rounded-full" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Footer */}
                                            <div className="px-5 sm:px-6 py-4 flex justify-end gap-3 shrink-0 border-t border-slate-100/80 bg-slate-50/30">
                                                <ClayButton onClick={onClose} variant="secondary">
                                                    Cancel
                                                </ClayButton>
                                                <ClayButton onClick={handleDone} variant="primary">
                                                    Save
                                                </ClayButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >,
        document.body
    );
};

