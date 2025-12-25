/**
 * Generates a standardized block of text describing the user's current environment.
 * This is injected into AI system prompts to provide awareness of time, date, and region.
 */
export function getUserEnvironmentContext(): string {
    const now = new Date();

    // Get date and time in a readable format
    const dateStr = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeStr = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    });

    // Get timezone and region info
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    // Get UTC offset for clarity
    const offsetMinutes = now.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
    const offsetMins = Math.abs(offsetMinutes % 60);
    const offsetSign = offsetMinutes <= 0 ? '+' : '-';
    const utcOffset = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

    // ISO timestamp for precise reference
    const isoTimestamp = now.toISOString();

    return `
[CURRENT DATE & TIME - IMPORTANT]
Today is ${dateStr}
Current time: ${timeStr}
Timezone: ${timeZone} (${utcOffset})
User locale: ${locale}
ISO timestamp: ${isoTimestamp}

Use this information when the user asks about "today", "now", "this week", current events, or anything time-sensitive. Always consider the user's timezone when discussing times or scheduling.
[/CURRENT DATE & TIME]
`.trim();
}
