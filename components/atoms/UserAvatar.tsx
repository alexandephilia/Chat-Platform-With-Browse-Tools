import React from 'react';

interface UserAvatarProps {
    initials?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    initials = 'P',
    size = 'sm',
    className = ""
}) => {
    const sizeClasses = {
        sm: "w-6 h-6 text-[10px]",
        md: "w-7 h-7 text-xs",
        lg: "w-8 h-8 text-sm"
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center font-bold ring-1 ring-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)] ${className}`}>
            <span className="relative z-10">{initials}</span>
        </div>
    );
};
