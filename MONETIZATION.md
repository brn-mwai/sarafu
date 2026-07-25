# Sarafu: How this makes money

Companion to [PROPOSAL.md](./PROPOSAL.md). That document argues the problem is real. This one argues the business is.

**Rule for this document:** every number is tagged **[FACT]** with a source, **[CALC]** derived from facts, or **[ASSUMPTION]** with the reasoning stated. Nothing is asserted without one of those three labels. A revenue model that hides which numbers are invented is not a model, it is a wish.

---

## 1. The uncomfortable part first

Subscriptions will not make this company large.

Do the arithmetic honestly. The paid ICP is the turnover tax band, KES 1,000,000 to 25,000,000 **[FACT, KRA]**. Call it 1.2 million businesses **[ASSUMPTION: 1.56M licensed MSMEs exist (FACT, Draft MSME Policy 2025); most licensed businesses clear the KES 1M floor, and some unlicensed ones do too. 1.2M is the midpoint of a wide range and is the single most load-bearing assumption here]**.

At KES 500 per month, capturing 3% of that band in five years:

| | |
| --- | --- |
| Paying businesses | 36,000 **[ASSUMPTION: 3% penetration]** |
| ARR | KES 216M ≈ **USD 1.66M** **[CALC]** |

That is a good Kenyan software business. It is not a large one. Anyone pitching subscription revenue as the story here is either not doing the arithmetic or hoping you will not.

**The subscription is not the business. The ledger is.** The subscription exists to keep the ledger alive until the ledger becomes an asset that can be monetised against a USD 19.3 billion financing gap **[FACT, FSD Kenya]**. Everything below follows from that.

---

## 2. Unit economics, computed not asserted

### Cost of goods sold, per user per month

The parse runs on Claude. Real API pricing **[FACT, Anthropic]**: Sonnet 5 at USD 3.00 / 15.00 per million input / output tokens; Haiku 4.5 at USD 1.00 / 5.00.

A three-month M-Pesa statement for an active duka is roughly 400 transactions **[ASSUMPTION: ~4 to 5 M-Pesa transactions per trading day]**. That is about 20,000 input tokens of raw statement text and about 16,000 output tokens of structured JSON **[ASSUMPTION: ~40 output tokens per classified transaction]**.

| Model | Input cost | Output cost | Per initial import |
| --- | --- | --- | --- |
| Sonnet 5 | USD 0.060 | USD 0.240 | **USD 0.30** **[CALC]** |
| Haiku 4.5 | USD 0.020 | USD 0.080 | **USD 0.10** **[CALC]** |

Ongoing months are roughly a third of that volume. And here the moat pays for itself: once the classification ground truth has learned a business's counterparties, most lines resolve by deterministic lookup and never reach a model at all.

| Line item | Month 1 | Steady state (month 6+) |
| --- | --- | --- |
| Parse and classify | USD 0.10 | USD 0.015 **[ASSUMPTION: ~60% of lines resolve from the learned counterparty table]** |
| Hosting, storage, compute | USD 0.02 | USD 0.02 **[ASSUMPTION]** |
| **Daily cash prompt over SMS** | **USD 0.19** | **USD 0.19** **[CALC: 30 messages/month at KES 0.80, at KES 129/USD]** |
| **Total** | **USD 0.31** | **USD 0.23** |

### The finding that matters

**Messaging costs more than the AI does.** At steady state the daily cash prompt is roughly 83% of COGS, and the model that does the actual work is under 7%.

This is not a footnote. The cash mechanism is simultaneously the moat (Section 6 of the proposal), the biggest product risk (Section 9), and now the dominant cost line. Three separate reasons the same design decision is the most important one in the company.

**The mitigation is a channel change, not a product change.** WhatsApp Business utility templates cost roughly USD 0.005 to 0.01 per conversation in Kenya **[ASSUMPTION: WhatsApp Business API pricing is public but changes; verify before relying on it]**, against KES 0.80 for an SMS. Moving the daily prompt to WhatsApp with SMS as fallback for feature phones takes messaging from USD 0.19 to roughly USD 0.05, and total COGS from USD 0.23 to **USD 0.09** **[CALC]**.

### Margin

| | Monthly | Annual |
| --- | --- | --- |
| Revenue, paid tier | KES 500 ≈ USD 3.88 | USD 46.51 |
| COGS (WhatsApp path) | USD 0.09 | USD 1.08 |
| **Gross margin** | **97.7%** **[CALC]** | |

Software margins, as expected. The interesting number is not this one.

### The free tier is not free

