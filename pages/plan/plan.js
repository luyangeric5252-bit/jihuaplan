const app = getApp();
const ledger = app.globalData.ledger;
const { isRestDay } = require('../utils/holidays.js');

function fmt(n) { return Math.round(n); }

// 单日状态（对齐 HTML dayStatus）：已花>预算 超支，已花>0 达标，否则未记
function dayStatus(d, ds, tk) {
  if (ds > tk) return 'future';
  const spent = ledger.spentOn(d, ds);
  const budget = ledger.dayBudget(d, ds);
  if (spent > budget) return 'bad';
  if (spent > 0) return 'ok';
  return 'none';
}

Page({
  data: {
    bg: '#eef1fb', nightClass: '',
    todayType: '工作日',
    dayBudget: '0', weekBudget: '0', monthBudget: '0',
    ws: '0', ms: '0', weekDiff: '0', monthDiff: '0',
    cells: []
  },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const tk = ledger.todayKey();
    const isWork = !isRestDay(tk);
    const weekB = ledger.weekBudget(d);
    const monthB = ledger.monthBudget(d);
    const ws = ledger.weekSpent(d);
    const ms = ledger.monthSpent(d);
    const weekDiff = ledger.weekDiff(d);
    const monthDiff = ledger.monthDiff(d);

    this.setData({
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : '',
      todayType: isWork ? '工作日' : '非工作日',
      dayBudget: String(ledger.dayBudget(d)),
      workdayHint: String(Math.round(d.plans.workday)),
      restdayHint: String(Math.round(d.plans.restday)),
      weekBudget: String(Math.round(weekB)),
      monthBudget: String(Math.round(monthB)),
      ws: ws.toFixed(1),
      ms: ms.toFixed(1),
      weekDiff: weekDiff,
      monthDiff: monthDiff
    });
    this.buildCalendar(d, tk);
    const night = ledger.isNight(d.skins.selected);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'plan', night });
    }
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
  },

  buildCalendar(d, tk) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const today = now.getDate();
    const first = new Date(y, m, 1);
    const startW = first.getDay(); // 0=周日
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startW; i++) cells.push({ day: 0, cls: 'empty', mk: '' });
    for (let day = 1; day <= days; day++) {
      const ds = y + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (day < 10 ? '0' + day : day);
      const st = dayStatus(d, ds, tk);
      let cls = 'cell';
      if (st === 'ok') cls += ' ok';
      else if (st === 'bad') cls += ' bad';
      else if (st === 'none') cls += ' none';
      if (day > today) cls += ' future';
      if (day === today) cls += ' today';
      const mk = st === 'ok' ? '✓' : st === 'bad' ? '✕' : '';
      cells.push({ day, cls, mk });
    }
    this.setData({ cells });
  },

  openPlan() {
    wx.showToast({ title: '制定计划功能开发中', icon: 'none' });
  }
});
