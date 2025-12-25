import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

interface ShimmerTextProps {
    text?: string;
    className?: string;
    rotating?: boolean;
}

// UFO/Zeta Reticuli themed loading messages
const UFO_MESSAGES = [
    "Warping...",
    "Faster Than Light Travel...",
    "Scanning galaxies...",
    "Decoding signals...",
    "Quantum tunneling...",
    "Hyperdrive engaged...",
    "Traversing wormhole...",
    "Calibrating sensors...",
    "Establishing contact...",
    "Probing data streams...",
    "Navigating nebula...",
    "Syncing with mothership...",
] as const;

// Animation timing constants
const WAVE_DURATION = 2.5;
const WAVE_SPREAD = 1.2;
const TRANSITION_DURATION = 400;
const ROTATION_INTERVAL = 3500;

// CSS keyframes - wave animation only
const SHIMMER_STYLES = `
@keyframes shimmer-wave {
    0%, 12%, 88%, 100% {
        transform: translate3d(0, 0, 0) scale(1) rotateY(0);
        color: var(--shimmer-base);
        text-shadow: 0 0 0 transparent;
    }
    30%, 70% {
        color: var(--shimmer-mid);
    }
    50% {
        transform: translate3d(1px, -3px, 12px) scale(1.06) rotateY(6deg);
        color: var(--shimmer-peak);
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.35), 0 0 20px rgba(255, 255, 255, 0.12);
    }
}

@media (prefers-reduced-motion: reduce) {
    [data-shimmer-char] {
        animation: none !important;
        color: var(--shimmer-mid) !important;
        transform: none !important;
    }
}
`;

// Inject styles once
let stylesInjected = false;
function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.id = 'shimmer-text-styles';
    style.textContent = SHIMMER_STYLES;
    document.head.appendChild(style);
    stylesInjected = true;
}

// Wave character - handles shimmer wave animation only
const WaveChar = memo<{
    char: string;
    index: number;
    total: number;
}>(({ char, index, total }) => {
    const waveDelay = (index * WAVE_DURATION * (1 / WAVE_SPREAD)) / total;

    return (
        <span
            data-shimmer-char
            style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                transformStyle: 'preserve-3d',
                animation: `shimmer-wave ${WAVE_DURATION}s ease-in-out ${waveDelay}s infinite`,
            }}
        >
            {char === ' ' ? '\u00A0' : char}
        </span>
    );
});

WaveChar.displayName = 'WaveChar';

export const ShimmerText: React.FC<ShimmerTextProps> = ({
    text = "",
    className = "",
    rotating = false,
}) => {
    const [currentIndex, setCurrentIndex] = useState(() =>
        Math.floor(Math.random() * UFO_MESSAGES.length)
    );
    const [displayText, setDisplayText] = useState(rotating ? UFO_MESSAGES[currentIndex] : text);
    const [isBlurred, setIsBlurred] = useState(false); // Simple: blurred or not
    const isTransitioning = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Inject CSS on mount
    useEffect(() => {
        injectStyles();
    }, []);

    // Rotation handler
    const rotateText = useCallback(async () => {
        if (isTransitioning.current) return;
        isTransitioning.current = true;

        // Calculate next text
        const prevIndex = currentIndex;
        const newIndex = (() => {
            let idx: number;
            do {
                idx = Math.floor(Math.random() * UFO_MESSAGES.length);
            } while (idx === prevIndex && UFO_MESSAGES.length > 1);
            return idx;
        })();

        // 1. Blur out
        setIsBlurred(true);
        await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, TRANSITION_DURATION);
        });

        // 2. Swap text while blurred
        setCurrentIndex(newIndex);
        setDisplayText(UFO_MESSAGES[newIndex]);

        // 3. Small delay to let React render new text
        await new Promise(resolve => setTimeout(resolve, 30));

        // 4. Blur in (unblur)
        setIsBlurred(false);

        // 5. Wait for transition to complete before allowing next rotation
        await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, TRANSITION_DURATION);
        });

        isTransitioning.current = false;
    }, [currentIndex]);

    // Handle rotation interval
    useEffect(() => {
        if (!rotating) return;

        const interval = setInterval(rotateText, ROTATION_INTERVAL);
        return () => {
            clearInterval(interval);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [rotating, rotateText]);

    // Update display text when not rotating
    useEffect(() => {
        if (!rotating) {
            setDisplayText(text);
        }
    }, [text, rotating]);

    const characters = displayText.split('');

    // GPU-accelerated container blur
    const getContainerStyle = () => {
        return {
            perspective: '800px',
            transformStyle: 'preserve-3d' as const,
            contain: 'layout style' as const,
            '--shimmer-base': '#5a5a5a',
            '--shimmer-mid': '#9a9a9a',
            '--shimmer-peak': '#d4d4d4',
            willChange: isBlurred ? 'opacity, filter' : 'auto',
            transform: 'translate3d(0, 0, 0)',
            transition: `opacity ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            opacity: isBlurred ? 0 : 1,
            filter: isBlurred ? 'blur(8px)' : 'blur(0px)',
        };
    };

    return (
        <span
            data-shimmer-container
            className={`inline-flex font-medium ${className}`}
            // @ts-ignore CSS custom properties
            style={getContainerStyle()}
        >
            {characters.map((char, index) => (
                <WaveChar
                    key={`${currentIndex}-${index}`}
                    char={char}
                    index={index}
                    total={characters.length}
                />
            ))}
        </span>
    );
};

export default ShimmerText;
