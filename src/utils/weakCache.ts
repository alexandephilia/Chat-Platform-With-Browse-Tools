// WeakMap cache for expensive computations
const computationCache = new WeakMap<object, any>();

/**
 * Cache expensive computations using WeakMap for automatic garbage collection
 *
 * @param computeFn Function that computes the result
 * @param keyFn Optional function to generate cache key from input (defaults to input itself)
 * @returns Memoized function that caches results
 */
export function weakMemoize<T extends object, R>(
    computeFn: (input: T) => R,
    keyFn?: (input: T) => object
) {
    return (input: T): R => {
        const key = keyFn ? keyFn(input) : input;

        // Check cache first
        if (computationCache.has(key)) {
            return computationCache.get(key);
        }

        // Compute and cache result
        const result = computeFn(input);
        computationCache.set(key, result);

        return result;
    };
}

/**
 * Cache expensive computations using regular Map for primitive inputs
 */
export function memoize<T, R>(
    computeFn: (input: T) => R,
    keyFn?: (input: T) => string | number
) {
    const cache = new Map<string | number, R>();

    return (input: T): R => {
        const key = keyFn ? keyFn(input) : (input as string | number);

        // Check cache first
        if (cache.has(key)) {
            return cache.get(key);
        }

        // Compute and cache result
        const result = computeFn(input);
        cache.set(key, result);

        return result;
    };
}

/**
 * Create a memoized version of expensive data processing
 */
export const memoizedProcessLargeDataset = weakMemoize((data: any[]) => {
    // Simulate expensive computation
    console.log('Processing large dataset...');
    return data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
    }));
});

/**
 * Memoized URL validation function
 */
export const memoizedValidateUrl = memoize((url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
});
