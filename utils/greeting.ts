/**
 * Time-based greeting utility
 * Returns appropriate greeting based on current hour
 */

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface GreetingInfo {
    text: string;
    period: GreetingPeriod;
    emoji?: string;
}

/**
 * Get the current time period based on hour
 */
export function getTimePeriod(hour?: number): GreetingPeriod {
    const currentHour = hour ?? new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
        return 'morning';
    } else if (currentHour >= 12 && currentHour < 17) {
        return 'afternoon';
    } else if (currentHour >= 17 && currentHour < 21) {
        return 'evening';
    } else {
        return 'night';
    }
}

/**
 * Get greeting text based on time of day
 */
export function getGreeting(name?: string): GreetingInfo {
    const period = getTimePeriod();

    const greetings: Record<GreetingPeriod, { text: string; emoji: string }> = {
        morning: { text: 'Good Morning', emoji: '☀️' },
        afternoon: { text: 'Good Afternoon', emoji: '🌤️' },
        evening: { text: 'Good Evening', emoji: '🌅' },
        night: { text: 'Good Night', emoji: '🌙' }
    };

    const greeting = greetings[period];
    const fullText = name ? `${greeting.text}, ${name}!` : `${greeting.text}!`;

    return {
        text: fullText,
        period,
        emoji: greeting.emoji
    };
}

/**
 * Get just the greeting prefix (without name)
 */
export function getGreetingPrefix(): string {
    const period = getTimePeriod();

    const prefixes: Record<GreetingPeriod, string> = {
        morning: 'Good Morning',
        afternoon: 'Good Afternoon',
        evening: 'Good Evening',
        night: 'Good Night'
    };

    return prefixes[period];
}
