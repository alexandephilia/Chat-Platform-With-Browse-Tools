import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const DefaultCode = ({ node, className, style, codeStyle, animateText, animation, animationDuration, animationTimingFunction, children, ...props }: any) => {
    // Enhanced block detection: check for language prefix, newline characters, or if the parent is a pre tag
    const isBlock =
        className?.includes('language-') ||
        (typeof children === 'string' && children.includes('\n')) ||
        (Array.isArray(children) && children.some(c => typeof c === 'string' && c.includes('\n'))) ||
        node?.tagName === 'pre';
    const [copied, setCopied] = useState(false);

    // Extract language from className (e.g., "language-javascript" -> "JAVASCRIPT")
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1].toUpperCase() : 'CODE';

    const handleCopy = async () => {
        if (!children) return;

        // Robust extraction from React children or raw content
        const getRawText = (nodes: any): string => {
            if (typeof nodes === 'string') return nodes;
            if (Array.isArray(nodes)) return nodes.map(getRawText).join('');
            if (nodes?.props?.children) return getRawText(nodes.props.children);
            return '';
        };

        const textToCopy = getRawText(children);

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Animate the code content if animateText is provided
    const animatedChildren = animateText ? animateText(children) : children;

    if (isBlock) {
        return (
            <div className="code-block-wrapper my-6 rounded-2xl overflow-hidden border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] bg-white/40 backdrop-blur-[12px] transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group/code" style={{
                animationName: animation,
                animationDuration,
                animationTimingFunction,
                animationIterationCount: 1,
            }}>
                {/* Header */}
                <div className="code-block-header flex justify-between items-center px-4 py-2.5 bg-slate-50/40 border-b border-slate-200/40">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5 mr-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200/80" />
                        </div>
                        <span className="code-language text-[10px] font-bold tracking-[0.1em] text-slate-400 group-hover/code:text-blue-500 transition-colors uppercase">
                            {language}
                        </span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="copy-button p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-white border border-slate-200/50 shadow-[0_2px_5px_rgba(0,0,0,0.03)] text-slate-400 hover:text-blue-500 hover:border-blue-200"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>

                {/* Code Content - use animatedChildren for streaming animation */}
                <pre className={`!my-0 !bg-transparent !border-none !shadow-none !backdrop-blur-none p-5 overflow-x-auto selection:bg-blue-100 selection:text-blue-900 ${className}`} {...props}>
                    <code className={`${className} !bg-transparent !p-0 font-mono text-sm leading-relaxed text-slate-800`} style={{ fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace' }}>
                        {animatedChildren}
                    </code>
                </pre>
            </div>
        );
    }

    // Inline code - also animate
    return (
        <code className={className} {...props} style={{
            animationName: animation,
            animationDuration,
            animationTimingFunction,
            animationIterationCount: 1,
        }}>
            {animatedChildren}
        </code>
    );
};

export default DefaultCode;