At USD 0.09 per user per month, a free base of 1,000,000 businesses costs **USD 1.08M per year to serve** **[CALC]**. On the SMS-only path it costs USD 2.76M.

That is the central financial constraint of this business, and it is a direct consequence of the strategy in the proposal: give the product away below the KES 1M turnover floor, because that is where 5.85 million businesses are and where the dataset comes from. The free tier is a deliberate, quantified purchase of a dataset and a funnel. It has to be underwritten by the revenue lines below, and it has to be watched, because it scales with users while subscription revenue scales only with the small paid band.

### CAC and payback

Consumer-style paid acquisition does not work on a KES 3,000-a-month customer. Three channels that do:

| Channel | Est. CAC | Reasoning |
| --- | --- | --- |
| Chama and SACCO group onboarding | USD 2 to 4 **[ASSUMPTION]** | One session converts 20 to 40 members. Kenya's savings groups are the highest-density SME channel that exists. |
| Wholesaler and distributor partnerships | USD 3 to 6 **[ASSUMPTION]** | The wholesaler wants their dukas solvent and reordering. Distribution in exchange for aggregate demand data. |
| Referral within trade clusters | USD 1 to 3 **[ASSUMPTION]** | Traders in one market talk. The product is legible in one sentence. |

At USD 4 CAC and USD 46.51 annual gross profit on a paid user, payback is **under 5 weeks** **[CALC]**. The risk in that number is not CAC, it is what fraction of free users ever cross into the paid band.

---

## 3. Five revenue lines, ordered by how soon they pay

### Line 1: Subscription, KES 500/month, from month 6

Covered above. USD 1.66M ARR at 36,000 paying businesses in year five. Necessary, unexciting, and the thing that proves willingness to pay.

### Line 2: Done-for-you tax filing, from month 9

The subscription gives her the number. Most owners in this band do not want the number, they want the filing to be over.

TOT is due monthly by the 20th **[FACT, KRA]**. A filing service at **KES 1,500 per year** on top of the subscription is a small ask against the cost of a bookkeeper, and it converts a software product into an outcome.

At 36,000 paying businesses with 60% attach **[ASSUMPTION]**: KES 32.4M ≈ **USD 250k** **[CALC]**.

Strategically this matters more than the revenue: it is the first line where Sarafu is paid for a **result** rather than for access, and results are what an informal business actually buys.

### Line 3: eTIMS compliance, from month 12

KRA is actively pushing to remove the KES 5,000,000 eTIMS exemption **[FACT, Techweez, April 2025]**, and guidance is drifting toward all businesses issuing electronic receipts regardless of turnover.

If that lands, several million businesses acquire an e-invoicing obligation they have no tooling for, on a deadline, simultaneously. Sarafu already holds their transaction ledger, which is the hard input to eTIMS. Everything else is an integration.

**This is a regulatory forcing function, not a growth hypothesis.** It is also the single largest source of variance in this model: it could arrive in 2027 and triple the paid band overnight, or it could stall for five years. Sizing it precisely would be false precision, so it is not in the projection. It is upside with a named trigger.

### Line 4: The lending rail, from month 18

This is the actual business.

67.9% of Kenyan MSMEs have no access to credit **[FACT, FSD Kenya, 2020]**, and the financing gap is USD 19.3 billion **[FACT, FSD Kenya]**. The reason is not that lenders do not want the volume. Kenya had 252 licensed digital lenders as of 2026, disbursing KSh 150.56 billion by May 2026 **[FACT, CBK via TechTrends]**. The reason is that a business with no books cannot be underwritten, so lenders price on the little they can see and most applications never happen.

A business with 6 to 12 months of categorised, cash-inclusive cashflow in Sarafu is underwritable. Sarafu does not need to lend. It needs to originate.

**Base case, year five:**

| | |
| --- | --- |
| Free users with 6+ months of verified ledger | 300,000 **[ASSUMPTION]** |
| Annual loan take-up | 15% **[ASSUMPTION]** |
| Loans originated | 45,000 **[CALC]** |
| Average facility | KES 60,000 **[ASSUMPTION: working capital for a duka, consistent with digital lender ticket sizes]** |
| Origination share | 3% **[ASSUMPTION: within normal range for referral and lead-gen arrangements; not independently verified]** |
| **Revenue** | KES 81M ≈ **USD 628k** **[CALC]** |

The structural point: this revenue line **scales with the free tier, not the paid tier**. It is what makes giving the product away to 5.85 million businesses a strategy rather than a subsidy. Free users are not a cost centre waiting to convert, they are loan origination inventory that also produces the classification dataset.

