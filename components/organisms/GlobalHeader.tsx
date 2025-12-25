import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ClayPill } from '../atoms/ClayPill';
import { BellBingLinear, SettingsLinear } from '../atoms/Icons';
import { UserAvatar } from '../atoms/UserAvatar';


// Custom sidebar icon
const SidebarIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
    >
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 11c0-3.771 0-5.657 1.172-6.828C4.343 3 6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172C22 5.343 22 7.229 22 11v2c0 3.771 0 5.657-1.172 6.828C19.657 21 17.771 21 14 21h-4c-3.771 0-5.657 0-6.828-1.172C2 18.657 2 16.771 2 13v-2Z" />
            <path strokeLinecap="round" d="M15 21V3" />
        </g>
    </svg>
);

interface GlobalHeaderProps {
    isSidebarMinimized: boolean;
    onToggleSidebar: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ isSidebarMinimized, onToggleSidebar }) => {
    const { isAuthenticated, user, openLoginModal, openSignupModal } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full h-14 bg-[#F8F9FB] backdrop-blur-sm flex items-center px-4 fixed top-0 left-0 right-0 z-40 gap-6"
        >
            {/* Left Workspace section: Adjusted widths to account for Header Padding (16px) and Content Margin (8px) */}
            <motion.div
                animate={{ width: isSidebarMinimized ? 154 : 252 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-3 flex-shrink-0 overflow-hidden whitespace-nowrap rounded-xl px-2 py-1.5 border border-transparent hover:border-slate-100 transition-colors"
                style={{ width: isSidebarMinimized ? 154 : 252 }} // Fallback/Initial
            >
                {/* Show User Avatar - clickable for sign in when not authenticated */}
                <div
                    onClick={!isAuthenticated ? openLoginModal : undefined}
                    className={`flex items-center gap-1 text-slate-500 transition-colors ${!isAuthenticated ? 'cursor-pointer hover:text-slate-700' : ''}`}
                >
                    <UserAvatar
                        initials={isAuthenticated ? (user?.name?.charAt(0).toUpperCase() || 'U') : '?'}
                        size="sm"
                    />
                    <motion.span
                        animate={{
                            width: isSidebarMinimized ? 0 : "auto",
                            opacity: isSidebarMinimized ? 0 : 1,
                            marginLeft: isSidebarMinimized ? 0 : 4
                        }}
                        transition={{ duration: 0.2, ease: [0.3, 0, 0.2, 1] }}
                        className="text-sm font-medium overflow-hidden"
                    >
                        {isAuthenticated ? (user?.name || 'Personal') : 'Sign in'}
                    </motion.span>
                    {isAuthenticated && <ChevronDown size={14} className="flex-shrink-0" />}
                </div>

                {/* Notification Bell - next to Personal */}
                <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                    <BellBingLinear width={18} height={18} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border border-white rounded-full translate-x-[2px] -translate-y-[2px]"></span>
                </button>

                {/* Sidebar Toggle Button */}
                <button
                    onClick={onToggleSidebar}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 mr-1"
                    title={isSidebarMinimized ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <SidebarIcon size={18} />
                </button>
            </motion.div>

            {/* Spacer to push settings to the right */}
            <div className="flex-1" />

            {/* Right side - Settings & Help Pill */}
            <div className="flex items-center gap-4">
                <ClayPill size="sm">Need Help?</ClayPill>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <SettingsLinear width={18} height={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default GlobalHeader;
