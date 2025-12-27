import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Camera, Check, Pencil, UserCircle, X, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../contexts/AuthContext';
import getCroppedImg from '../../utils/cropImage';

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
                    {/* Backdrop - Explicit pointer-events handling */}
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }} // FORCE pointer-events none on exit
                        transition={{ duration: 0.2 }}
                        style={isMobile ? { opacity: backdropOpacity } : undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
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
                                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-all"
                                                    />
                                                    <ZoomIn size={16} className="text-slate-400" />
                                                </div>
                                                <div className="flex gap-3 pt-1">
                                                    <button
                                                        onClick={() => setImageSrc(null)}
                                                        className="flex-1 px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.06)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={saveCroppedImage}
                                                        disabled={isProcessingImage}
                                                        className="relative flex-1 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold overflow-hidden flex items-center gap-2 justify-center transition-all duration-200 bg-gradient-to-b from-blue-400 to-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(59,130,246,0.35),0_1px_3px_rgba(59,130,246,0.2)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_16px_rgba(59,130,246,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                                        {isProcessingImage ? 'Saving...' : 'Set Avatar'}
                                                    </button>
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
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)] bg-white">
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-b from-white to-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] text-blue-500">
                                                            <UserCircle size={14} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h2 className="text-[15px] sm:text-base font-bold text-slate-800">Profile</h2>
                                                        <span className="text-[10px] text-slate-400">Manage your account</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={onClose}
                                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] active:bg-slate-100"
                                                >
                                                    <X size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>

                                            {/* Body */}
                                            <div className="px-5 sm:px-6 pb-6 space-y-5">
                                                {/* Hidden File Input */}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    onChange={onSelectFile}
                                                    className="hidden"
                                                />

                                                {/* Avatar - with clay styling */}
                                                <div className="flex justify-center flex-col items-center gap-3">
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="group relative p-1 bg-gradient-to-b from-white to-slate-200 rounded-full shadow-sm hover:scale-105 transition-transform duration-200 active:scale-95"
                                                    >
                                                        <div className="p-0.5 bg-slate-100 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] overflow-hidden">
                                                                {(pendingAvatar || user?.avatar) ? (
                                                                    <img src={pendingAvatar || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <UserCircle size={48} className="text-blue-400/80" strokeWidth={1.5} />
                                                                )}
                                                            </div>

                                                            {/* Hover Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <Camera size={20} className="text-white drop-shadow-md" />
                                                            </div>
                                                        </div>
                                                        {/* Edit badge */}
                                                        <div className="absolute bottom-1 right-1 p-1.5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-slate-100 text-slate-500 group-hover:text-blue-500 transition-colors">
                                                            <Pencil size={10} />
                                                        </div>
                                                    </button>

                                                    <p className="text-[10px] text-slate-400 font-medium">Tap to change avatar</p>
                                                </div>

                                                {/* Name Field */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Name</label>
                                                    <div className="flex items-center gap-2">
                                                        {isEditing ? (
                                                            <div className="flex-1 flex items-center gap-2">
                                                                <input
                                                                    ref={inputRef}
                                                                    type="text"
                                                                    value={firstName}
                                                                    onChange={(e) => setFirstName(e.target.value)}
                                                                    onKeyDown={handleKeyDown}
                                                                    onBlur={handleSave}
                                                                    className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none text-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.04),0_1px_0_rgba(255,255,255,0.8)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_0_0_2px_rgba(59,130,246,0.15)] focus:border-blue-300"
                                                                    maxLength={20}
                                                                />
                                                                <button
                                                                    onClick={handleSave}
                                                                    className="p-2.5 rounded-xl text-white transition-all bg-gradient-to-b from-blue-400 to-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_6px_rgba(59,130,246,0.35)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(59,130,246,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                                                                >
                                                                    <Check size={14} strokeWidth={2.5} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]">
                                                                <span className="text-sm text-slate-700 font-medium">{pendingName || user?.firstName || 'Unknown'}</span>
                                                                <button
                                                                    onClick={() => setIsEditing(true)}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all bg-white/80 hover:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                                                                >
                                                                    <Pencil size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Email Field (read-only) */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Email</label>
                                                    <div className="px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]">
                                                        <span className="text-sm text-slate-500">{user?.email || 'No email'}</span>
                                                    </div>
                                                </div>

                                                {/* Member Since */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Member Since</label>
                                                    <div className="px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)]">
                                                        <span className="text-sm text-slate-500">
                                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="px-5 sm:px-6 py-4 flex justify-end gap-2.5 shrink-0 border-t border-slate-100/80 bg-slate-50/30">
                                                {/* Cancel button - raised soft style */}
                                                <button
                                                    onClick={onClose}
                                                    className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-all bg-slate-50/80 hover:bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.06)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                                                >
                                                    Cancel
                                                </button>
                                                {/* Done button - primary action with blue theme */}
                                                <motion.button
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleDone}
                                                    className="relative px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold overflow-hidden flex items-center gap-2 min-w-[100px] justify-center transition-all duration-200 bg-gradient-to-b from-blue-400 to-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(59,130,246,0.35),0_1px_3px_rgba(59,130,246,0.2)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_6px_16px_rgba(59,130,246,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                                                >
                                                    <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                                    Save
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

