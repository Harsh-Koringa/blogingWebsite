import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PenSquare, BookMarked, User } from 'lucide-react';

function BottomNav() {
    const location = useLocation();

    const links = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/add-post', icon: PenSquare, label: 'Write' },
        { to: '/all-posts', icon: BookMarked, label: 'Posts' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <AnimatePresence>
            {/* Only show on mobile */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-background/80 backdrop-blur-lg md:hidden"
            >
                <div className="flex h-16 items-center justify-around px-4">
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className="relative flex flex-col items-center justify-center"
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl">
                                        {isActive && (
                                            <motion.div
                                                layoutId="bottom-nav-active"
                                                className="absolute inset-0 rounded-xl bg-primary/10"
                                                transition={{ type: 'spring', duration: 0.5 }}
                                            />
                                        )}
                                        <Icon
                                            className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* iPhone safe area spacing */}
                <div className="h-safe-bottom bg-background" />
            </motion.nav>
        </AnimatePresence>
    );
}

export default BottomNav;
