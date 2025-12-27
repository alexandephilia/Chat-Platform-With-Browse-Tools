import { Bug, Code2, Compass, Feather, LucideIcon, Sparkles, Zap } from 'lucide-react';

/**
 * Suggestion cards data for the welcome screen
 */

export interface SuggestionCard {
    title: string;
    description: string;
    prompt: string;
    icon: LucideIcon;
}

export const ALL_SUGGESTIONS: SuggestionCard[] = [
    { 
        title: "Creative Spark", 
        description: "Generate unique ideas and concepts.", 
        prompt: "Give me 5 creative ideas for a new mobile app that solves a common daily problem.",
        icon: Sparkles
    },
    { 
        title: "Bug Hunter", 
        description: "Find and fix issues in your code.", 
        prompt: "Analyze this code snippet, find the potential bugs, and suggest fixes with explanations.",
        icon: Bug
    },
    { 
        title: "Ghost Writer", 
        description: "Draft engaging emails and content.", 
        prompt: "Draft a professional but warm email to a potential client introducing my freelance servces.",
        icon: Feather
    },
    { 
        title: "Code Architect", 
        description: "Design scalable systems and patterns.", 
        prompt: "Suggest a scalable folder structure and architecture for a modern React application.",
        icon: Code2
    },
    { 
        title: "Navigator", 
        description: "Plan itineraries and schedules.", 
        prompt: "Create a detailed 3-day itinerary for a trip to Kyoto, focusing on food and culture.",
        icon: Compass
    },
    { 
        title: "Quick Learn", 
        description: "Understand complex topics instantly.", 
        prompt: "Explain the concept of Neural Networks using a simple real-world analogy.",
        icon: Zap
    },
];

export function getRandomSuggestions(count: number = 3): SuggestionCard[] {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
