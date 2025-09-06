import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, RefreshCw } from 'lucide-react';

function PullToRefresh({ onRefresh, children }) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    const threshold = 80;
    const springConfig = { damping: 30, stiffness: 200 };
    const y = useSpring(0, springConfig);

    const rotate = useTransform(y, [0, threshold], [0, 180]);
    const opacity = useTransform(y, [0, threshold * 0.3], [0, 1]);
    const scale = useTransform(y, [0, threshold], [0.8, 1]);

    useEffect(() => {
        y.set(pullDistance);
    }, [pullDistance, y]);

    const handleTouchStart = (e) => {
        const scrollTop = document.documentElement.scrollTop;
        if (scrollTop <= 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (startY === 0 || isRefreshing) return;

        const scrollTop = document.documentElement.scrollTop;
        if (scrollTop > 0) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0) {
            e.preventDefault();
            setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setPullDistance(0);
        setStartY(0);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen"
        >
            <motion.div
                className="fixed left-0 right-0 top-0 z-50 flex justify-center"
                style={{ y }}
            >
                <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur-xl"
                    style={{ scale, opacity }}
                >
                    <motion.div style={{ rotate }}>
                        {isRefreshing ? (
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                            <ArrowDown className="h-6 w-6 text-primary" />
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>

            {children}
        </div>
    );
}

export default PullToRefresh;
