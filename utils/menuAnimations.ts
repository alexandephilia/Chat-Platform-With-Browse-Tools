import { Variants } from 'framer-motion';

export const menuContainerVariants: Variants = {
    hidden: { 
        opacity: 0,
        scale: 0.95, // Bringing back slight scale for depth
        filter: 'blur(8px)',
        transition: { 
            staggerChildren: 0.05, 
            staggerDirection: -1,
            when: "afterChildren" // Ensure children animate out first for hidden
        }
    },
    visible: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.01,
            when: "beforeChildren", // Wait for container to start appearing before firing items
            duration: 0.2
        }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        filter: 'blur(4px)',
        transition: { 
            duration: 0.2,
            ease: "easeInOut",
            staggerChildren: 0.01, 
            staggerDirection: -1,
            when: "afterChildren" // CRITICAL: Container waits for items to finish exiting
        }
    }
};

export const menuItemVariants: Variants = {
    hidden: { 
        x: -5, 
        opacity: 0, 
        skewX: -10, // The "drag" effect
        filter: 'blur(6px)'
    },
    visible: {
        x: 0,
        opacity: 1,
        skewX: 0,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 350,
            damping: 22,
            mass: 0.8
        }
    },
    exit: {
        x: -5,
        opacity: 0,
        skewX: -5,
        filter: 'blur(4px)',
        transition: { 
            duration: 0.07, 
            ease: "easeIn" 
        }
    }
};
