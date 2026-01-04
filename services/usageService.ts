const USAGE_STORAGE_KEY = 'zeta_guest_usage_count';
export const GUEST_USAGE_LIMIT = 4;

export const usageService = {
    getUsageCount(): number {
        const stored = localStorage.getItem(USAGE_STORAGE_KEY);
        if (!stored) return 0;
        try {
            return parseInt(stored, 10) || 0;
        } catch {
            return 0;
        }
    },

    incrementUsageCount(): number {
        const current = this.getUsageCount();
        const next = current + 1;
        localStorage.setItem(USAGE_STORAGE_KEY, next.toString());
        return next;
    },

    getRemainingUsage(): number {
        return Math.max(0, GUEST_USAGE_LIMIT - this.getUsageCount());
    },

    isLimitReached(): boolean {
        return this.getUsageCount() >= GUEST_USAGE_LIMIT;
    },

    resetUsage(): void {
        localStorage.removeItem(USAGE_STORAGE_KEY);
    }
};
