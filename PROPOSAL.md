# Sarafu

**Financial visibility for the 5.8 million Kenyan businesses that have no books.**

AI Mashinani 2026, Biashara track.

---

## 1. The problem

A Kenyan shopkeeper knows money came in today. She cannot tell you whether she made a profit this month.

That is not a knowledge gap. It is a data gap. Her business runs on three ledgers that never meet:

1. **M-Pesa**, a flat list of money in and money out with no meaning attached. Nothing in it says which line was a sale and which was stock.
2. **Cash**, which leaves no record at all.
3. **Memory**, which is where margin, top customers and tax exposure actually live.

Nobody has ever put those three in one place for her, because every tool that exists assumes she already has what she does not have: a till number, a paybill, an accountant, or a formal registration.

### The evidence

| Fact | Figure | Source |
|---|---|---|
| MSMEs in Kenya | 7.41 million, of which 5.85 million are unlicensed | KNBS MSME Survey / Draft MSME Policy 2025 |
| Share of all Kenyan businesses | 98% | FSD Kenya / IFC |
| Share of new jobs created in 2024 | 703,000 of 782,000 | KNBS Economic Survey 2025 |
| MSMEs that fail within three years | 60% to 70% | Ministry of Industrialization, Trade and Enterprise Development |
| SMEs collapsing annually | over 400,000, poor record keeping a leading cause | KNBS |
| Kenyan MSME financing gap | USD 19.3 billion | FSD Kenya |
| MSMEs with no access to credit | 67.9% | FSD Kenya, 2020 |
| SME transactions touching M-Pesa | over 90% | industry estimate |

Read those together and the causal chain is not subtle. No records, so no visibility. No visibility, so pricing and stock decisions are guesses. No records, so no lender will underwrite her, which is a large part of a USD 19.3 billion gap. Then the business dies inside three years and gets counted in the 400,000.

### The competitor that matters is Safaricom

Not Zoho. **Pochi la Biashara** already gives a micro-trader a separate business wallet on the same M-Pesa line, free, reachable on `*334#` and the SIM toolkit, with mini-statements, Taasi loans and Ziidi savings attached. Over 900,000 active merchants use it, and more than half of them are women. Safaricom also already scores M-Pesa cashflow for credit through M-Shwari, Fuliza and Taasi. They own the data, the rail and the distribution.

Any honest pitch has to answer "why would Safaricom not just do this," so:

**Pochi separates the money. It does not explain the money.** A second wallet gives her a balance. It does not give her a margin. There is no expense side, no categorisation, no cost of goods, no tax position. Knowing KES 84,000 came in tells her nothing about whether she made anything, which is the exact question she cannot answer today.

Three structural reasons the gap persists:

1. **Safaricom sees only what crosses M-Pesa.** Cash is invisible to them by construction, and cash is a large share of informal trade. Their picture cannot be completed from the inside.
2. **Their incentive is transaction volume, not legibility.** Safaricom monetises payments and lending against float. Making a duka's P&L legible to its owner does not move either number, so it stays a feature request forever.
3. **The tail is unglamorous.** Categorising a hardware stall's supplier payments is messy, low-ARPU, support-heavy work. It is not where a telco with a 50 million user base spends product cycles.

The honest version: they could. It is in the risk table below.

### Why the accounting tools do not close it either

ZYNO Books, Qwan, Zoho Books Kenya edition and Auni all handle M-Pesa in some form. Every one of them is built for the business that is **already formal**: paybill or till, a KRA PIN in active use, often a bookkeeper, and turnover that justifies a subscription and a setup process.

That is roughly 1.56 million businesses. The other 5.85 million are not underserved by those products. They are **out of scope** for them.

The gap is not better accounting, and it is not another wallet. It is a first ledger for a business that has never had one, covering the cash that Safaricom cannot see, with zero integration and zero registration as preconditions.

## 2. Who Sarafu is for

The owner-operator doing KES 50,000 to KES 4 million a year. A duka, a salon, a hardware stall, a boda fleet of three, a food kiosk, a small distributor. She runs the business from one phone. She banks on M-Pesa. She takes cash. She has no accountant and no paybill, and if she has a KRA PIN she has probably not thought about turnover tax.

Two numbers, kept separate on purpose:

