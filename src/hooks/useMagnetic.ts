import { useState, useEffect, useRef } from 'react';

export const useMagnetic = () => {
    const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Magnetic force radius
        const limit = 100;
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

        if (distance < limit) {
            // Smoothly follow the mouse with a subtle pull
            setPosition({ x: distanceX * 0.3, y: distanceY * 0.3 });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const { x, y } = position;

    const style = {
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: x === 0 && y === 0
            ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy/Smooth return
            : 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)'   // Smooth follow
    };

    return { ref, style };
};
