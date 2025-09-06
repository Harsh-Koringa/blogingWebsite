import { useState, useCallback, useRef } from 'react';

function useLongPress({
    onLongPress,
    onClick,
    duration = 500,
}) {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef();
    const target = useRef();

    const start = useCallback(
        (event) => {
            event.preventDefault();
            const clonedEvent = { ...event };

            if (onClick && event.type === 'click') {
                onClick(clonedEvent);
                return;
            }

            if (event.type === 'mousedown' && event.button !== 0) return;

            if (!longPressTriggered) {
                target.current = event.target;
                timeout.current = setTimeout(() => {
                    onLongPress(clonedEvent);
                    setLongPressTriggered(true);
                }, duration);
            }
        },
        [onLongPress, onClick, duration, longPressTriggered]
    );

    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            shouldTriggerClick &&
                !longPressTriggered &&
                onClick &&
                event.target === target.current &&
                onClick(event);
            setLongPressTriggered(false);
            target.current = undefined;
        },
        [onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e) => start(e),
        onTouchStart: (e) => start(e),
        onMouseUp: (e) => clear(e),
        onMouseLeave: (e) => clear(e, false),
        onTouchEnd: (e) => clear(e),
    };
}

export default useLongPress;
