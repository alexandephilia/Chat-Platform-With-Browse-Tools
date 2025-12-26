import React from 'react';

interface UserAvatarProps {
    initials?: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    initials = 'P',
    src,
    size = 'sm',
    className = ""
}) => {
    const sizeConfig = {
        sm: { outer: "w-7 h-7", inner: "w-6 h-6", text: "text-[10px]", padding: "p-[2px]" },
        md: { outer: "w-8 h-8", inner: "w-7 h-7", text: "text-xs", padding: "p-[2px]" },
        lg: { outer: "w-10 h-10", inner: "w-9 h-9", text: "text-sm", padding: "p-[2px]" }
    };

    const config = sizeConfig[size];

    if (src) {
        return (
            <div className={`${config.outer} ${config.padding} rounded-full bg-gradient-to-b from-white to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] ${className}`}>
                <div className={`${config.inner} rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.8)]`}>
                    <img src={src} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
        );
    }

    return (
        <div className={`${config.outer} ${config.padding} rounded-full bg-gradient-to-b from-white to-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] ${className}`}>
            <div className={`${config.inner} ${config.text} rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500 flex items-center justify-center font-bold shadow-[inset_0_1px_3px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)]`}>
                <span className="relative z-10">{initials}</span>
            </div>
        </div>
    );
};
