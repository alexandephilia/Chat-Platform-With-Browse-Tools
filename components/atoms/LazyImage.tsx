import React, { memo, useEffect, useRef, useState } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
    style?: React.CSSProperties;
    width?: number | string;
    height?: number | string;
}

// Global cache for loaded images - persists across component instances
const imageCache = new Set<string>();

// Preload an image and add to cache
const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (imageCache.has(src)) {
            resolve();
            return;
        }
        const img = new Image();
        // Don't use crossOrigin for preloading - it causes CORS issues
        // Just try to load and handle errors gracefully
        img.onload = () => {
            imageCache.add(src);
            resolve();
        };
        img.onerror = () => {
            // Still resolve but don't cache - let the component handle the error
            reject(new Error('Image failed to load'));
        };
        img.src = src;
    });
};

const LazyImageComponent: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
    fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3E!%3C/text%3E%3C/svg%3E',
    onLoad,
    onError,
    style,
    width,
    height
}) => {
    // Check if image is already cached
    const isCached = imageCache.has(src);
    const [isLoaded, setIsLoaded] = useState(isCached);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(isCached); // Skip intersection observer if cached
    const imgRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // If already cached, no need to observe
        if (isCached) {
            setIsLoaded(true);
            setIsInView(true);
            return;
        }

        const element = imgRef.current;
        if (!element) return;

        // Create Intersection Observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observerRef.current?.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading 100px before coming into view
                threshold: 0
            }
        );

        observerRef.current.observe(element);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [isCached]);

    // Preload image when in view
    useEffect(() => {
        if (!isInView || isLoaded || hasError) return;

        preloadImage(src)
            .then(() => {
                setIsLoaded(true);
                onLoad?.();
            })
            .catch(() => {
                setHasError(true);
                onError?.();
            });
    }, [isInView, src, isLoaded, hasError, onLoad, onError]);

    const containerStyle: React.CSSProperties = {
        width,
        height,
        ...style
    };

    // If cached, render immediately without placeholder
    if (isCached) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={containerStyle}
                width={typeof width === 'number' ? width : undefined}
                height={typeof height === 'number' ? height : undefined}
                referrerPolicy="no-referrer"
                onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                    onError?.();
                }}
            />
        );
    }

    return (
        <div ref={imgRef} className={`relative ${className}`} style={containerStyle}>
            {/* Show placeholder while loading */}
            {!isLoaded && !hasError && (
                <div
                    className="absolute inset-0 bg-slate-100 animate-pulse rounded"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* Actual image - only render src when in view */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ position: isLoaded ? 'relative' : 'absolute', inset: 0 }}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => {
                        setHasError(true);
                        onError?.();
                    }}
                />
            )}

            {/* Fallback for error state */}
            {hasError && (
                <img
                    src={fallback}
                    alt={alt}
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
};

// Memoize to prevent unnecessary re-renders
export const LazyImage = memo(LazyImageComponent, (prevProps, nextProps) => {
    return (
        prevProps.src === nextProps.src &&
        prevProps.alt === nextProps.alt &&
        prevProps.className === nextProps.className &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height
    );
});

export default LazyImage;
