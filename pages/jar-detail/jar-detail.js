const app = getApp();
const ledger = app.globalData.ledger;

function fmt(n) { return Math.round(n * 10) / 10; }

Page({
  data: {
    bg: '#eef1fb', bgColor: '#eef1fb', nightClass: '',
    activeLogs: [], carryRows: []
  },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const isNight = ledger.isNight(d.skins.selected);

    // 主动存钱记录（倒序）
    const activeLogs = (d.savedActiveLog || []).slice().sort((a, b) => b.ts - a.ts)
      .map(r => ({ date: r.date, amount: fmt(r.amount) }));

    // 历史固化结余：从最早记录日到昨天逐天
    const tk = ledger.todayKey();
    let earliest = tk;
    d.expenses.forEach(e => { if (e.date < tk && e.date < earliest) earliest = e.date; });
    const carryRows = [];
    if (earliest !== tk) {
      let cur = earliest;
      while (cur < tk) {
        const diff = fmt(ledger.dayBudget(d, cur) - ledger.spentOn(d, cur));
        const rec = d.expenses.filter(e => e.date === cur);
        const label = rec.length ? ('花费 ¥' + rec.reduce((s, e) => s + e.amount, 0).toFixed(0)) : '未记账 · 全存';
        carryRows.push({ date: cur, diff, label });
        // 下一天
        const dt = new Date(cur + 'T00:00:00');
        dt.setDate(dt.getDate() + 1);
        const p = n => (n < 10 ? '0' + n : '' + n);
        cur = dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate());
      }
    }

    this.setData({
      bg: ledger.skinBackground(d.skins.selected),
      bgColor: ledger.skinBaseColor(d.skins.selected),
      nightClass: isNight ? 'night' : '',
      activeLogs, carryRows
    });
    wx.setStatusBarStyle({ style: isNight ? 'light' : 'dark' });
  },

  goBack() { wx.navigateBack(); }
});
