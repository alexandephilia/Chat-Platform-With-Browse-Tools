import React from 'react';

interface AuthButtonsProps {
    onLogin: () => void;
    onSignup: () => void;
    size?: 'sm' | 'md';
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
    onLogin,
    onSignup,
    size = 'sm'
}) => {
    const buttonClasses = size === 'sm'
        ? 'px-2.5 py-1 text-[11px]'
        : 'px-3 py-1.5 text-xs';

    return (
        <div 
            className="flex items-center gap-1.5"
            style={{
                opacity: 1,
                transform: 'none'
            }}
        >
            <button
                onClick={onLogin}
                className={`${buttonClasses} font-medium text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200/60 bg-white/80 hover:bg-white transition-colors duration-150`}
                style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
            >
                Log in
            </button>
            <button
                onClick={onSignup}
                className={`${buttonClasses} font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-150`}
                style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
            >
                Sign up
            </button>
        </div>
    );
};
