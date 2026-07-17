import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';

interface CobeGlobeProps {
    className?: string;
}

export function CobeGlobe({ className }: CobeGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) {
            return;
        }

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [1, 1, 1], // Pure white base
            markerColor: [58 / 255, 84 / 255, 165 / 255], // Brand Blue #3A54A5 markers
            glowColor: [232 / 255, 236 / 255, 251 / 255], // Soft brand lavender glow
            markers: [
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.05 },
                { location: [9.082, 8.6753], size: 0.05 }, // West Africa
                { location: [51.5074, -0.1278], size: 0.05 }, // London
                { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
            ],
            onRender: (state: Record<string, unknown>) => {
                state.phi = phi;
                phi += 0.005; // Slightly slower, smoother rotation
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return <canvas ref={canvasRef} className={`aspect-square w-[600px] max-w-full ${className ?? ''}`} style={{ height: 'auto' }} />;
}
