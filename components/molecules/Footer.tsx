import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 w-full py-6 px-6 md:px-8 flex items-center justify-center z-10"
        >
            <div className="text-xs md:text-sm text-slate-400 font-medium">
                © 2025 Zeta AI Inc. All rights reserved.
            </div>
        </motion.footer>
    );
};

export default Footer;