- **Reach ICP:** the whole informal tail, from KES 50,000 a year upward. Free, permanently. This is the funnel and the dataset.
- **Paid ICP:** the KES 1M to 25M turnover band, where turnover tax is a legal obligation and a subscription is a rounding error against revenue.

Conflating those two is how this pitch got the pricing wrong the first time. See the business model section.

Explicitly **not** the target for v1: VAT-registered businesses with a finance team. They are already served.

## 3. What Sarafu does

Three surfaces, one loop.

**Import.** She gets her statement to Sarafu, and Claude turns it into a ledger. No Daraja integration, no till number, no paybill, no bank connection, no KRA credentials. Claude parses the raw statement text into structured transactions and gives every line a business meaning: sale, stock purchase, supplier, transport, rent, utilities, wages, fees.

That classification step is the whole product. A statement tells her money moved. A ledger tells her whether she is making money, and only one of those is a business record.

### The on-ramp is the hard part, and we should say so

The full M-Pesa statement is requested on `*334#` and **arrives by email as a password-protected PDF**. The password is an access code sent by SMS, or on older statements the owner's national ID number. The `*334#` mini-statement is SMS only and covers the last five transactions, which is not a ledger.

So "just paste it" understates the friction, and any judge who has actually pulled a statement knows it. The real on-ramp ladder:

| Stage | Mechanism | Friction |
| --- | --- | --- |
| Today, demo | Paste statement text | Low once she has text, but she has to get it out of the PDF |
| v1 | Forward the statement email to an ingest address, reply with the SMS code to unlock | One forward, one reply. No app, no copy-paste |
| v2 | In-app request flow that walks the `*334#` steps, then unlocks with the code she pastes | One screen |

Email forwarding is the answer, not pasting. Pasting is what fits in a hackathon. Calling that out is more useful than pretending the PDF does not exist.

### How cash actually gets in

This is the load-bearing risk in the whole business, so it gets a mechanism and not a hand-wave.

An owner who will not keep books will not log every cash sale. That is definitionally true, and any design that asks her to is already dead. So Sarafu never asks for one entry per sale.

**It asks for one number per day.**

1. **One scalar, once a day.** End of day: "Cash today?" She types `3400`. Ten seconds, one field, no categories, no receipts. This is the entire cash UX.
2. **Then it stops asking.** After roughly two weeks Sarafu knows her cash-to-M-Pesa ratio and her day-of-week shape. The prompt becomes "Yesterday looked like about 3,000 in cash. Right?" and one tap confirms it. Confirmation is easier than recall, and it degrades gracefully when she is busy.
3. **Skipped days are marked estimated, never invented.** A day she does not answer is shown as an estimate in the dashboard and excluded from the tax figure. Sarafu will show her an incomplete number before it shows her a confident wrong one.
4. **It works off-app.** The prompt runs over SMS reply and USSD, not only in the web app, because she is on a feature phone a good part of the time.

The bet: transaction-level bookkeeping fails for this segment, and daily-scalar bookkeeping might not. It is falsifiable, it is the first thing to test with real users, and it is cheap to test.

**Dashboard.** Revenue, expenses, gross margin, cash position, top customers, best and worst days. Plus manual cash entry, because a purely M-Pesa view of an informal business is a lie by omission. Cash sales sit in the same ledger as M-Pesa sales and the totals are honest.

**Tax.** The ledger is already the tax return. Sarafu computes turnover tax at 1.5% of gross sales, flags the KES 1,000,000 registration floor and the KES 25,000,000 ceiling, counts down to the 20th of the month, and warns her when she is approaching the KES 5,000,000 line where VAT and eTIMS obligations begin. Output is eTIMS-ready line items, not a lecture about compliance.

The insight tying it together: **compliance is a by-product of visibility, not a separate product.** She does not want to do tax. She wants to know if she made money. Do the second properly and the first falls out of it for free.

## 4. Why now

### The Finance Act 2026 did not give SMEs relief. It raised the price of having no records.

This is the single most important thing happening to this market, and it is easy to misread. The Act introduced no sweeping SME tax relief, no bookkeeping incentive, no simplified filing. What it did instead:

