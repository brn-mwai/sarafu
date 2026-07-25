# The problem Sarafu solves

## The statement

> **This helps a Kenyan duka owner, who today is refused working capital because every lender wants two years of financial records, and her books have never existed. Forty-one percent of her sales are cash that no bank, telco or credit bureau can see.**

Read it clause by clause. Every one is load-bearing and every one is sourced.

| Clause | Why it holds |
| --- | --- |
| **a Kenyan duka owner** | 5.85 million unlicensed MSMEs, 98% of all businesses in Kenya. Not a niche. |
| **refused working capital** | 67.9% of Kenyan MSMEs have no access to credit. The gap is USD 19.3 billion. |
| **every lender wants two years of records** | The KCB MSME Loan requires two years of viable operation and a county permit. Boresha Biashara wants six months of bank statements, a KRA PIN and a guarantor. |
| **her books have never existed** | 60 to 70% of MSMEs fail within three years, with poor record keeping named as a leading cause. Over 400,000 collapse annually. |
| **41% of her sales are cash** | Measured on our own demo ledger: KES 100,100 of KES 246,700. Cash has no API, so it is invisible to every M-Pesa-based lender. |

## The chain, stated plainly

1. She sells. Some of it through M-Pesa, a large share in cash.
2. Nobody records it. Bookkeeping is a chore with no deadline and no reward.
3. So no lender can underwrite her. Not because she is a bad risk, but because she is an **unmeasurable** one.
4. So she borrows at the only rate available to the unmeasurable: mobile shylocks, 30-day paper, family.
5. So she cannot buy stock in bulk, cannot smooth a bad month, cannot hire.
6. So she stays small, or she dies inside three years and joins the 400,000.

**The binding constraint is not capital. It is legibility.** The money exists: 252 licensed digital lenders disbursed KSh 150.56 billion by May 2026. They are not lending to her because they cannot see her.

## Why this has not been solved

Every existing tool assumes the thing she lacks.

- **Accounting software** (Zoho Books, ZYNO, Qwan) assumes a paybill, a till, a KRA PIN in active use, and often a bookkeeper. That serves the 1.56 million already-formal businesses. The other 5.85 million are not underserved by it, they are **out of scope** for it.
- **Mobile lenders** (M-Shwari, KCB M-Pesa, Fuliza) already score behaviour, but only what crosses M-Pesa. They are structurally blind to the 41% that crosses the counter.
- **Safaricom's Pochi la Biashara** separates business money from personal for 900,000+ merchants. It gives her a balance. It does not give her a margin, a cost base, or a record a lender can read.

Nobody has built the thing that turns how she already behaves into something a lender can underwrite.

## What Sarafu does about it

She talks to it. It keeps the book. The book becomes the loan.

```
She speaks or pastes            "Nimenunua unga 4,500. Nimeuza leo 8,200."
        |
        v
Claude classifies                three transactions, business meaning attached
        |
        v
The ledger accumulates           M-Pesa parsed + cash captured daily
        |
        +--> she sees profit, margin, top customers
        +--> turnover tax falls out as a by-product
        +--> KRA assessments can be reconciled and objected to
        |
        v
The record becomes a credit file
        |
        v
Sarafu score, and the named lenders she qualifies for today
```

The cash mechanism is the whole product: **one number a day, not one entry per sale.** Transaction-level bookkeeping is what she has already refused for her entire working life. A single daily scalar is a different ask.

## Secondary users, same problem

- **Lenders** cannot price this segment and so decline it wholesale. A structured, cash-inclusive file lets them underwrite instead of guess.
- **KRA** cannot see these businesses either. The Finance Act 2026 lets it raise assessments where records are absent, which means the state now estimates rather than measures. Records fix both sides.

## What "solved" looks like

Measurable, and falsifiable:

| Test | Target |
| --- | --- |
| She answers the daily cash prompt | 60%+ of trading days complete after 30 days |
| The record reaches lender depth | 6 months of complete records |
| She converts legibility into money | first formal facility drawn, at a rate below informal alternatives |
| The score moves with behaviour | measured score improvement over 90 days |

If she will not enter one number a day, none of this works, and we will know within two weeks with 20 businesses and a phone. That is the first thing to test, and it is cheap.

## The one-line version

**Kenya's informal businesses cannot borrow because they cannot be measured. Sarafu measures them, in the way they already work, until a lender says yes.**
