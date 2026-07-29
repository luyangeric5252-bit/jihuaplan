const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: { dayDiff: 0, weekDiff: 0, monthDiff: 0, bg: ['#eef1fb', '#e6e9f7'] },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    this.setData({
      dayDiff: Math.round(ledger.dayDiff(d) * 10) / 10,
      weekDiff: Math.round(ledger.weekDiff(d) * 10) / 10,
      monthDiff: Math.round(ledger.monthDiff(d) * 10) / 10,
      bg: ledger.skinBackground(d.skins.selected)
    });
  },

  fmt(n) { return Math.round(n); }
});
