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
    cells: [],
    expShow: false, expDate: '',
    planShow: false
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
    // 注册全局“记一笔”入口（tabBar ＋ 调用）
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.openExpense = () => this.openExpense('');
    }
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
      cells.push({ day, ds, cls, mk });
    }
    this.setData({ cells });
  },

  openPlan() {
    this.setData({ planShow: true });
  },

  // 日历 cell 点击：未记/已记且历史日期 → 打开记一笔补记
  onCellTap(e) {
    const ds = e.currentTarget.dataset.ds;
    const day = e.currentTarget.dataset.day;
    if (!day || day <= 0) return; // 空白格忽略
    const d = ledger.load();
    const st = dayStatus(d, ds, ledger.todayKey());
    if (st === 'future') return; // 未来日期不可补记
    this.openExpense(ds);
  },

  openExpense(date) {
    this.setData({ expShow: true, expDate: date || '' });
  },
  closeExp() { this.setData({ expShow: false }); },
  onExpSaved() {
    this.setData({ expShow: false });
    this.onShow(); // 刷新日历与计划卡
  },

  closePlan() { this.setData({ planShow: false }); },
  onPlanSaved() {
    this.setData({ planShow: false });
    this.onShow();
  }
});
