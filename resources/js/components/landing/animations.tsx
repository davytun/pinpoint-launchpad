import { motion } from 'framer-motion';
import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';

// Scroll reveal animation wrapper using Framer Motion
interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
}

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.16, 1, 0.3, 1], // Custom premium ease-out bezier
            }}
            className="flex w-full flex-col items-center"
        >
            {children}
        </motion.div>
    );
}

// Magnetic pull button animation wrapper using GSAP
interface MagneticProps {
    children: React.ReactElement;
    range?: number; // Distance threshold for pull
    strength?: number; // How strongly it pulls (0 to 1)
}

export function Magnetic({ children, range = 35, strength = 0.35 }: MagneticProps) {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = el.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            // Calculate distance between cursor and center of button
            const distanceX = clientX - centerX;
            const distanceY = clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // If within range, apply pull
            if (distance < range + Math.max(width, height) / 2) {
                gsap.to(el, {
                    x: distanceX * strength,
                    y: distanceY * strength,
                    duration: 0.3,
                    ease: 'power2.out',
                    overwrite: 'auto',
                });
            } else {
                // Return smoothly if cursor drifts out of range
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.4,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });
            }
        };

        const handleMouseLeave = () => {
            // Elastic snap-back on exit
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1.1, 0.4)',
                overwrite: 'auto',
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (el) {
                el.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [range, strength]);

    return (
        <div ref={elRef} className="inline-block">
            {children}
        </div>
    );
}
