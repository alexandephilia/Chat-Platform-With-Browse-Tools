/**
 * Time-based utility functions
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get the current time of day based on hour
 * - Morning: 5:00 AM - 11:59 AM
 * - Afternoon: 12:00 PM - 4:59 PM
 * - Evening: 5:00 PM - 8:59 PM
 * - Night: 9:00 PM - 4:59 AM
 */
export function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

/**
 * Get a greeting based on the current time of day
 */
export function getTimeBasedGreeting(): string {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
        case 'morning':
            return 'Good Morning';
        case 'afternoon':
            return 'Good Afternoon';
        case 'evening':
            return 'Good Evening';
        case 'night':
            return 'Good Night';
    }
}

/**
 * Get greeting with optional name
 */
export function getGreeting(name?: string): string {
    const greeting = getTimeBasedGreeting();
    return name ? `${greeting}, ${name}!` : `${greeting}!`;
}
