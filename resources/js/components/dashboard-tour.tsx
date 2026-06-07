import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface DashboardTourProps {
    startTourKey?: number;
    onTourEnd?: () => void;
}

export default function DashboardTour({ startTourKey = 0, onTourEnd }: DashboardTourProps) {
    const driverInstance = useRef<ReturnType<typeof driver> | null>(null);

    useEffect(() => {
        // Initialize driver instance
        driverInstance.current = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            overlayColor: 'rgba(5, 5, 5, 0.75)',
            stagePadding: 6,
            progressText: 'Step {{current}} of {{total}}',
            nextBtnText: 'Next <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 4px;"><path d="m9 18 6-6-6-6"/></svg>',
            prevBtnText: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="m15 18-6-6 6-6"/></svg> Back',
            doneBtnText: 'Finish',
            steps: [
                {
                    element: '#tour-welcome',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-[#3A54A5] shadow-[0_0_8px_#3a54a5]"></span> Welcome to your Launchpad!</div>',
                        description: "Let's take a quick 1-minute tour to walk you through your PARAGON audit dashboard.",
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-stepper',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Track Your Audit Phase</div>',
                        description: "This stepper displays the active status of your PARAGON certification. We've verified your Application, Payment, and Agreement. Next, our analysts will begin executing your assessment.",
                        side: 'bottom',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-score',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-[#3A54A5] shadow-[0_0_8px_#3a54a5]"></span> Your PARAGON Score</div>',
                        description: 'This shows your overall score (out of 100). It will unlock and display your final certified rating once our analysts complete their review.',
                        side: 'right',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-pillar',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-[#3A54A5] shadow-[0_0_8px_#3a54a5]"></span> Interactive Pillar Analysis</div>',
                        description: "This radar chart visualizes your company's score across all 7 pillars of PARAGON (Potential, Agility, Risk, Alignment, Governance, Operations, and Network).",
                        side: 'left',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-documents',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-[#3A54A5] shadow-[0_0_8px_#3a54a5]"></span> Required Documents</div>',
                        description: 'Upload and manage requested corporate structure, financial statements, and pitch decks here. Quick action helps speed up audit execution.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-messages',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-[#3A54A5] shadow-[0_0_8px_#3a54a5]"></span> Direct Analyst Messaging</div>',
                        description: 'Need assistance or have queries? Open a secure message thread directly with your assigned Lead Analyst here.',
                        side: 'top',
                        align: 'center'
                    }
                },
                {
                    element: '#tour-welcome',
                    popover: {
                        title: '<div class="flex items-center gap-2 text-white font-display text-[15px] font-bold"><span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> You\'re All Set!</div>',
                        description: 'Your guided tour is complete. If you ever need to view this walkthrough again, you can restart it from the "Account Details" section below.',
                        side: 'bottom',
                        align: 'start'
                    }
                }
            ],
            onDestroyed: () => {
                localStorage.setItem('pinpoint_founder_tour_completed', 'true');
                if (onTourEnd) {
                    onTourEnd();
                }
            }
        });

        // Autoplay on first login
        const tourCompleted = localStorage.getItem('pinpoint_founder_tour_completed');
        const timer = !tourCompleted
            ? setTimeout(() => {
                  driverInstance.current?.drive();
              }, 800)
            : null;

        return () => {
            if (timer) clearTimeout(timer);
            if (driverInstance.current) {
                driverInstance.current.destroy();
            }
        };
    }, [onTourEnd]);

    // Handle manual tour restart trigger
    useEffect(() => {
        if (startTourKey > 0 && driverInstance.current) {
            driverInstance.current.drive();
        }
    }, [startTourKey]);

    return null;
}
