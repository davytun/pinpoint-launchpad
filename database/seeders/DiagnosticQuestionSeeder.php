<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiagnosticQuestion;

class DiagnosticQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // ─── POTENTIAL (Q1 - Q3) ────────────────────────────────────────────────
            [
                'pillar'        => 'potential',
                'question_text' => 'How do you know people actually want this?',
                'sub_text'      => 'Investors discount opinion. They price evidence.',
                'strand'        => null,
                'order'         => 1,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We believe there is a real need, based on our own experience of the problem.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have spoken to potential customers and the response has been positive.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'People are using it. Some come back without being chased.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'People are paying, using it repeatedly, and telling other people about it.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'potential',
                'question_text' => 'Can you size the market you are actually going after — and say why now?',
                'sub_text'      => 'Not the country. Not the sector. The customers you can realistically reach and charge, and the specific change that opened the window.',
                'strand'        => null,
                'order'         => 2,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We quote a large market figure from a report, and it is simply a good idea nobody has done well here.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have a top-down estimate, and the market is growing, so we think we can take a slice.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We have built the market bottom-up — reachable customers × realistic price — and we can name the specific change that opened this window.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Bottom-up sizing, a named change we can point to, and evidence that the change is already moving our numbers.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'potential',
                'question_text' => 'What makes this team the ones to build it?',
                'sub_text'      => 'Founder–market fit. At early stage, this is most of the investment decision.',
                'strand'        => null,
                'order'         => 3,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We are capable people who spotted the opportunity.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'One of us has relevant industry background.', 'points' => 2, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We have lived this problem professionally and we have the network the business needs.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We have lived it, we have the network, and we have built and shipped in this space before.', 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── AGILITY (Q4 - Q6) ──────────────────────────────────────────────────
            [
                'pillar'        => 'agility',
                'question_text' => 'How quickly do you go from learning something to changing something?',
                'sub_text'      => 'Speed of iteration is the closest early-stage proxy for whether a company can survive.',
                'strand'        => null,
                'order'         => 4,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We work to an annual plan and revisit it when it clearly stops working.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We review things quarterly.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We ship, measure and adjust every few weeks.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We run structured experiments continuously, and we can point to decisions they changed.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'agility',
                'question_text' => 'Have you ever changed direction because the evidence told you to?',
                'sub_text'      => 'Investors are not looking for consistency. They are looking for a team that can be wrong quickly.',
                'strand'        => null,
                'order'         => 5,
                'options'       => [
                    ['letter' => 'A', 'text' => 'No — we have stayed with the original plan throughout.', 'points' => 1, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have made small adjustments to features or pricing.', 'points' => 2, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We changed something material — segment, model or product — because the data said so.', 'points' => 4, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We have made more than one such change, and each one improved the numbers.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'agility',
                'question_text' => 'How many months could you operate if no new money arrived tomorrow?',
                'sub_text'      => 'Runway is not just survival. It is negotiating position.',
                'strand'        => null,
                'order'         => 6,
                'options'       => [
                    ['letter' => 'A', 'text' => 'Under 3 months. This raise is urgent.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => '3 to 6 months.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => '6 to 12 months.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Over 12 months, or we are profitable.', 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── RISK (Q7 - Q10) ────────────────────────────────────────────────────
            [
                'pillar'        => 'risk',
                'question_text' => 'Do you need a licence or regulatory approval to do what you do?',
                'sub_text'      => 'In fintech, digital assets, health, lending and education, this is the first thing diligence looks for.',
                'strand'        => null,
                'order'         => 7,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We are not sure. We have not looked into it properly.', 'points' => 0, 'flag' => 'Regulatory status unknown. In a licensed sector this alone ends most diligence processes.'],
                    ['letter' => 'B', 'text' => 'We think we need one and we have not started.', 'points' => 1, 'flag' => 'Licence identified but no application under way.'],
                    ['letter' => 'C', 'text' => 'We know exactly what is required and the application is in progress.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We hold what we need, or we have confirmed in writing that nothing is required.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'risk',
                'question_text' => 'Who legally owns the code, brand and IP?',
                'sub_text'      => 'Founders and contractors own what they create unless a signed assignment says otherwise. Most early companies fail this.',
                'strand'        => null,
                'order'         => 8,
                'options'       => [
                    ['letter' => 'A', 'text' => 'The founders and developers built it. We have never papered it.', 'points' => 0, 'flag' => 'IP is not owned by the company. This is the single most common deal-killer in African seed diligence.'],
                    ['letter' => 'B', 'text' => 'Employees are covered by contract. Freelancers and past contractors are not.', 'points' => 1, 'flag' => 'Contractor-created IP is unassigned — a gap that surfaces in every data room.'],
                    ['letter' => 'C', 'text' => 'Everything is assigned to the company. Trademarks are not yet filed.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'All IP is assigned to the company and our core marks are registered or filed.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'risk',
                'question_text' => 'How much of your revenue comes from your largest customer?',
                'sub_text'      => 'Concentration is fine at the start. Undisclosed concentration is not.',
                'strand'        => null,
                'order'         => 9,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We have no revenue yet.', 'points' => 2, 'flag' => null],
                    ['letter' => 'B', 'text' => 'More than half comes from one customer.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Our largest customer is 20–50% of revenue.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'No single customer is more than 20%.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'risk',
                'question_text' => "If one founder left tomorrow, what would break?",
                'sub_text'      => "Key-person risk is priced. It is not a reason to pass — being unable to answer the question is.",
                'strand'        => null,
                'order'         => 10,
                'options'       => [
                    ['letter' => 'A', 'text' => "Almost everything. One person holds the relationships, the knowledge and the accounts.", 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => "A lot. We have started documenting but it lives largely in people's heads.", 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => "Core processes are documented and access is shared. It would hurt but we would function.", 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => "We have a real second layer of management, documented systems, and vesting on founder shares.", 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── ALIGNMENT (Q11 - Q14) ──────────────────────────────────────────────
            [
                'pillar'        => 'alignment',
                'question_text' => 'Do you know what it costs to win a customer, and what that customer is worth?',
                'sub_text'      => 'CAC and LTV. If you cannot answer this, you cannot defend your growth plan.',
                'strand'        => null,
                'order'         => 11,
                'options'       => [
                    ['letter' => 'A', 'text' => 'Not really — we have not worked it out.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have a rough sense of what marketing costs us per customer.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We track CAC and payback period and we know our LTV:CAC ratio.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We track both by channel and by segment, and we make spending decisions on that basis.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'alignment',
                'question_text' => 'Does each sale make money, before overheads?',
                'sub_text'      => 'Gross margin per unit. Growth on a negative contribution margin is just a faster way to run out of cash.',
                'strand'        => null,
                'order'         => 12,
                'options'       => [
                    ['letter' => 'A', 'text' => 'No — we lose money on each sale and we are growing anyway.', 'points' => 0, 'flag' => 'Negative unit economics with active growth. Investors read this as burning capital to buy vanity metrics.'],
                    ['letter' => 'B', 'text' => 'We are roughly at break-even per sale.', 'points' => 2, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Each sale is profitable before overheads and the margin is improving.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Each sale is profitable, margins are improving, and we can show the trend over 12+ months.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'alignment',
                'question_text' => 'What does your cap table look like?',
                'sub_text'      => 'An investable cap table leaves the people doing the work with enough reason to stay.',
                'strand'        => null,
                'order'         => 13,
                'options'       => [
                    ['letter' => 'A', 'text' => 'A previous investor, adviser or agency holds a large chunk — 20% or more — for early help.', 'points' => 0, 'flag' => 'Dead equity on the cap table. Most institutional investors will not fund around this without a restructure.'],
                    ['letter' => 'B', 'text' => 'We are not certain who owns what. Some of it was agreed informally.', 'points' => 0, 'flag' => 'Cap table is not documented. This must be resolved before any term sheet.'],
                    ['letter' => 'C', 'text' => 'The founders hold the majority. It is documented but there is no option pool.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Clean, documented, founders in control, with an option pool set aside for the team.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'alignment',
                'question_text' => 'What would you do with the money, and what would it prove?',
                'sub_text'      => 'A raise buys the next round of evidence. Investors want to know what evidence.',
                'strand'        => null,
                'order'         => 14,
                'options'       => [
                    ['letter' => 'A', 'text' => 'It would extend runway and let us keep building.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have a budget split across hiring, marketing and product.', 'points' => 2, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We know what the money buys, over what period, and what milestone it gets us to.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We can name the milestone, the date, and what it makes the company worth at the next round.', 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── GOVERNANCE (Q15 - Q17) ─────────────────────────────────────────────
            [
                'pillar'        => 'governance',
                'question_text' => 'Is the company properly incorporated, with the paperwork done?',
                'sub_text'      => 'CAC in Nigeria; the equivalent registry elsewhere. Filings, register of members, share certificates.',
                'strand'        => null,
                'order'         => 15,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We are trading but not yet incorporated, or the registration is not complete.', 'points' => 0, 'flag' => 'Not properly incorporated. Nobody can invest in an entity that does not exist.'],
                    ['letter' => 'B', 'text' => 'Incorporated, but annual returns or statutory registers are behind.', 'points' => 1, 'flag' => 'Statutory filings are in arrears — a fixable but visible problem in diligence.'],
                    ['letter' => 'C', 'text' => 'Incorporated, filings current, registers maintained.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'All of that, plus tax registration, TIN and a clean compliance record.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'governance',
                'question_text' => "Is there a shareholders' agreement between the founders?",
                'sub_text'      => 'The document that decides what happens when founders disagree. Written before they do.',
                'strand'        => null,
                'order'         => 16,
                'options'       => [
                    ['letter' => 'A', 'text' => 'No. We trust each other.', 'points' => 0, 'flag' => 'No founder agreement. Every founder dispute begins here.'],
                    ['letter' => 'B', 'text' => 'We have discussed the terms but nothing is signed.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Signed, covering equity, roles and what happens if someone leaves.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Signed, with vesting, leaver provisions, reserved matters and a deadlock mechanism.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'governance',
                'question_text' => 'Who does the business answer to?',
                'sub_text'      => 'Not control — accountability. Investors want to know that someone outside the room asks hard questions.',
                'strand'        => null,
                'order'         => 17,
                'options'       => [
                    ['letter' => 'A', 'text' => 'The founders. There is no board and no outside oversight.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have informal advisers we talk to when we need help.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We have a formal advisory board that meets on a schedule.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'We have a constituted board with minuted meetings and reporting to it.', 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── OPERATIONS (Q18 - Q20) ─────────────────────────────────────────────
            [
                'pillar'        => 'operations',
                'question_text' => 'What is happening with revenue?',
                'sub_text'      => 'Direction matters more than size at every stage below Series A.',
                'strand'        => null,
                'order'         => 18,
                'options'       => [
                    ['letter' => 'A', 'text' => 'No revenue yet.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'Some revenue, but it is lumpy and unpredictable.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Recurring or repeat revenue that is growing steadily.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Recurring revenue growing consistently month on month, with retention we can evidence.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'operations',
                'question_text' => 'What state are your financial records and operating numbers in?',
                'sub_text'      => 'Diligence starts here. Bad records slow a deal by months and shave the valuation off it.',
                'strand'        => null,
                'order'         => 19,
                'options'       => [
                    ['letter' => 'A', 'text' => 'Bank statements, a spreadsheet the founder keeps, and we check the balance.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'A bookkeeper keeps the accounts. We track revenue and rough user numbers.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Proper accounting system, monthly management accounts, personal and business money fully separate, and a defined set of KPIs we can produce on demand.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'All of that, plus accounts prepared or audited to a recognised standard, and a live dashboard the team reviews weekly against targets.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'operations',
                'question_text' => 'Beyond the founders, who is actually in the business?',
                'sub_text'      => 'A company that is only its founders is a project. Investors fund companies.',
                'strand'        => null,
                'order'         => 20,
                'options'       => [
                    ['letter' => 'A', 'text' => 'Just the founders, plus occasional freelancers.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'A small team, mostly part-time or informally engaged.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'A full-time core team with contracts, and the obvious skill gaps identified.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Full-time team with defined roles, contracts, and the key hires for the next 12 months mapped.', 'points' => 4, 'flag' => null],
                ]
            ],
            // ─── NETWORK (Q21 - Q25) ────────────────────────────────────────────────
            [
                'pillar'        => 'network',
                'question_text' => 'What holds your relationship with your critical suppliers together?',
                'sub_text'      => 'The vendors, processors, manufacturers or licensors you cannot trade without. Diligence asks to read those contracts.',
                'strand'         => 'commercial',
                'order'         => 21,
                'options'       => [
                    ['letter' => 'A', 'text' => 'A handshake, a WhatsApp thread, or an invoice. Nothing signed.', 'points' => 0, 'flag' => 'Critical supplier relationships are unpapered. An investor cannot value a business whose supply can be withdrawn without notice.'],
                    ['letter' => 'B', 'text' => 'Signed contracts, but short-term, terminable at will, or with no pricing certainty.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Written contracts with defined terms, notice periods and pricing.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Written contracts with committed terms, SLAs, and a qualified alternative supplier we could switch to.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'network',
                'question_text' => 'How dependent are you on a channel or platform you do not control?',
                'sub_text'      => 'An API, a marketplace, a sponsor bank, a telco, a single distributor. If they change their terms, what happens to you?',
                'strand'         => 'commercial',
                'order'         => 22,
                'options'       => [
                    ['letter' => 'A', 'text' => 'One partner we do not control sits between us and most of our customers or revenue.', 'points' => 0, 'flag' => 'Single-point channel dependency. This is the risk that turns a good business into an uninvestable one overnight.'],
                    ['letter' => 'B', 'text' => 'We depend heavily on one channel, but there is no contract governing it.', 'points' => 1, 'flag' => 'Primary distribution channel is not contractually secured.'],
                    ['letter' => 'C', 'text' => 'We have a contract with our main channel and a second one being built.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Multiple channels, contractually secured, and no single one is more than half our volume.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'network',
                'question_text' => 'What does your partnership and integration network actually deliver?',
                'sub_text'      => 'Integrations, distribution partners, institutional relationships. Not logos — signed relationships that move numbers.',
                'strand'         => 'commercial',
                'order'         => 23,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We have discussed partnerships. Nothing is signed and nothing has produced revenue.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have MOUs or letters of intent, but no live integrations and no revenue from them.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'We have signed partnerships or integrations that are live and generating measurable volume.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Live, revenue-generating partnerships, plus real institutional relationships in our sector.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'network',
                'question_text' => 'If an investor asked for your deck and data room today, what would you send?',
                'sub_text'      => 'Deck, model, accounts, contracts, cap table, corporate documents. Speed of response is itself a signal.',
                'strand'         => 'capital',
                'order'         => 24,
                'options'       => [
                    ['letter' => 'A', 'text' => 'We would have to build both from scratch. It would take weeks.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'We have a deck, but it is mostly product screenshots and vision, and there is no data room.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'A structured deck covering problem, evidence, economics, team and the ask, plus a folder of core documents.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'A deck built around evidence with a model behind every claim, and an indexed data room we could share within the hour.', 'points' => 4, 'flag' => null],
                ]
            ],
            [
                'pillar'        => 'network',
                'question_text' => 'How many real investor conversations have you had?',
                'sub_text'      => 'Not introductions. Conversations where someone asked you hard questions and you found out what they thought.',
                'strand'         => 'capital',
                'order'         => 25,
                'options'       => [
                    ['letter' => 'A', 'text' => 'None yet. We do not know any investors.', 'points' => 0, 'flag' => null],
                    ['letter' => 'B', 'text' => 'A handful of informal conversations. Nobody has told us anything useful.', 'points' => 1, 'flag' => null],
                    ['letter' => 'C', 'text' => 'Several proper meetings. We have been told no, and we know why.', 'points' => 3, 'flag' => null],
                    ['letter' => 'D', 'text' => 'Multiple processes, some reaching diligence or term sheet, and warm relationships with investors or DFIs active in our sector.', 'points' => 4, 'flag' => null],
                ]
            ],
        ];

        // Clear existing questions to ensure clean database state
        DiagnosticQuestion::truncate();

        foreach ($questions as $data) {
            DiagnosticQuestion::create(array_merge($data, ['is_active' => true]));
        }
    }
}
