import React, { useEffect } from 'react';
import { theme } from '../../theme';

interface GlobalThemeProps {
    isDarkMode: boolean;
}

export const GlobalTheme: React.FC<GlobalThemeProps> = ({ isDarkMode }) => {
    useEffect(() => {
        const root = document.documentElement;
        const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

        // Base fonts
        root.style.setProperty('--font-base', theme.fonts.base);
        root.style.setProperty('--font-display', theme.fonts.display);

        // Core colors
        root.style.setProperty('--color-primary', theme.colors.primary[500]);
        root.style.setProperty('--color-background', colors.background.page);
        root.style.setProperty('--color-sidebar', colors.background.sidebar);
        root.style.setProperty('--color-card', colors.background.card);
        root.style.setProperty('--color-input', colors.background.input);
        root.style.setProperty('--color-portal', colors.background.portal);
        
        // Text colors
        root.style.setProperty('--color-text', colors.text.primary);
        root.style.setProperty('--color-text-secondary', colors.text.secondary);
        root.style.setProperty('--color-text-muted', colors.text.muted);
        
        // Borders
        root.style.setProperty('--color-border', colors.border.default);
        root.style.setProperty('--color-border-light', colors.border.light);

        // Add a class for non-variable based overrides if needed
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    return null; // This component doesn't render anything UI-wise
};
