import { useEffect, useRef, useState } from 'react';

/**
 * Barra de rolagem customizada azul, independente do navegador/SO.
 * Esconde a barra nativa (ver .blue-scrollbar-* no index.css) e desenha a própria.
 */
const MIN_THUMB = 48;

const BlueScrollbar = () => {
    const [thumb, setThumb] = useState({ top: 0, height: 0, visible: false });
    const [active, setActive] = useState(false);
    const [dragging, setDragging] = useState(false);
    const hideTimer = useRef<number | undefined>(undefined);
    const dragStart = useRef({ y: 0, scroll: 0 });

    useEffect(() => {
        document.documentElement.classList.add('blue-scrollbar-root');

        const update = () => {
            const doc = document.documentElement;
            const viewH = window.innerHeight;
            const total = doc.scrollHeight;
            if (total <= viewH + 1) {
                setThumb(t => ({ ...t, visible: false }));
                return;
            }
            const trackH = viewH - 8;
            const h = Math.max(MIN_THUMB, (viewH / total) * trackH);
            const maxScroll = total - viewH;
            const top = 4 + (window.scrollY / maxScroll) * (trackH - h);
            setThumb({ top, height: h, visible: true });
        };

        const onScroll = () => {
            update();
            setActive(true);
            window.clearTimeout(hideTimer.current);
            hideTimer.current = window.setTimeout(() => setActive(false), 1200);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', update);
        const ro = new ResizeObserver(update);
        ro.observe(document.body);

        return () => {
            document.documentElement.classList.remove('blue-scrollbar-root');
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', update);
            ro.disconnect();
            window.clearTimeout(hideTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e: PointerEvent) => {
            const doc = document.documentElement;
            const viewH = window.innerHeight;
            const maxScroll = doc.scrollHeight - viewH;
            const trackRange = viewH - 8 - thumb.height;
            const delta = e.clientY - dragStart.current.y;
            window.scrollTo({ top: dragStart.current.scroll + (delta / trackRange) * maxScroll });
        };
        const onUp = () => setDragging(false);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        document.body.style.userSelect = 'none';
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
        };
    }, [dragging, thumb.height]);

    const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        const ratio = e.clientY / window.innerHeight;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
    };

    if (!thumb.visible) return null;

    return (
        <div
            className={`blue-scrollbar-track ${active || dragging ? 'is-active' : ''}`}
            onMouseDown={onTrackClick}
            aria-hidden="true"
        >
            <div
                className={`blue-scrollbar-thumb ${dragging ? 'is-dragging' : ''}`}
                style={{ transform: `translateY(${thumb.top}px)`, height: thumb.height }}
                onPointerDown={e => {
                    e.preventDefault();
                    dragStart.current = { y: e.clientY, scroll: window.scrollY };
                    setDragging(true);
                }}
            />
        </div>
    );
};

export default BlueScrollbar;
