import { motion } from 'framer-motion';
import React from 'react';

// Gift/Present icon for minimized promo card
const GiftIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
        <g fill="none">
            <path fill="currentColor" d="m19.87 12.388l-.745-.08l.746.08Zm-.183 1.705l.746.08l-.746-.08Zm-15.374 0l-.746.08l.746-.08Zm-.184-1.705l.746-.08l-.746.08Zm4.631-1.454l.655.365l-.655-.365Zm1.79-3.209l-.655-.365l.655.365Zm2.9 0l-.655.366l.655-.366Zm1.79 3.209l.655-.365l-.655.365Zm.764 1.025l-.303.687l.303-.687Zm1.466-.714l-.529-.531l.53.531Zm-1.017.777l-.102-.743l.102.743Zm-9.924-.777L6 11.777l.53-.532Zm1.018.777l.102-.743l-.102.743Zm.45-.063l.301.687l-.302-.687Zm-2.285 8.194l.5-.559l-.5.56Zm12.576 0l-.5-.559l.5.56Zm.576-10.173l.568-.49l-.567.49Zm-5.956-3.197l-.341-.668l.34.668Zm-1.816 0l.341-.668l-.34.668Zm8.033 5.525l-.183 1.705l1.49.16l.184-1.704l-1.491-.16Zm-6.037 7.942h-2.176v1.5h2.176v-1.5Zm-8.03-6.237l-.183-1.705l-1.491.16l.183 1.705l1.492-.16Zm4.357-2.714l1.79-3.208l-1.31-.73l-1.79 3.208l1.31.73Zm3.38-3.208l1.79 3.208l1.31-.73l-1.79-3.209l-1.31.73Zm1.79 3.208c.162.29.31.56.455.765c.149.211.351.445.662.582l.604-1.373c.056.024.046.05-.039-.071a8.22 8.22 0 0 1-.372-.633l-1.31.73Zm2.356-.585c-.258.258-.412.41-.533.507c-.115.093-.117.066-.057.058l.205 1.486c.336-.047.595-.216.796-.378c.195-.158.412-.376.648-.61l-1.059-1.063Zm-1.24 1.932c.269.118.565.159.855.119l-.205-1.486a.083.083 0 0 1-.045-.006l-.605 1.373Zm-9.7-.87c.235.235.452.453.647.61c.201.164.46.332.796.379l.205-1.486c.06.008.058.035-.057-.058a8.265 8.265 0 0 1-.533-.507L6 11.777Zm2.104-1.207a8.23 8.23 0 0 1-.373.633c-.084.12-.094.095-.038.07l.604 1.374c.31-.137.514-.37.662-.582c.144-.206.293-.475.455-.765l-1.31-.73Zm-.661 2.196c.29.04.586-.001.854-.12l-.604-1.372a.083.083 0 0 1-.045.006l-.205 1.486Zm3.468 7.485c-1.438 0-2.445-.001-3.213-.1c-.748-.095-1.17-.273-1.487-.556l-1 1.118c.63.564 1.39.81 2.296.926c.886.113 2.006.112 3.404.112v-1.5Zm-7.345-6.077c.148 1.378.266 2.727.466 3.821c.101.552.229 1.072.405 1.523c.175.448.417.875.774 1.195l1-1.118c-.116-.104-.248-.294-.377-.623a6.926 6.926 0 0 1-.326-1.247c-.188-1.022-.297-2.28-.45-3.711l-1.492.16Zm15.375-.16c-.154 1.431-.264 2.689-.45 3.71c-.093.507-.2.922-.327 1.248c-.129.329-.261.52-.377.623l1 1.118c.357-.32.599-.747.774-1.195c.176-.451.304-.971.405-1.523c.2-1.094.318-2.443.466-3.82l-1.491-.161Zm-5.854 7.737c1.398 0 2.518.001 3.404-.112c.907-.116 1.666-.362 2.296-.926l-1-1.118c-.317.283-.739.46-1.487.556c-.768.099-1.775.1-3.213.1v1.5ZM10.75 5c0-.69.56-1.25 1.25-1.25v-1.5A2.75 2.75 0 0 0 9.25 5h1.5ZM12 3.75c.69 0 1.25.56 1.25 1.25h1.5A2.75 2.75 0 0 0 12 2.25v1.5ZM20.75 9a.75.75 0 0 1-.75.75v1.5A2.25 2.25 0 0 0 22.25 9h-1.5Zm-1.5 0a.75.75 0 0 1 .75-.75v-1.5A2.25 2.25 0 0 0 17.75 9h1.5Zm.75-.75a.75.75 0 0 1 .75.75h1.5A2.25 2.25 0 0 0 20 6.75v1.5ZM4 9.75A.75.75 0 0 1 3.25 9h-1.5A2.25 2.25 0 0 0 4 11.25v-1.5ZM3.25 9A.75.75 0 0 1 4 8.25v-1.5A2.25 2.25 0 0 0 1.75 9h1.5ZM4 8.25a.75.75 0 0 1 .75.75h1.5A2.25 2.25 0 0 0 4 6.75v1.5Zm16 1.5a.9.9 0 0 1-.009 0l-.017 1.5H20v-1.5Zm.616 2.719c.049-.45.091-.843.114-1.171a4.55 4.55 0 0 0-.004-.898l-1.487.2c.015.11.016.29-.005.592c-.02.294-.06.657-.11 1.116l1.492.16Zm-.625-2.719a.747.747 0 0 1-.559-.26l-1.135.98c.406.47 1.006.772 1.677.78l.017-1.5Zm-.559-.26A.744.744 0 0 1 19.25 9h-1.5c0 .561.207 1.076.547 1.47l1.135-.98ZM18 11.777c.677-.675 1.026-1.015 1.258-1.159l-.787-1.276c-.42.26-.924.768-1.53 1.372L18 11.777ZM4.75 9a.744.744 0 0 1-.182.49l1.135.98c.34-.394.547-.909.547-1.47h-1.5Zm2.309 1.714c-.606-.604-1.11-1.113-1.53-1.372l-.787 1.276c.232.144.58.484 1.258 1.159l1.059-1.063ZM4.568 9.49a.747.747 0 0 1-.559.26l.017 1.5a2.25 2.25 0 0 0 1.677-.78l-1.135-.98Zm-.559.26a.91.91 0 0 1-.009 0v1.5h.026l-.017-1.5Zm.866 2.558a32.52 32.52 0 0 1-.109-1.116a3.204 3.204 0 0 1-.005-.592l-1.487-.2a4.556 4.556 0 0 0-.004.898c.023.328.065.72.114 1.17l1.491-.16ZM13.25 5c0 .485-.276.907-.683 1.115l.681 1.336A2.75 2.75 0 0 0 14.75 5h-1.5Zm-.683 1.115c-.17.086-.361.135-.567.135v1.5c.448 0 .873-.108 1.248-.3l-.681-1.335Zm1.538 1.245c-.206-.37-.391-.703-.561-.975l-1.272.795c.146.234.31.53.523.91l1.31-.73ZM12 6.25c-.206 0-.398-.05-.567-.135l-.681 1.336c.375.191.8.299 1.248.299v-1.5Zm-.567-.135A1.25 1.25 0 0 1 10.75 5h-1.5a2.75 2.75 0 0 0 1.502 2.45l.681-1.335Zm-.228 1.976c.212-.382.377-.677.523-.91l-1.272-.796c-.17.272-.355.605-.561.975l1.31.73Z" />
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M5 17.5h14" />
        </g>
    </svg>
);