1. **KRA can originate its own assessments.** If a business cannot produce records, KRA is no longer limited to auditing what she self-declared. It can estimate her liability and assess her on that estimate. **A business with no books does not avoid tax. It gets estimated.**
2. **Declared sales are matched against electronic records.** eTIMS and e-invoicing data are increasingly cross-checked against returns, and automated validation of expense claims began in January 2026. Expenses unsupported by electronic invoices are disallowed.
3. **Penalties acquired a floor.** A minimum penalty of KES 10,000 for individuals, KES 100,000 otherwise, for failures including not issuing an eTIMS invoice or not filing electronically.

The consequence for the owner in Section 1 is direct: the cost of her missing records just moved from *invisible* to *quantified and enforced*. She is not being asked to keep books because it is good practice. She is being assessed as though she had them.

**The Finance Act 2026 is the best thing that has happened to this product**, and not because compliance is a market. Because it converts bookkeeping from a chore with no deadline into an obligation with a penalty, for millions of businesses that have no way to comply. Regulation created the demand; nobody has built the supply.

### The other two reasons

- **Statement access got easy.** M-Pesa statements are self-service via the app and `*334#`. The data already exists in the owner's pocket. Nobody has been turning it into a ledger.
- **Parsing stopped being the hard part.** Messy, semi-structured statement text used to need a bespoke parser per format. A frontier model reads it directly, and it reads spoken Swahili just as well. The engineering cost of this wedge collapsed in the last 18 months.

### What this changes about the product

The target is not "an accounting app with a nicer dashboard". Those exist. The target is **the bridge between how an informal business actually behaves and what KRA now expects to see.**

Concretely: she types, in Swahili, into a chat.

> *"Nimenunua unga 4,500. Nimeuza leo 8,200. Nililipa helper 600."*

Sarafu splits that into three classified transactions, updates the ledger, tells her she made KES 3,100 today, and keeps a record that can be reconciled against eTIMS when she needs it. She did not open an app, learn a category system, or know what a ledger is.

**That sentence is the product.** Everything else is reporting on top of it.

## 5. How it works

```
M-Pesa statement text
        |
        v
  Claude Sonnet 5  (forced tool call, strict JSON schema)
        |  normalise + classify every line into a business category
        v
   Transaction ledger  <---- manual cash entry
        |
        +--> Dashboard   revenue, expenses, margin, top customers
        |
        +--> Tax         TOT at 1.5%, thresholds, eTIMS-ready lines
```

