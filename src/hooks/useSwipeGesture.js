import { useState, useEffect } from 'react';

function useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const minSwipeDistance = threshold;

        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }

        setTouchEnd(null);
    }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, threshold]);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    return {
        onTouchStart,
        onTouchMove,
    };
}

export default useSwipeGesture;