Later, and only with a balance sheet and a licence, taking the credit risk instead of the referral fee multiplies this by roughly an order of magnitude. That is a different company with different regulation and different capital needs. Naming it as the destination is honest; modelling it here would not be.

### Line 5: Aggregate demand data, from month 24

Not the owner's data, and not her identity. Anonymised, aggregated purchasing patterns: which categories move in which markets, in which weeks, at what price points.

FMCG manufacturers and distributors in Kenya spend real money to see duka-level demand, and today they mostly cannot. Sarafu sees the purchase side of thousands of small retailers.

Unsized here, deliberately. **[ASSUMPTION: this line is real but requires scale (100k+ active businesses) and a privacy posture that must be designed before it is sold, not after.]** A data product built on a trust product can destroy the trust product. The rule: aggregate only, opt-in, never resold at the level of an identifiable business, and never sold to lenders as a back channel around the consented lending flow.

---

## 4. The projection

**Base case.** Kenya only. Assumes the eTIMS threshold does not move, the lending rail launches in year two, and free-tier growth is funded.

| | Y1 | Y2 | Y3 | Y4 | Y5 |
| --- | --- | --- | --- | --- | --- |
| Free users | 5,000 | 40,000 | 120,000 | 220,000 | 300,000 |
| Paying businesses | 200 | 3,000 | 12,000 | 24,000 | 36,000 |
| Subscription (USD) | 9k | 140k | 558k | 1.12M | 1.66M |
| Tax filing (USD) | — | 21k | 84k | 167k | 250k |
| Lending origination (USD) | — | 45k | 210k | 420k | 628k |
| **Total revenue (USD)** | **9k** | **206k** | **852k** | **1.71M** | **2.54M** |
| Free-tier COGS (USD) | 5k | 43k | 130k | 238k | 324k |

**[ASSUMPTION: every row. Growth curve assumes group-based distribution works as modelled in Section 2 and that 12% of free users eventually cross the KES 1M turnover floor into the paid band.]**

USD 2.5M ARR in year five, in one country, on a product that is free for 88% of its users.

**Bull case.** The two levers that change the magnitude, neither of which is a growth-rate adjustment:

1. **eTIMS threshold removal.** A regulatory event, already under active discussion **[FACT]**. Converts millions of businesses from "no obligation" to "obligation with a deadline". Would plausibly triple the paid band.
2. **Pan-African expansion.** The wedge is not Kenya-specific, it is mobile-money-specific: a dominant mobile money rail, a large informal sector, and a turnover-based tax regime. Tanzania, Uganda, Ghana and Nigeria all qualify. The parse is a prompt, and the tax logic is a rulebook per country. **[ASSUMPTION: neither the market entry nor the regulatory work is as cheap as that sentence makes it sound.]**

Both together, and the arithmetic changes from millions to hundreds of millions. Neither is in the base case, because a projection that requires a regulatory change to work is not a projection.

---

## 5. What would have to be true

The five things that decide whether this works, in order. Each is a test, not a hope.

1. **Owners answer the daily cash prompt.** If they will not type one number a day, the ledger is incomplete, the tax figure is wrong, and the lending rail never underwrites anything. **Everything else in this document depends on this one behaviour.** Testable in two weeks with 20 businesses and a phone.
2. **They cross the turnover floor.** The base case needs 12% of free users to reach KES 1M and convert. If informal businesses mostly do not grow, the free tier is a cost with no exit.
3. **A lender pays for origination.** Needs one signed partner and a validated take rate. Until then, 25% of year-five revenue is an assumption with a percentage sign on it.
4. **The statement on-ramp does not kill activation.** The forward-to-ingest flow is unbuilt. If first-time users drop at the password-protected PDF, none of the rest happens.
5. **Safaricom stays uninterested.** Covered in the proposal. They have the data, the rail, and 900,000+ Pochi la Biashara merchants **[FACT]**. The defence is cash and incentives, and it is a defence, not a guarantee.

---

## 6. The honest summary

Sarafu makes roughly **USD 2.5M ARR in five years in Kenya** on subscriptions, tax filing and loan origination, of which the subscription is the smallest strategic component despite being the largest revenue line.

It becomes a large company only through one of two doors: a regulatory event that is already being discussed publicly, or a pan-African replication of a wedge that is about mobile money rather than about Kenya.

What makes either door reachable is the same asset: **a verified, cash-inclusive ledger for businesses nobody else can see.** The subscription pays the bills. The ledger is the company.
