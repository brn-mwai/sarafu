# Sarafu

**Financial visibility for the 5.8 million Kenyan businesses that have no books.**

AI Mashinani 2026, Biashara track.

---

## 1. The problem

A Kenyan shopkeeper knows money came in today. She cannot tell you whether she made a profit this month.

That is not a knowledge gap. It is a data gap. Her business runs on three ledgers that never meet:

1. **M-Pesa**, on a personal line, where business receipts sit interleaved with school fees, fare and family transfers.
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

### Why the existing tools do not close it

Kenya has good accounting software. ZYNO Books, Qwan, Zoho Books Kenya edition and Auni all handle M-Pesa in some form. Every one of them is built for the business that is **already formal**: it has a paybill or till, a KRA PIN in active use, often a bookkeeper, and turnover that justifies a subscription and a setup process.

That is roughly 1.56 million businesses. The other 5.85 million are not underserved by those products. They are **out of scope** for them.

The gap is not better accounting. It is a first ledger for a business that has never had one, with zero integration, zero registration and zero training as preconditions.

## 2. Who Sarafu is for

The owner-operator doing KES 50,000 to KES 4 million a year. A duka, a salon, a hardware stall, a boda fleet of three, a food kiosk, a small distributor. She runs the business from one phone. She banks on M-Pesa. She takes cash. She has no accountant and no paybill, and if she has a KRA PIN she has probably not thought about turnover tax.

Explicitly **not** the target for v1: VAT-registered businesses with a finance team. They are already served.

## 3. What Sarafu does

Three surfaces, one loop.

**Import.** She pastes her M-Pesa statement as plain text. No PDF password, no API, no Daraja integration, no till number, no bank connection. Claude parses the raw statement into structured transactions and classifies each one: sale, stock purchase, supplier, transport, rent, wages, fees, personal. Business money is separated from personal money, which is the step no bank statement and no existing tool does for her.

**Dashboard.** Revenue, expenses, gross margin, cash position, top customers, best and worst days. Plus manual cash entry, because a purely M-Pesa view of an informal business is a lie by omission. Cash sales sit in the same ledger as M-Pesa sales and the totals are honest.

**Tax.** The ledger is already the tax return. Sarafu computes turnover tax at 1.5% of gross sales, flags the KES 1,000,000 registration floor and the KES 25,000,000 ceiling, counts down to the 20th of the month, and warns her when she is approaching the KES 5,000,000 line where VAT and eTIMS obligations begin. Output is eTIMS-ready line items, not a lecture about compliance.

The insight tying it together: **compliance is a by-product of visibility, not a separate product.** She does not want to do tax. She wants to know if she made money. Do the second properly and the first falls out of it for free.

## 4. Why now

- **eTIMS is closing in.** The KES 5 million exemption is under active pressure from KRA, and guidance is drifting toward all businesses issuing electronic receipts regardless of turnover. Millions of businesses are about to need a transaction record they currently do not keep.
- **Statement access got easy.** M-Pesa statements are self-service via the app and *334#. The data already exists in the owner's pocket. Nobody has been turning it into a ledger.
- **Parsing stopped being the hard part.** Messy, inconsistent, semi-structured statement text used to require a bespoke parser per format. A frontier model reads it directly. The engineering cost of the wedge collapsed in the last 18 months.

## 5. How it works

```
M-Pesa statement text
        |
        v
  Claude Sonnet 5  (forced tool call, strict JSON schema)
        |  normalise + classify + split business vs personal
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

1. **The classification ground truth.** Every correction an owner makes ("that MPESA transfer was stock, not personal") is a labelled example. Kenyan counterparty names, till numbers and supplier patterns are a dataset that only accumulates from real usage.
2. **The cash layer.** Competitors read M-Pesa because M-Pesa has an API. Cash has no API, so it gets ignored, so their picture of an informal business is structurally incomplete. Capturing cash is unglamorous and it is the moat.
3. **The credit position.** A business with 12 months of verified, categorised cashflow in Sarafu is underwritable. That is the entry point into the USD 19.3 billion gap, and it is only reachable by whoever holds the ledger.

## 7. Business model

- **Free:** statement import, dashboard, cash entry. Land the ledger.
- **Paid, KES 300 to 500 per month:** tax pack, eTIMS export, multi-month history, stock tracking.
- **Later:** verified cashflow records as a lending rail, revenue-shared with lenders. The ledger is the asset, the subscription is just how it stays alive until then.

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
| Cash entry is manual | If she does not enter cash, the picture is wrong. This is the core retention risk and the core product problem. |
| Willingness to pay | Informal businesses are price-sensitive. Free tier has to carry the value on its own, with tax as the upgrade trigger. |
| Incumbents move down-market | Zoho or ZYNO could target the informal segment. They would have to give up the paybill assumption to do it, which is most of their architecture. |

## 10. Sources

- [Draft MSME Policy 2025, State Department for MSME Development](https://msme.go.ke/sites/default/files/2025-03/Draft%20MSME%20Policy%202025.pdf)
- [KNBS Economic Survey 2025](https://www.knbs.or.ke/wp-content/uploads/2025/05/2025-Economic-Survey-Popular-Version.pdf)
- [KRA, Turnover Tax](https://www.kra.go.ke/individual/filing-paying/types-of-taxes/turnover-tax-tot)
- [IFC MSME Finance Gap, March 2025](https://www.smefinanceforum.org/sites/default/files/Data%20Sites%20downloads/IFC%20Report_MAIN%20Final%203%2025.pdf)
- [Why so many MSMEs fail to get bank loans in Kenya](https://thekenyatimes.com/opinions/why-msmes-fail-in-kenya/)
- [Strathmore Business School, Kenya's MSMEs power 85% of new jobs](https://sbs.strathmore.edu/en_gb/kenyas-msmes-power-85-of-new-jobs-yet-policy-gaps-keep-millions-of-business-from-growing/)
- [KRA eTIMS exemption under review](https://techweez.com/2025/04/24/kra-etims-exemption/)
