import { useState, useRef } from 'react';

export const useMagnetic = () => {
    const ref = useRef<any>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
        if (!ref.current) return;

        const { clientX, clientY } = e as MouseEvent;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Only run calculating logic if we are 100% inside the button bounds
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Extremely subtle pull (5%)
        setPosition({ x: distanceX * 0.05, y: distanceY * 0.05 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    const style = {
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: x === 0 && y === 0
            ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'transform 0.1s cubic-bezier(0.33, 1, 0.68, 1)'
    };

    return {
        ref,
        style,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        onMouseEnter: handleMouseMove
    };
};
