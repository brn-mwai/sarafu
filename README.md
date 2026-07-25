# Sarafu

**Financial visibility for the 5.85 million Kenyan businesses that have no books.**

Paste an M-Pesa statement. Claude parses it into a real ledger, separates business money from personal, folds in the cash you entered by hand, and turns the whole thing into a dashboard and a turnover tax figure.

Built for AI Mashinani 2026, Biashara track.

---

## The problem

A Kenyan shopkeeper knows money came in today. She cannot tell you whether she made a profit this month.

Her business runs on three ledgers that never meet:

1. **M-Pesa**, on a personal line, where business receipts sit interleaved with school fees, fare and family transfers.
2. **Cash**, which leaves no record at all.
3. **Memory**, which is where margin, top customers and tax exposure actually live.

Every accounting tool in Kenya assumes she already has what she does not have: a till number, a paybill, an accountant, or a formal registration.

| Fact | Figure |
| --- | --- |
| MSMEs in Kenya | 7.41 million |
| Of which unlicensed, entirely informal | **5.85 million** |
| Share of all Kenyan businesses | 98% |
| Fail within three years | 60 to 70% |
| Collapsing annually, poor records a leading cause | 400,000+ |
| MSME financing gap | **USD 19.3 billion** |
| MSMEs with no access to credit | 67.9% |
| SME transactions touching M-Pesa | over 90% |

Sources in [PROPOSAL.md](./PROPOSAL.md).

## Why existing tools do not close it

ZYNO Books, Qwan, Zoho Books Kenya edition and Auni all handle M-Pesa. Every one is built for the business that is **already formal**: paybill or till, active KRA PIN, often a bookkeeper.

That is roughly 1.56 million businesses. The other 5.85 million are not underserved by those products, they are out of scope for them.

Sarafu needs zero integration, zero registration and zero training. And it captures **cash**, which competitors ignore because cash has no API, which makes their picture of an informal business structurally incomplete.

## How it works

```
M-Pesa statement text  (pasted, no integration)
        |
        v
  Claude Sonnet 5   forced tool call, strict JSON schema
        |   normalise + classify + split business from personal
        v
   Transaction ledger  <----  manual cash entry
        |
        +-->  Dashboard   revenue, expenses, margin, top customers
        |
        +-->  Tax         TOT at 1.5%, thresholds, eTIMS-ready lines
```

Claude is the parser. There is no regex fallback and no hand-written statement grammar. The product does not function without the model.

## Tax logic

Turnover tax figures follow [KRA guidance](https://www.kra.go.ke/individual/filing-paying/types-of-taxes/turnover-tax-tot):

- **Rate:** 1.5% of gross sales
- **Band:** annual gross turnover above KES 1,000,000 and not exceeding KES 25,000,000
- **Due:** on or before the 20th of the month following the tax period
- **VAT and eTIMS watch line:** KES 5,000,000

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router |
| UI | [Astryx](https://github.com/facebook/astryx), Meta's design system |
| Parsing | Claude Sonnet 5, Anthropic API |
| Hosting | Vercel |

## Running locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000, paste a statement on the import screen, or load the bundled sample.

## Scope

Shipping:

- [x] Problem statement grounded in cited data
- [ ] Paste M-Pesa statement, parsed by Claude into a structured ledger
- [ ] Dashboard: revenue, expenses, margin, top customers, trend
- [ ] Manual cash entry folded into the same totals
- [ ] Tax page: turnover tax at 1.5%, thresholds, filing countdown
- [ ] Deployed to a public URL

Deliberately cut: authentication, multi-user, PDF upload, stock, live eTIMS filing, M-Pesa Daraja integration. One path working beats four paths broken.

## Docs

- [PROPOSAL.md](./PROPOSAL.md) for problem, market, differentiation, business model and risks
- [docs/Sarafu-Proposal.pdf](./docs/Sarafu-Proposal.pdf) for the same, formatted for judges

## Team

[@brn-mwai](https://github.com/brn-mwai), [@Mathew-Rym](https://github.com/Mathew-Rym), [@Yusuf-cm](https://github.com/Yusuf-cm), [@josephwakaro](https://github.com/josephwakaro)
