import * as Tooltip from '@radix-ui/react-tooltip';
import React, { useMemo, useState } from 'react';

interface ExpressionPillProps {
    expression: string;
}

// Category styles using the new highlight style (border-b-2, subtle bg)
const CATEGORY_STYLES = {
    positive: 'bg-emerald-50 text-emerald-800 border-b-emerald-300 hover:bg-emerald-100',
    negative: 'bg-rose-50 text-rose-800 border-b-rose-300 hover:bg-rose-100',
    neutral: 'bg-yellow-50 text-slate-800 border-b-yellow-300 hover:bg-yellow-100',
    reactive: 'bg-amber-50 text-amber-800 border-b-amber-300 hover:bg-amber-100',
    delivery: 'bg-violet-50 text-violet-800 border-b-violet-300 hover:bg-violet-100',
    sound: 'bg-cyan-50 text-cyan-800 border-b-cyan-300 hover:bg-cyan-100',
} as const;

type ExpressionCategory = keyof typeof CATEGORY_STYLES;

// Keyword patterns for dynamic categorization (order matters - first match wins)
const CATEGORY_PATTERNS: Array<{ category: ExpressionCategory; patterns: RegExp[] }> = [
    // Positive emotions and reactions
    {
        category: 'positive',
        patterns: [
            /happy|joy|excit|laugh|giggl|chuckl|smile|grin|cheer|delight|elat|thrill|ecstat|bliss|content|pleas|satisf|proud|gratef|hopeful|optimist|amuse|playful|whistl|hum/i,
        ],
    },
    // Negative emotions and reactions
    {
        category: 'negative',
        patterns: [
            /sad|angry|frustrat|annoy|irritat|upset|depress|melanchol|sorrow|grief|cry|sob|weep|tear|rage|fury|disgust|fear|scare|terrif|anxious|worry|nervous|stress|panic|dread|despair|hopeless|miserable|bitter|resentful|jealous|envy|guilt|shame|embarrass|regret|disappoint|hurt|pain|suffer|groan|moan|wail|scream|yell|shout/i,
        ],
    },
    // Reactive/surprise expressions
    {
        category: 'reactive',
        patterns: [
            /gasp|gulp|surprise|shock|startle|astonish|amaze|awe|wonder|curious|intrigue|confus|puzzle|bewilder|stun|speechless|breath|inhale|exhale|sniff|cough|sneeze|hiccup|choke|stammer|stutter/i,
        ],
    },
    // Delivery/performance style
    {
        category: 'delivery',
        patterns: [
            /whisper|shout|yell|scream|murmur|mumble|soft|loud|quiet|slow|fast|rush|drawn|dramatic|monotone|sarcas|ironic|emphasi|stress|accent|voice|tone|speak|say|utter|pronounce|articulate|enunciate|interrupt|trail|overlap/i,
        ],
    },
    // Sound effects
    {
        category: 'sound',
        patterns: [
            /sound|noise|bang|boom|crash|clap|applause|thunder|rain|wind|door|glass|phone|ring|beep|buzz|click|snap|pop|crack|rustle|footstep|knock|tap|thud|splash|drip|sizzle|crackle|whoosh|swoosh|explosion|gunshot/i,
        ],
    },
    // Neutral/pacing (default fallback patterns)
    {
        category: 'neutral',
        patterns: [
            /pause|beat|silence|wait|stop|break|breath|sigh|clear|throat|calm|neutral|steady|even|flat|plain|simple|normal|regular|standard|think|ponder|consider|reflect|contemplate/i,
        ],
    },
];

/**
 * Dynamically categorize any expression based on keyword patterns
 * This allows V3 to use ANY natural expression without hardcoding
 */
function categorizeExpression(expression: string): ExpressionCategory {
    const cleanExpr = expression.toLowerCase().replace(/[\[\]]/g, '').trim();

    for (const { category, patterns } of CATEGORY_PATTERNS) {
        for (const pattern of patterns) {
            if (pattern.test(cleanExpr)) {
                return category;
            }
        }
    }

    // Default to neutral for unknown expressions
    return 'neutral';
}

/**
 * Generate a human-readable description for any expression
 * Uses the expression text itself to create a contextual description
 */
function generateDescription(expression: string, category: ExpressionCategory): string {
    const cleanExpr = expression.toLowerCase().replace(/[\[\]]/g, '').trim();

    // Category-specific description templates
    const templates: Record<ExpressionCategory, string> = {
        positive: `Expressing ${cleanExpr} - a positive emotional cue`,
        negative: `Conveying ${cleanExpr} - an intense emotional moment`,
        reactive: `A ${cleanExpr} reaction - spontaneous response`,
        delivery: `${cleanExpr.charAt(0).toUpperCase() + cleanExpr.slice(1)} delivery style`,
        sound: `Sound effect: ${cleanExpr}`,
        neutral: `${cleanExpr.charAt(0).toUpperCase() + cleanExpr.slice(1)} - vocal expression`,
    };

    return templates[category];
}

/**
 * ExpressionPill - Dynamic V3 audio tag visualization
 *
 * Renders ANY ElevenLabs V3 expression tag as a styled pill.
 * Uses intelligent pattern matching to categorize expressions dynamically,
 * eliminating the need for hardcoded tag lists.
 */
export const ExpressionPill: React.FC<ExpressionPillProps> = ({ expression }) => {
    const [open, setOpen] = useState(false);

    // Memoize categorization and description to avoid recalculation
    const { cleanExpr, category, description } = useMemo(() => {
        const clean = expression.toLowerCase().replace(/[\[\]]/g, '').trim();
        const cat = categorizeExpression(expression);
        const desc = generateDescription(expression, cat);
        return { cleanExpr: clean, category: cat, description: desc };
    }, [expression]);

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root open={open} onOpenChange={setOpen}>
                <Tooltip.Trigger asChild>
                    <span
                        className={`
              inline font-medium px-1.5 py-0.5 rounded border-b-2 transition-colors duration-300 cursor-help select-none
              ${CATEGORY_STYLES[category]}
            `}
                        style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
                        onClick={() => setOpen(!open)}
                    >
                        {cleanExpr}
                    </span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="z-[9999] px-2.5 py-1 text-[10px] font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
                        sideOffset={4}
                    >
                        {description}
                        <Tooltip.Arrow className="fill-slate-800/95" width={8} height={4} />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default ExpressionPill;
