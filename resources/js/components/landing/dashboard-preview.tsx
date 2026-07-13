import { motion } from 'motion/react';

export default function DashboardPreview() {
    return (
        <section className="relative z-10 w-full px-6 py-8 md:px-8 md:py-12">
            <div className="mx-auto max-w-5xl">
                {/* Background Glow */}
                <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                    <div className="h-[350px] w-[600px] rounded-full bg-[#3A54A5]/10 blur-[80px]" />
                </div>

                {/* Dashboard Frame */}
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
                    <div className="overflow-hidden rounded-[1.625rem] border border-zinc-200 bg-zinc-950/5 shadow-inner">
                        <img
                            alt="Pinpoint Diligence Dashboard Preview"
                            src="/diligence_dashboard_mockup.png"
                            className="h-auto w-full rounded-[1.625rem]"
                            width="1920"
                            height="1080"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
