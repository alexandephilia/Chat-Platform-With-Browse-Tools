import { motion, useReducedMotion } from "framer-motion";
import React, { useMemo } from "react";

export const EtherealBackground: React.FC = () => {
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = useMemo(() => {
        if (prefersReducedMotion) return false;
        if (typeof navigator === 'undefined') return true;
        const connection = (navigator as any).connection;
        if (connection?.saveData) return false;
        const deviceMemory = (navigator as any).deviceMemory;
        if (typeof deviceMemory === 'number' && deviceMemory <= 4) return false;
        const cores = navigator.hardwareConcurrency;
        if (typeof cores === 'number' && cores <= 4) return false;
        return true;
    }, [prefersReducedMotion]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base White with slight transparency to let orbs show but keep it light */}
            <div className="absolute inset-0 bg-white/40" />

            {/* Orb 1: Sky Blue (Top Left) */}
            {shouldAnimate ? (
                <motion.div
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px]"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                />
            ) : (
                <div
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px]"
                    style={{ transform: 'translateZ(0)' }}
                />
            )}

            {/* Orb 2: Soft Violet (Top Right) */}
            {shouldAnimate ? (
                <motion.div
                    className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/20 blur-[120px]"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                />
            ) : (
                <div
                    className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-400/20 blur-[120px]"
                    style={{ transform: 'translateZ(0)' }}
                />
            )}


            {/* Orb 4: Rose/Indigo (Bottom Right) */}
            {shouldAnimate ? (
                <motion.div
                    className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-indigo-100/20 blur-[120px]"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                />
            ) : (
                <div
                    className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-indigo-100/20 blur-[120px]"
                    style={{ transform: 'translateZ(0)' }}
                />
            )}

            {/* Overlay: Noise Texture for "Ceramic" feel (Optional mix, keeps it grounded) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Overlay: Gradient to white at edges to blend seamlessly */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/40" />
        </div>
    );
};
