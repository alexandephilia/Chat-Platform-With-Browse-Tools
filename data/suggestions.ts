/**
 * Suggestion cards data for the welcome screen
 */

export interface SuggestionCard {
    title: string;
    description: string;
    prompt: string;
}

export const ALL_SUGGESTIONS: SuggestionCard[] = [
    { title: "Write Email", description: "Draft a professional email for any occasion.", prompt: "Help me write a professional email to request a meeting with a potential client." },
    { title: "Story Ideas", description: "Get creative story concepts and plot ideas.", prompt: "Give me 3 unique short story ideas with interesting plot twists." },
    { title: "Explain Concept", description: "Break down complex topics into simple terms.", prompt: "Explain quantum computing like I'm a beginner with no technical background." },
    { title: "Research Help", description: "Get summaries and insights on any topic.", prompt: "What are the key differences between machine learning and deep learning?" },
    { title: "Plan My Day", description: "Create a productive schedule for your tasks.", prompt: "Help me create a productive daily schedule. I have meetings, coding work, and exercise to fit in." },
    { title: "Meeting Notes", description: "Summarize and organize meeting discussions.", prompt: "Help me create a template for taking effective meeting notes." },
    { title: "Debug Code", description: "Find and fix issues in your code.", prompt: "What are common debugging strategies when my code isn't working as expected?" },
    { title: "Code Review", description: "Get feedback on code quality and best practices.", prompt: "What are the best practices for writing clean, maintainable code?" },
    { title: "Travel Plan", description: "Plan your perfect trip itinerary.", prompt: "Help me plan a 5-day trip to Tokyo. I love food, culture, and hidden gems." },
    { title: "Recipe Ideas", description: "Get cooking inspiration and recipes.", prompt: "Suggest a healthy dinner recipe I can make in under 30 minutes with common ingredients." },
    { title: "Brainstorm", description: "Generate ideas for any challenge.", prompt: "Help me brainstorm creative solutions for improving team communication in a remote work environment." },
    { title: "Decision Help", description: "Weigh pros and cons for tough choices.", prompt: "Help me create a pros and cons list for switching careers to tech." },
];

export function getRandomSuggestions(count: number = 3): SuggestionCard[] {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
