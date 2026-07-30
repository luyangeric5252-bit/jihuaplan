const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    dayDiff: 0, weekDiff: 0, monthDiff: 0,
    dayStr: '0', weekStr: '0', monthStr: '0',
    bg: ['#eef1fb', '#e6e9f7'], nightClass: ''
  },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const day = Math.round(ledger.dayDiff(d) * 10) / 10;
    const week = Math.round(ledger.weekDiff(d) * 10) / 10;
    const month = Math.round(ledger.monthDiff(d) * 10) / 10;
    this.setData({
      dayDiff: day, weekDiff: week, monthDiff: month,
      dayStr: this.fmt(day), weekStr: this.fmt(week), monthStr: this.fmt(month),
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : ''
    });
  },

  fmt(n) { return Math.round(n); }
});
