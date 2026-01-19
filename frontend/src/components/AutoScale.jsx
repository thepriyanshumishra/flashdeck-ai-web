import React, { useState, useEffect, useRef } from 'react';

export default function AutoScale({ children, className = "" }) {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const resize = () => {
            const container = containerRef.current;
            const content = contentRef.current;
            if (!container || !content) return;

            // Reset transform to measure true dimensions
            content.style.transform = 'none';

            // Get available dimensions
            const availWidth = container.clientWidth;
            const availHeight = container.clientHeight;

            // Get content dimensions
            const contentWidth = content.scrollWidth;
            const contentHeight = content.scrollHeight;

            // Calculate scale
            let newScale = 1;

            // Calculate max allow scales
            const scaleX = availWidth / contentWidth;
            const scaleY = availHeight / contentHeight;

            // To fit entirely, we must take the smaller of the two scales
            newScale = Math.min(scaleX, scaleY);

            // Apply safety buffer (90% fit)
            newScale *= 0.90;

            // Clamp scale
            // Min: 0.2 (don't disappear)
            // Max: 2.5 (don't become absurdly large)
            newScale = Math.min(Math.max(newScale, 0.2), 2.5);

            setScale(newScale);
            content.style.transform = `scale(${newScale})`;
        };

        // Initial calculate
        resize();

        // Observer for robust size changes
        const observer = new ResizeObserver(resize);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            observer.disconnect();
        };
    }, [children]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex flex-col justify-center items-center overflow-hidden ${className}`}
        >
            <div
                ref={contentRef}
                style={{
                    transformOrigin: 'center center',
                    width: '100%',
                    // Ensure flexibility
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
