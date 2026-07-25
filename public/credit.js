var SARAFU_CREDIT = (function () {
  /* Trailing months of book history. The current month is appended live from the ledger. */
  var HISTORY = [
    { m: '2025-11', label: 'Nov', sales: 248000, costs: 171000, complete: 0.68 },
    { m: '2025-12', label: 'Dec', sales: 301000, costs: 205000, complete: 0.74 },
    { m: '2026-01', label: 'Jan', sales: 232000, costs: 163000, complete: 0.79 },
    { m: '2026-02', label: 'Feb', sales: 258000, costs: 176000, complete: 0.85 },
    { m: '2026-03', label: 'Mar', sales: 274000, costs: 184000, complete: 0.88 },
    { m: '2026-04', label: 'Apr', sales: 292000, costs: 195000, complete: 0.91 },
    { m: '2026-05', label: 'May', sales: 281000, costs: 189000, complete: 0.93 }
  ];

  /*
   * Lender products. Criteria are drawn from published lender terms.
   * Where a lender does not publish a figure, the field is null and the
   * requirement is shown to the user as "lender discretion" rather than invented.
   */
  var PRODUCTS = [
    {
      id: 'fuliza', lender: 'Safaricom and NCBA', name: 'Fuliza', kind: 'Overdraft',
      min: 100, max: 70000, cost: 'Daily access fee', term: 'Recovered from next deposit',
      needs: { months: 1, turnover: 0, completeness: 0, score: 20, mpesaHistory: true },
      note: 'Completes a payment you cannot cover, then recovers it from your next M-Pesa deposit.'
    },
    {
      id: 'hustler', lender: 'Government of Kenya', name: 'Hustler Fund', kind: 'Micro loan',
      min: 500, max: 50000, cost: '8% a year', term: '14 days',
      needs: { months: 1, turnover: 0, completeness: 0, score: 15, mpesaHistory: true },
      note: 'Dial *254#. Limit grows with repayment history.'
    },
    {
      id: 'mshwari', lender: 'NCBA', name: 'M-Shwari', kind: 'Mobile loan',
      min: 1000, max: 1000000, cost: '7.5% one-off facility fee', term: '30 days',
      needs: { months: 3, turnover: 0, completeness: 0.5, score: 40, mpesaHistory: true },
      note: 'Needs an active M-Shwari account with saving history. Most limits start far below the ceiling.'
    },
    {
      id: 'kcb-mpesa', lender: 'KCB', name: 'KCB M-Pesa', kind: 'Mobile loan',
      min: 1000, max: 1000000, cost: '9.06% flat facility fee', term: '30 days',
      needs: { months: 4, turnover: 0, completeness: 0.6, score: 50, mpesaHistory: true },
      note: 'Your limit grows with M-Pesa transaction volume and on-time repayment. Sarafu evidences both.'
    },
    {
      id: 'timiza', lender: 'Absa', name: 'Timiza', kind: 'Mobile loan',
      min: 1000, max: 150000, cost: 'Access fee plus 20% excise on the fee', term: '30 days',
      needs: { months: 3, turnover: 0, completeness: 0.5, score: 45, mpesaHistory: true },
      note: 'Dial *848#.'
    },
    {
      id: 'kcb-boresha', lender: 'KCB', name: 'Boresha Biashara', kind: 'Business loan',
      min: 50000, max: 1000000, cost: 'Lender discretion', term: 'Up to 36 months',
      needs: { months: 6, turnover: 0, completeness: 0.75, score: 60, bankStatements: 6, kraPin: true, proofOfBusiness: true, guarantor: true },
      note: 'Needs 6 months of statements, a KRA PIN, proof of business, and a guarantor where unsecured.'
    },
    {
      id: 'coop-biashara', lender: 'Co-operative Bank', name: 'Biashara Loan', kind: 'Business loan',
      min: 50000, max: 1000000, cost: 'Lender discretion', term: 'Lender discretion',
      needs: { months: 6, turnover: 300000, completeness: 0.75, score: 60, bankStatements: 6, kraPin: true, proofOfBusiness: true },
      note: 'Terms vary by branch and security offered.'
    },
    {
      id: 'kcb-msme', lender: 'KCB', name: 'MSME Loan', kind: 'Business loan',
      min: 100000, max: 5000000, cost: 'Lender discretion', term: 'Lender discretion',
      needs: { months: 24, turnover: 500000, maxTurnover: 100000000, completeness: 0.8, score: 70, kraPin: true, businessPermit: true },
      note: 'Requires two years of viable operation and a county business permit. Turnover band KES 500,000 to 100 million.'
    }
  ];

  var REQ_LABEL = {
    months: 'months of records',
    turnover: 'annual turnover',
    completeness: 'record completeness',
    score: 'Sarafu score',
    kraPin: 'KRA PIN',
    businessPermit: 'county business permit',
    proofOfBusiness: 'proof of business',
    guarantor: 'guarantor',
    bankStatements: 'bank statements',
    mpesaHistory: 'M-Pesa history'
  };

  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }

  function stability(series) {
    if (series.length < 2) return 0;
    var m = mean(series);
    if (!m) return 0;
    var sd = Math.sqrt(mean(series.map(function (x) { return (x - m) * (x - m); })));
    var cv = sd / m;
    return Math.max(0, Math.min(1, 1 - cv / 0.35));
  }

  function trend(series) {
    if (series.length < 3) return 0.5;
    var half = Math.floor(series.length / 2);
    var early = mean(series.slice(0, half));
    var late = mean(series.slice(-half));
    if (!early) return 0.5;
    var g = (late - early) / early;
    return Math.max(0, Math.min(1, 0.5 + g * 2.5));
  }

  /* profile: what the owner has told us or confirmed outside the ledger */
  var PROFILE = {
    kraPin: true,
    businessPermit: false,
    proofOfBusiness: true,
    guarantor: false,
    mpesaHistory: true,
    bankStatements: 0
  };

  function assess(ledger) {
    var current = {
      m: '2026-06', label: 'Jun',
      sales: ledger.sales, costs: ledger.costs,
      complete: ledger.days ? (ledger.days - ledger.missing) / ledger.days : 0
    };
    var months = HISTORY.concat([current]);
    var sales = months.map(function (x) { return x.sales; });

    var monthsOfRecords = months.length;
    var completeness = mean(months.map(function (x) { return x.complete; }));
    var stab = stability(sales);
    var grow = trend(sales);
    var avgMonthly = mean(sales);
    var annualTurnover = avgMonthly * 12;

    var topShare = ledger.customers && ledger.customers.length && ledger.sales
      ? ledger.customers[0].total / ledger.sales : 0;
    var diversity = Math.max(0, Math.min(1, 1 - topShare / 0.4));

    var parts = {
      depth: Math.min(1, monthsOfRecords / 24) * 25,
      completeness: completeness * 25,
      stability: stab * 20,
      growth: grow * 15,
      diversity: diversity * 15
    };
    var score = Math.round(parts.depth + parts.completeness + parts.stability + parts.growth + parts.diversity);

    var band = score >= 75 ? 'Bankable' : score >= 55 ? 'Building' : score >= 35 ? 'Thin file' : 'No file';

    return {
      months: months, monthsOfRecords: monthsOfRecords, completeness: completeness,
      stability: stab, growth: grow, diversity: diversity, topShare: topShare,
      avgMonthly: avgMonthly, annualTurnover: annualTurnover,
      score: score, band: band, parts: parts,
      profile: PROFILE
    };
  }

  function blockersFor(p, a) {
    var out = [];
    var n = p.needs;
    if (n.months && a.monthsOfRecords < n.months) {
      out.push({ key: 'months', short: (n.months - a.monthsOfRecords) + ' more months of records', fixable: true, gap: n.months - a.monthsOfRecords });
    }
    if (n.turnover && a.annualTurnover < n.turnover) {
      out.push({ key: 'turnover', short: 'annual turnover below KES ' + n.turnover.toLocaleString('en-KE'), fixable: false });
    }
    if (n.maxTurnover && a.annualTurnover > n.maxTurnover) {
      out.push({ key: 'turnover', short: 'turnover above this product band', fixable: false });
    }
    if (n.completeness && a.completeness < n.completeness) {
      out.push({ key: 'completeness', short: 'records ' + Math.round(a.completeness * 100) + '% complete, needs ' + Math.round(n.completeness * 100) + '%', fixable: true });
    }
    if (n.score && a.score < n.score) {
      out.push({ key: 'score', short: 'score ' + a.score + ', needs ' + n.score, fixable: true });
    }
    ['kraPin', 'businessPermit', 'proofOfBusiness', 'guarantor'].forEach(function (k) {
      if (n[k] && !a.profile[k]) out.push({ key: k, short: 'no ' + REQ_LABEL[k], fixable: true });
    });
    if (n.bankStatements && a.profile.bankStatements < n.bankStatements) {
      out.push({ key: 'bankStatements', short: n.bankStatements + ' months of bank statements needed', fixable: true });
    }
    return out;
  }

  function indicativeAmount(p, a) {
    var monthly = a.avgMonthly;
    var ceiling = p.kind === 'Overdraft' ? monthly * 0.25
      : p.kind === 'Micro loan' ? monthly * 0.2
        : p.kind === 'Mobile loan' ? monthly * 0.9
          : monthly * 3;
    var scaled = ceiling * (a.score / 100);
    return Math.max(p.min, Math.min(p.max, Math.round(scaled / 1000) * 1000));
  }

  function match(ledger) {
    var a = assess(ledger);
    var rows = PRODUCTS.map(function (p) {
      var b = blockersFor(p, a);
      return {
        product: p,
        blockers: b,
        eligible: b.length === 0,
        close: b.length > 0 && b.length <= 2 && b.every(function (x) { return x.fixable; }),
        amount: indicativeAmount(p, a)
      };
    });

    var eligible = rows.filter(function (r) { return r.eligible; }).sort(function (x, y) { return y.amount - x.amount; });
    var close = rows.filter(function (r) { return !r.eligible && r.close; }).sort(function (x, y) { return y.amount - x.amount; });
    var locked = rows.filter(function (r) { return !r.eligible && !r.close; }).sort(function (x, y) { return y.amount - x.amount; });

    var headroom = eligible.reduce(function (s, r) { return s + r.amount; }, 0);
    var nextUnlock = close[0] || locked[0] || null;

    return { assessment: a, eligible: eligible, close: close, locked: locked, headroom: headroom, nextUnlock: nextUnlock, all: rows };
  }

  return { assess: assess, match: match, PRODUCTS: PRODUCTS, HISTORY: HISTORY, PROFILE: PROFILE, REQ_LABEL: REQ_LABEL };
})();