interface ClayPromoCardProps {
    title: string;
    description: React.ReactNode;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    isMinimized?: boolean;
    animateOnMount?: boolean;
}

// Shared card shell styles
const cardShellStyle = {
    background: 'radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.9) 0%, rgba(240, 245, 255, 0.8) 100%)',
    boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
};

// Minimized card component (desktop sidebar only)
const MinimizedCard: React.FC = () => (
    <div className="relative w-full rounded-[24px] pt-1 pr-1" style={{ minHeight: 76 }}>
        {/* Shine effect */}
        <div className="absolute inset-0 top-1 right-1 rounded-[24px] overflow-hidden">
            <div
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_60deg,#60a5fa_120deg,#818cf8_180deg,#60a5fa_240deg,transparent_300deg,transparent_360deg)] opacity-50 blur-md animate-spin"
                style={{ animationDuration: '3s' }}
            />
            <div
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_70deg,#93c5fd_110deg,#ffffff_180deg,#93c5fd_250deg,transparent_290deg,transparent_360deg)] opacity-80 animate-spin"
                style={{ animationDuration: '3s' }}
            />
        </div>
        {/* Card Shell */}
        <div className="group relative w-full rounded-[24px] p-[5px]" style={cardShellStyle}>
            <div className="relative w-full rounded-[20px] bg-white border border-blue-50/50 flex items-center justify-center p-2" style={{ minHeight: 66 }}>
                {/* Background */}
                <div className="absolute inset-0 overflow-hidden rounded-[20px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-[40px]" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-sky-400/20 to-indigo-400/20 blur-[30px]" />
                </div>
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-transparent border border-blue-50/50 shadow-[0_3px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-blue-100 text-blue-500 flex items-center justify-center">
                            <GiftIcon size={18} />
                        </div>
                        <motion.div
                            animate={{
                                scaleX: [1, 1.15, 0.9, 1.05, 0.95, 1],
                                scaleY: [1, 0.9, 1.1, 0.95, 1.05, 1],
                                y: [0, -2, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                            className="absolute -top-3 -right-1 z-20 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-[0_3px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.2)] ring-1 ring-slate-600/50"
                            style={{ background: 'linear-gradient(180deg, #475569 0%, #1e293b 40%, #0f172a 100%)' }}
                        >
                            <span className="text-white drop-shadow-[0_0_8px_rgba(191,219,254,0.8)] animate-icon-glow-pro">PRO</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Expanded card component
const ExpandedCard: React.FC<{ title: string; description: React.ReactNode; icon?: React.ReactNode; action?: React.ReactNode }> = ({
    title,
    description,
    action
}) => {
    return (
        <div className="relative w-full rounded-[24px]">
            {/* Animated Shine Border - Always running */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                <div
                    className="absolute inset-[-100%] animate-spin"
                    style={{
                        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 60deg, #66a0bbff 120deg, #66a0bbff 180deg, #66a0bbff 240deg, transparent 300deg, transparent 360deg)',
                        animationDuration: '3s',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite'
                    }}
                />
            </div>
            {/* Card Shell */}
            <div className="group relative w-full rounded-[24px] p-[5px]" style={cardShellStyle}>
                <div className="relative w-full rounded-[20px] bg-white/60 border border-blue-50/50 flex flex-col overflow-hidden">
                    {/* Background - same as main container */}
                    <div className="absolute inset-0 overflow-hidden rounded-[20px]">
                        <div
                            className="absolute inset-0 blur-[2px] brightness-100"
                            style={{
                                backgroundImage: `url("https://r2.flowith.net/gemini-proxy-go/1766818558795/0cbc2f7b-28ee-4c48-b05a-cfc0eb3c0617.jpg")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center center',
                                backgroundSize: 'cover'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 via-50% to-white/100" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
                    </div>
                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-1 p-3">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight tracking-tight">{title}</h4>
                        <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            {description}
                        </div>
                        {action && <div className="mt-1">{action}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export const ClayPromoCard: React.FC<ClayPromoCardProps> = ({
    title,
    description,
    icon,
    action,
    className = "",
    isMinimized = false,
    animateOnMount = false
}) => {
    return (
        <motion.div
            className={`relative w-full ${className}`}
            style={{ contain: 'layout style paint' }}
            initial={animateOnMount ? { opacity: 0, filter: 'blur(10px)', scale: 0.95 } : false}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: animateOnMount ? 0.3 : 0
            }}
        >
            <div className="relative w-full rounded-[26px] p-[1.5px]">
                {/* Minimized card with transition */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isMinimized ? 1 : 0,
                        filter: isMinimized ? 'blur(0px)' : 'blur(10px)',
                        scale: isMinimized ? 1 : 0.9
                    }}
                    transition={{
                        duration: isMinimized ? 0.42 : 0.12,
                        ease: isMinimized ? [0.36, 1, 0.3, 1] : [0.4, 0, 1, 1],
                        delay: isMinimized ? 0.15 : 0
                    }}
                    className={`${isMinimized ? 'block' : 'hidden pointer-events-none'}`}
                    style={{ position: isMinimized ? 'relative' : 'absolute', inset: 0 }}
                >
                    <MinimizedCard />
                </motion.div>
                {/* Expanded card with transition */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isMinimized ? 0 : 1,
                        filter: isMinimized ? 'blur(10px)' : 'blur(0px)',
                        scale: isMinimized ? 1.05 : 1
                    }}
                    transition={{
                        duration: isMinimized ? 0.12 : 0.42,
                        ease: isMinimized ? [0.4, 0, 1, 1] : [0.36, 1, 0.3, 1],
                        delay: isMinimized ? 0 : 0.15
                    }}
                    className={`${isMinimized ? 'hidden pointer-events-none' : 'block'}`}
                    style={{ position: isMinimized ? 'absolute' : 'relative', inset: 0 }}
                >
                    <ExpandedCard title={title} description={description} icon={icon} action={action} />
                </motion.div>
            </div>
        </motion.div>
    );
};
