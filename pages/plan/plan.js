const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    workday: '80', restday: '120', goal: '3000', goalDate: '2026-12-31',
    bg: '#eef1fb', nightClass: '',
    weekHead: ['一', '二', '三', '四', '五', '六', '日'],
    cells: []
  },

  onShow() {
    const d = ledger.load();
    this.setData({
      workday: String(Math.round(d.plans.workday)),
      restday: String(Math.round(d.plans.restday)),
      goal: String(Math.round(d.plans.goal)),
      goalDate: d.plans.goalDate,
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : ''
    });
    this.buildCalendar(d);
    const night = ledger.isNight(d.skins.selected);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'plan', night });
    }
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
  },

  onWork(e) { this.savePlan('workday', e.detail.value); },
  onRest(e) { this.savePlan('restday', e.detail.value); },
  onGoal(e) { this.savePlan('goal', e.detail.value); },
  onDate(e) { this.savePlan('goalDate', e.detail.value); },

  savePlan(key, val) {
    const d = ledger.load();
    if (key === 'goalDate') d.plans.goalDate = val;
    else d.plans[key] = parseFloat(val) || 0;
    ledger.save(d);
    if (key === 'workday' || key === 'restday') this.buildCalendar(d);
  },

  buildCalendar(d) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1);
    const firstWD = (first.getDay() + 6) % 7; // 周一=0
    const days = new Date(y, m + 1, 0).getDate();
    const tk = ledger.todayKey();
    const cells = [];
    for (let i = 0; i < firstWD; i++) cells.push({ day: 0, key: '', cls: '' });
    for (let day = 1; day <= days; day++) {
      const ds = y + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (day < 10 ? '0' + day : day);
      const spent = ledger.spentOn(d, ds);
      const budget = ledger.dayBudget(d, ds);
      const over = spent > budget && ds < tk;
      const recorded = spent > 0;
      let cls = '';
      if (ds === tk) cls = 'today';
      else if (over) cls = 'bad';
      else if (recorded) cls = 'ok';
      cells.push({ day, key: ds, cls });
    }
    this.setData({ cells });
  }
});
