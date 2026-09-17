import { motion } from 'motion/react';

import ParagonMockup from '@/components/landing/paragon-mockup';

export default function DashboardPreview() {
    return (
        <section className="relative z-10 w-full px-6 py-8 md:px-8 md:py-12">
            <div className="mx-auto max-w-5xl">
                <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                    <div className="h-[350px] w-[600px] rounded-full bg-[#3A54A5]/10 blur-[80px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: [0.21, 1.02, 0.43, 1.01] }}
                    className="relative rounded-4xl border border-white/60 bg-white/20 p-2 shadow-2xl backdrop-blur-md"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
                    }}
                >
                    <ParagonMockup />
                </motion.div>

                <div className="mx-auto mt-6 max-w-xl text-center">
                    <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">PARAGON Readiness Score</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Example: <span className="font-semibold text-zinc-800">85/100</span>. A clearer view of investor readiness across seven
                        areas, not an approval to raise capital.
                    </p>
                </div>
            </div>
        </section>
    );
}