**Stack:** Next.js 16 App Router, Astryx (Meta's design system) for UI, Claude Sonnet 5 via the Anthropic API for parsing and classification, Vercel for hosting.

**Sponsor technology, used and not name-dropped:** Claude is the parser. There is no regex fallback and no hand-written statement grammar. The product does not function without the model, which is the honest test of whether an AI feature is real.

## 6. What is defensible

Not the parsing. That is a prompt, and a competitor can copy it in a week.

What compounds:

1. **The classification ground truth.** Every correction an owner makes ("that payment was stock, not transport") is a labelled example. Kenyan counterparty names, till numbers and supplier patterns are a dataset that only accumulates from real usage.
2. **The cash layer.** Everyone reads M-Pesa because M-Pesa has an API. Cash has no API, so it gets ignored, so every competitor's picture of an informal business is structurally incomplete. This holds hardest against Safaricom: they see every shilling that crosses M-Pesa and none that crosses the counter. Capturing cash is unglamorous and it is the moat. It is also the thing most likely to fail, which is why it gets a mechanism above and a row in the risk table.
3. **The credit position.** A business with 12 months of verified, categorised cashflow in Sarafu is underwritable. That is the entry point into the USD 19.3 billion gap, and it is only reachable by whoever holds the ledger.

## 7. Business model

The first version of this section priced KES 300 to 500 per month at everyone in the target segment. That was wrong, and the arithmetic says so: on a business turning over KES 50,000 a year, KES 400 a month is **9.6% of annual revenue**. Nobody sane pays that for bookkeeping.

It was wrong for a second reason. Turnover tax only applies above KES 1,000,000 of annual turnover. For most of the 5.85 million, there is **no tax obligation at all**, so "tax pack" is not an upgrade trigger, it is an irrelevance.

So the segment splits, and the paid ICP is narrower than the target market on purpose.

| Segment | Turnover | Price | Why they stay |
| --- | --- | --- | --- |
| **Below the TOT floor** | Under KES 1M | **Free, permanently** | No tax obligation exists. The pull is a **credit-readiness score**: "you have 4 months of verified records, 6 months makes you loan-eligible." Visibility plus a reason to keep the streak alive. |
| **The TOT band, the paid ICP** | KES 1M to 25M | **KES 500 / month** | Turnover tax is a legal obligation with a monthly deadline. At KES 1M turnover, KES 6,000 a year is 0.6% of revenue, and at KES 25M it is 0.02%. It buys the tax pack, eTIMS-ready export and multi-month history. |
| **Approaching VAT** | Near KES 5M | Upsell | The KES 5M line triggers VAT and eTIMS obligations. Warning her before she crosses it is worth real money. |
| **Later, all segments** | Any | Rev share with lenders | Verified cashflow records as a lending rail. |

Two things this admits. The paid band is **a much smaller slice** than 5.85 million. And that is the design: the free tier is the funnel and the dataset, not the revenue. A business that grows from KES 400,000 to KES 1.2M inside Sarafu converts itself, and it does so holding a ledger nobody else has.

The ledger is the asset. The subscription is how it stays alive until the lending rail is real.

## 8. Hackathon scope

Shipping end to end, tonight:

- [x] Problem statement grounded in cited data
- [ ] Paste M-Pesa statement, parsed by Claude into a structured ledger
- [ ] Dashboard: revenue, expenses, margin, top customers, trend
- [ ] Manual cash entry folded into the same totals
- [ ] Tax page: turnover tax at 1.5%, thresholds, filing countdown
- [ ] Deployed to a public URL

Deliberately cut, and named so the cut is visible: authentication, multi-user, PDF upload, stock, live eTIMS filing, M-Pesa Daraja integration. One path, working, beats four paths, broken.

## 9. Risks, stated plainly

| Risk | Reality |
|---|---|
| Statement format drift | Model-based parsing tolerates format changes better than a regex parser, but it is not free. Needs an eval set of real statements. |
| Classification errors | A misfiled transaction becomes a wrong tax figure. Mitigation is a visible, one-tap correction path and never showing a tax number as authoritative without owner review. |
| Cash entry is manual | The single biggest vulnerability in the business. Mitigation is the one-number-per-day design above, then learned pre-fill so confirming replaces recalling. Unproven until real users touch it, and it is the first thing to test. |
| Getting the statement out | The full statement is an emailed, password-protected PDF. Email forwarding with an SMS unlock code is the intended path, but it is real onboarding friction and the most likely place a first-time user drops. |
| Willingness to pay | Solved by narrowing the paid ICP to the KES 1M to 25M turnover band, where KES 500 a month is under 0.6% of revenue. Below the floor the product is free and always will be. |
| **Safaricom builds it** | The serious one. They own the data, the rail and the distribution, and Pochi la Biashara is already in 900,000+ hands. The defence is cash, which they cannot see, and incentives, which point them at transaction volume instead. It is a defence, not a guarantee. |
| Incumbents move down-market | Zoho or ZYNO could target the informal segment. They would have to give up the paybill assumption, which is most of their architecture. |

## 10. Sources

- [Draft MSME Policy 2025, State Department for MSME Development](https://msme.go.ke/sites/default/files/2025-03/Draft%20MSME%20Policy%202025.pdf)
- [KNBS Economic Survey 2025](https://www.knbs.or.ke/wp-content/uploads/2025/05/2025-Economic-Survey-Popular-Version.pdf)
- [KRA, Turnover Tax](https://www.kra.go.ke/individual/filing-paying/types-of-taxes/turnover-tax-tot)
- [IFC MSME Finance Gap, March 2025](https://www.smefinanceforum.org/sites/default/files/Data%20Sites%20downloads/IFC%20Report_MAIN%20Final%203%2025.pdf)
- [Why so many MSMEs fail to get bank loans in Kenya](https://thekenyatimes.com/opinions/why-msmes-fail-in-kenya/)
- [Strathmore Business School, Kenya's MSMEs power 85% of new jobs](https://sbs.strathmore.edu/en_gb/kenyas-msmes-power-85-of-new-jobs-yet-policy-gaps-keep-millions-of-business-from-growing/)
- [KRA eTIMS exemption under review](https://techweez.com/2025/04/24/kra-etims-exemption/)
