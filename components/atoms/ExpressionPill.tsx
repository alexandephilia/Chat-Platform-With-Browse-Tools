import React, { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export type ExpressionType = 
  | 'happy' | 'excited' | 'laughs' | 'giggles' | 'whistles'
  | 'angry' | 'sad' | 'crying' | 'shouting'
  | 'whispers' | 'pause' | 'sighs' | 'thinking' | 'clears throat'
  | 'gasps' | 'gulps' | 'nervous' | 'curious'
  | 'neutral';

interface ExpressionPillProps {
  expression: string;
}

const EXPRESSION_MAP: Record<string, { category: 'positive' | 'negative' | 'neutral' | 'reactive', label: string, description: string }> = {
  happy: { category: 'positive', label: 'happy', description: 'Feeling joyful or content' },
  excited: { category: 'positive', label: 'excited', description: 'High energy and enthusiasm' },
  laughs: { category: 'positive', label: 'laughs', description: 'Auditible laughter' },
  giggles: { category: 'positive', label: 'giggles', description: 'Light, playful laughter' },
  whistles: { category: 'positive', label: 'whistles', description: 'Musical whistling' },
  
  angry: { category: 'negative', label: 'angry', description: 'Frustrated or intense emotion' },
  sad: { category: 'negative', label: 'sad', description: 'Melancholy or sorrow' },
  crying: { category: 'negative', label: 'crying', description: 'Deep sorrow or distress' },
  shouting: { category: 'negative', label: 'shouting', description: 'Raised volume for emphasis' },
  
  whispers: { category: 'neutral', label: 'whispers', description: 'Low, intimate volume' },
  pause: { category: 'neutral', label: 'pause', description: 'A brief silence' },
  sighs: { category: 'neutral', label: 'sighs', description: 'Deep breath out' },
  thinking: { category: 'neutral', label: 'thinking', description: 'Internal reflection' },
  'clears throat': { category: 'neutral', label: 'clears throat', description: 'A vocal reset' },
  
  gasps: { category: 'reactive', label: 'gasps', description: 'Sudden intake of breath' },
  gulps: { category: 'reactive', label: 'gulps', description: 'Nervous swallow' },
  nervous: { category: 'reactive', label: 'nervous', description: 'Anxiety or uncertainty' },
  curious: { category: 'reactive', label: 'curious', description: 'Intrigued questioning' },
  
  neutral: { category: 'neutral', label: 'neutral', description: 'Balanced delivery' }
};

const CATEGORY_STYLES = {
  positive: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-600 border-emerald-500/20 backdrop-blur-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]',
  negative: 'bg-rose-500/15 text-rose-600 dark:text-rose-600 border-rose-500/20 backdrop-blur-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]',
  neutral: 'bg-slate-500/15 text-slate-600 dark:text-slate-600 border-slate-500/20 backdrop-blur-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]',
  reactive: 'bg-amber-500/15 text-amber-600 dark:text-amber-600 border-amber-500/20 backdrop-blur-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.05)]'
};

export const ExpressionPill: React.FC<ExpressionPillProps> = ({ expression }) => {
  const cleanExpr = expression.toLowerCase().replace(/[\[\]]/g, '');
  const config = EXPRESSION_MAP[cleanExpr] || { category: 'neutral', label: cleanExpr, description: 'An expressive cue' };
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <span 
            className={`
              inline-flex items-center px-1.5 py-[1px] rounded-[4px] text-[9px] font-medium tracking-wide border align-baseline mx-0.5 -translate-y-[1px] cursor-help transition-all duration-200 select-none
              ${CATEGORY_STYLES[config.category]}
              hover:bg-opacity-25 hover:shadow-sm
            `}
            onClick={() => setOpen(!open)}
          >
            {config.label}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-[9999] px-2.5 py-1 text-[10px] font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-200"
            sideOffset={4}
          >
            {config.description}
            <Tooltip.Arrow className="fill-slate-800/95" width={8} height={4} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
