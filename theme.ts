// Theme configuration - centralized styling for easy customization

export const theme = {
    // Fonts
    fonts: {
        base: "'Nunito', sans-serif",
        display: "'Instrument Serif', serif",
    },

    // Colors
    colors: {
        // Primary brand colors
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },
        // Light mode colors
        light: {
            background: {
                page: '#F8F9FB',
                sidebar: '#F8F9FB',
                card: '#FFFFFF',
                input: '#FFFFFF',
                portal: '#FFFFFF',
            },
            text: {
                primary: '#1e293b',    // slate-800
                secondary: '#64748b',  // slate-500
                muted: '#94a3b8',      // slate-400
                inverse: '#FFFFFF',
            },
            border: {
                light: '#f1f5f9',      // slate-100
                default: '#e2e8f0',    // slate-200
                dark: '#cbd5e1',       // slate-300
            },
        },
        // Dark mode colors
        dark: {
            background: {
                page: '#0f172a',       // slate-900
                sidebar: '#1e293b',    // slate-800
                card: '#1e293b',
                input: '#334155',      // slate-700
                portal: '#1e293b',
            },
            text: {
                primary: '#f8fafc',    // slate-50
                secondary: '#94a3b8',  // slate-400
                muted: '#64748b',      // slate-500
                inverse: '#0f172a',
            },
            border: {
                light: '#334155',      // slate-700
                default: '#475569',    // slate-600
                dark: '#94a3b8',       // slate-400
            },
        },
        // Status colors
        status: {
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
    },

    // Spacing
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
    },

    // Border radius
    radius: {
        sm: '0.5rem',    // 8px
        md: '0.75rem',   // 12px
        lg: '1rem',      // 16px
        xl: '1.5rem',    // 24px
        '2xl': '2rem',   // 32px
        full: '9999px',
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.03)',
        md: '0 2px 8px rgba(0, 0, 0, 0.04)',
        lg: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    },

    // Transitions
    transitions: {
        fast: '0.1s ease',
        default: '0.2s ease',
        slow: '0.3s ease',
        spring: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

// CSS variable names for use in components
export const cssVars = {
    fontBase: 'var(--font-base)',
    fontDisplay: 'var(--font-display)',
    colorPrimary: 'var(--color-primary)',
    colorBackground: 'var(--color-background)',
    colorSidebar: 'var(--color-sidebar)',
    colorCard: 'var(--color-card)',
    colorInput: 'var(--color-input)',
    colorPortal: 'var(--color-portal)',
    colorText: 'var(--color-text)',
    colorTextSecondary: 'var(--color-text-secondary)',
    colorTextMuted: 'var(--color-text-muted)',
    colorBorder: 'var(--color-border)',
    colorBorderLight: 'var(--color-border-light)',
} as const;

export type Theme = typeof theme;
