var SARAFU = (function () {
  var CUSTOMERS = ['JOHN KAMAU', 'GRACE ATIENO', 'PETER OCHIENG', 'MARY WAIRIMU', 'SAMUEL KIPROP', 'ESTHER NJERI'];
  var SUPPLIERS = [
    { name: 'MWANGI WHOLESALERS', cat: 'stock_purchase', label: 'Stock purchase' },
    { name: 'BIDCO DISTRIBUTOR', cat: 'stock_purchase', label: 'Stock purchase' },
    { name: 'UNGA SUPPLIER', cat: 'stock_purchase', label: 'Stock purchase' }
  ];

  var CAT_LABEL = {
    sale: 'Sale',
    till_sale: 'Till payment',
    stock_purchase: 'Stock purchase',
    transport: 'Transport',
    rent: 'Rent',
    utilities: 'Utilities',
    wages: 'Wages',
    fees: 'M-Pesa charges'
  };

  /* [day, mpesa in, till/paybill in] — every figure is digital and verifiable.
     Nothing here depends on the owner recording anything by hand. */
  var SEED = [
    [4, 6400, 4900], [5, 5200, 3800], [6, 7800, 6100], [7, 4600, 3400], [8, 6100, 4700],
    [9, 7400, 5800], [10, 5300, 4200], [11, 6800, 4400], [12, 8100, 6600], [13, 5100, 3900],
    [14, 6300, 5200], [15, 7100, 5600], [16, 4800, 3600], [17, 6600, 5300], [18, 7600, 6200],
    [19, 5000, 4100], [20, 6900, 5500], [21, 8300, 6900], [22, 5600, 4400], [23, 6400, 4800],
    [24, 5900, 4300], [25, 7200, 5900], [26, 6100, 4700]
  ];

  var txns = [];
  var cashDays = {};

  SEED.forEach(function (row, i) {
    var day = row[0], mpesa = row[1], cash = row[2];
    var date = '2026-06-' + String(day).padStart(2, '0');

    var n = 2 + (i % 3);
    var each = Math.round(mpesa / n / 50) * 50;
    for (var j = 0; j < n; j++) {
      txns.push({
        date: date, who: CUSTOMERS[(i + j) % CUSTOMERS.length], cat: 'sale', label: 'Sale, M-Pesa',
        dir: 'in', amt: j === n - 1 ? mpesa - each * (n - 1) : each, rev: true, src: 'mpesa'
      });
    }

    if (cash > 0) {
      cashDays[date] = cash;
      txns.push({ date: date, who: 'TILL 8842190', cat: 'till_sale', label: 'Lipa na M-Pesa', dir: 'in', amt: cash, rev: true, src: 'till' });
    }

    if (i % 3 === 0) {
      var s = SUPPLIERS[i % 3];
      txns.push({ date: date, who: s.name, cat: s.cat, label: s.label, dir: 'out', amt: Math.round((mpesa + cash) * 1.95 / 100) * 100, rev: false, src: 'mpesa' });
    }
    if (i % 4 === 1) txns.push({ date: date, who: 'BODA DELIVERY', cat: 'transport', label: 'Transport', dir: 'out', amt: 300 + (i % 3) * 150, rev: false, src: 'mpesa' });
    if (i % 6 === 2) txns.push({ date: date, who: 'KPLC TOKENS', cat: 'utilities', label: 'Utilities', dir: 'out', amt: 1000, rev: false, src: 'mpesa' });
    if (day === 5) txns.push({ date: date, who: 'STALL RENT', cat: 'rent', label: 'Rent', dir: 'out', amt: 15000, rev: false, src: 'mpesa' });
    if (i % 7 === 3) txns.push({ date: date, who: 'HELPER', cat: 'wages', label: 'Wages', dir: 'out', amt: 600, rev: false, src: 'mpesa' });
    if (i % 5 === 4) txns.push({ date: date, who: 'M-PESA CHARGES', cat: 'fees', label: 'Transaction fees', dir: 'out', amt: 120 + (i % 4) * 30, rev: false, src: 'mpesa' });
  });

  function kes(n) { return 'KES ' + Math.round(n).toLocaleString('en-KE'); }
  function short(n) { return Math.round(n).toLocaleString('en-KE'); }

  function derive() {
    var mpesaSales = 0, cashSales = 0, costs = 0, byCat = {}, byCust = {};

    txns.forEach(function (t) {
      if (t.dir === 'in' && t.rev) {
        if (t.src === 'till') { cashSales += t.amt; }
        else {
          mpesaSales += t.amt;
          byCust[t.who] = byCust[t.who] || { total: 0, n: 0 };
          byCust[t.who].total += t.amt;
          byCust[t.who].n++;
        }
      } else if (t.dir === 'out') {
        costs += t.amt;
        byCat[t.cat] = (byCat[t.cat] || 0) + t.amt;
      }
    });

    var days = SEED.length;
    var missing = SEED.filter(function (r) { return !cashDays['2026-06-' + String(r[0]).padStart(2, '0')]; }).length;
    var sales = mpesaSales + cashSales;
    var annual = (sales / days) * 365;
    var tax = annual >= 1000000 && annual <= 25000000 ? sales * 0.015 : 0;

    return {
      sales: sales, mpesaSales: mpesaSales, cashSales: cashSales, costs: costs,
      profit: sales - costs, margin: sales ? (sales - costs) / sales : 0,
      missing: missing, days: days, annual: annual, tax: tax,
      customers: Object.keys(byCust).map(function (k) { return { name: k, total: byCust[k].total, n: byCust[k].n }; })
        .sort(function (a, b) { return b.total - a.total; }),
      costCats: Object.keys(byCat).map(function (k) { return { cat: k, total: byCat[k] }; })
        .sort(function (a, b) { return b.total - a.total; })
    };
  }

  function daySeries(count) {
    return SEED.slice(-(count || 14)).map(function (r) {
      var date = '2026-06-' + String(r[0]).padStart(2, '0');
      var total = txns.filter(function (t) { return t.date === date && t.dir === 'in' && t.rev; })
        .reduce(function (s, t) { return s + t.amt; }, 0);
      return { day: r[0], date: date, total: total, gap: !cashDays[date] };
    });
  }

  function addCash(amount) {
    var target = null;
    SEED.forEach(function (r) {
      var dt = '2026-06-' + String(r[0]).padStart(2, '0');
      if (!target && !cashDays[dt]) target = dt;
    });
    target = target || '2026-06-26';
    cashDays[target] = (cashDays[target] || 0) + amount;

    var existing = txns.filter(function (t) { return t.date === target && t.src === 'cash' && t.rev; })[0];
    if (existing) existing.amt = cashDays[target];
    else txns.push({ date: target, who: 'Cash sales', cat: 'cash_sale', label: 'Entered by you', dir: 'in', amt: amount, rev: true, src: 'cash' });

    return target;
  }

  return {
    SEED: SEED, txns: txns, cashDays: cashDays, CAT_LABEL: CAT_LABEL,
    derive: derive, daySeries: daySeries, addCash: addCash, kes: kes, short: short
  };
})();
