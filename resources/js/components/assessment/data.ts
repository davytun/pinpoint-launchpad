export const MECHANISM_STEPS = [
    'We read every document — cap table against CAC filings, model against bank statements.',
    'We interview co-founders separately. Disagreement is invisible in a joint meeting.',
    'We call customers who left. You cannot get an honest answer on your own churn.',
];

export const EVIDENCE_EXAMPLES = [
    {
        claim: 'Our largest customer is on a two-year contract.',
        grade: 'A',
        note: 'Executed contract in the data room. Full score on evidence.',
    },
    {
        claim: 'Churn is running at about five percent.',
        grade: 'B',
        note: 'No export or customer log — score capped at 4 of 5.',
    },
    {
        claim: 'IP assignments will be signed shortly.',
        grade: 'C',
        note: 'No assignment on file — score capped at 2 of 5.',
    },
];

export const PILLARS = [
    {
        letter: 'P',
        name: 'Potential',
        summary: 'Market, wedge, why-now, founder–market fit.',
        question: 'Which customers would be genuinely damaged if you shut down on Friday? Name them.',
        criteria: 5,
    },
    {
        letter: 'A',
        name: 'Agility',
        summary: 'Learning velocity, adaptation, capital efficiency, decision rights.',
        question: 'What would have to be true for you to abandon the current strategy?',
        criteria: 4,
    },
    {
        letter: 'R',
        name: 'Risk',
        summary: 'Licensing, IP chain of title, contracts, data protection, concentration.',
        question: 'Who wrote the code, and what document assigns it to the company?',
        criteria: 6,
    },
    {
        letter: 'A',
        name: 'Alignment',
        summary: 'Unit economics, cap table, incentives, use of funds, valuation realism.',
        question: 'Take one customer. Show us every naira in and every naira out.',
        criteria: 6,
    },
    {
        letter: 'G',
        name: 'Governance',
        summary: 'Corporate standing, constitutional documents, board, financial controls, tax.',
        question: 'Who can move money out of this company, and who checks?',
        criteria: 5,
    },
    {
        letter: 'O',
        name: 'Operations',
        summary: 'Revenue quality, product and technology, team, systems, delivery.',
        question: 'Produce your five most important numbers, right now, without preparing them.',
        criteria: 5,
    },
    {
        letter: 'N',
        name: 'Network',
        summary: 'Partners, channels, data room quality, and investor-ready materials.',
        question: 'Send us your data room. Now, in this meeting.',
        criteria: 6,
    },
];

export const DEAL_STOPPERS = [
    'Core IP is not owned by the company',
    'The cap table does not reconcile to your CAC filings',
    'Personal and company funds are commingled',
];

export const REPORT_INCLUDES = [
    'Deal-stopper register on page one',
    'Full PARAGON profile — substance and evidence scored',
    'Investor-view narrative in their voice, not yours',
    'Panel debrief from the simulation',
    'Prioritised 90-day roadmap',
];

export const TIERS = [
    {
        key: 'concept',
        name: 'Concept / Pre-Seed',
        badge: 'Stage 01',
        price: '$500',
        unit: 'one-off fee',
        description: 'Idea to MVP. Little or no revenue. Validation before you approach investors.',
        features: [
            '21 core criteria',
            'One 90-minute founder session',
            'Corporate documents, cap table and bank statements reviewed',
            'Benchmarked against your stage cohort',
            'Written report and debrief',
        ],
        meta: '10–12 analyst hours · 7 working days',
        featured: false,
    },
    {
        key: 'seed',
        name: 'Seed / Early Traction',
        badge: 'Stage 02',
        price: '$1,500',
        unit: 'one-off fee',
        description: 'Trading under $500k ARR, preparing for a first institutional cheque.',
        features: [
            'All 37 criteria',
            'Three founder sessions — co-founders questioned separately',
            'Full data room: contracts, accounts, model, IP chain, tax',
            'Three customer reference calls',
            '60-minute investor simulation panel',
            'Benchmarked on stage and sector',
        ],
        meta: '25–30 analyst hours · 12 working days',
        featured: true,
    },
    {
        key: 'growth',
        name: 'Seed+ / Growth',
        badge: 'Stage 03',
        price: '$3,500+',
        unit: 'scoped quote',
        description: 'Above $500k ARR, raising a larger round or growth equity.',
        features: [
            'All 37 criteria at maximum depth',
            'Partner-led — five or more sessions, full team triangulation',
            'Code review, open-source licence audit, security posture',
            'Customers, churned customers, suppliers, and prior investors called',
            '90-minute panel including an external investor',
            'Named comparable transactions',
        ],
        meta: '60+ analyst hours · 20 working days',
        featured: false,
    },
];

export const RAISE_TARGETS = ['Under $100k', '$100k–$500k', '$500k–$2m', '$2m–$10m', 'Over $10m', 'Not sure yet'];

export const APPLY_STEPS = [
    'We review your stage and raise target within 48 hours.',
    'You receive scope, fee confirmation, and what to prepare.',
    'After payment, analysts schedule sessions and document review.',
];
