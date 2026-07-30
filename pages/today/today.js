const app = getApp();
const ledger = app.globalData.ledger;

// 分类图标（与记账页保持一致）
const CATS = [
  { k: '餐饮', e: '🍜' }, { k: '交通', e: '🚌' }, { k: '购物', e: '🛍️' },
  { k: '居家', e: '🏠' }, { k: '娱乐', e: '🎮' }, { k: '医疗', e: '💊' },
  { k: '学习', e: '📚' }, { k: '人情', e: '🎁' }, { k: '其他', e: '📦' }
];
function catEmoji(k) { const c = CATS.find(x => x.k === k); return c ? c.e : '📦'; }

function todayKey() {
  const d = new Date();
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

Page({
  data: {
    dateStr: '', weekday: '',
    ds: '0', dayBudgetStr: '0', dayDiff: 0, dayStr: '0',
    weekDiff: 0, weekStr: '0',
    monthDiff: 0, monthStr: '0',
    chips: [],
    bg: '#eef1fb', nightClass: '',
    expShow: false
  },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const ds = ledger.daySpent(d);
    const dayBudget = ledger.dayBudget(d);
    const dayDiff = ledger.dayDiff(d);
    const week = ledger.weekDiff(d);
    const month = ledger.monthDiff(d);

    const items = d.expenses.filter(e => e.date === todayKey()).slice().reverse();
    const chips = items.map(e => ({
      cat: e.cat, emoji: catEmoji(e.cat), amount: (e.amount || 0).toFixed(1)
    }));

    const wk = ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()];
    const night = ledger.isNight(d.skins.selected);

    this.setData({
      dateStr: todayKey(),
      weekday: wk,
      ds: ds.toFixed(1),
      dayBudgetStr: '¥' + this.fmt(dayBudget),
      dayDiff, dayStr: this.fmt(dayDiff),
      weekDiff: week, weekStr: this.fmt(week),
      monthDiff: month, monthStr: this.fmt(month),
      chips,
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: night ? 'night' : ''
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'today', night });
    }
    // 状态栏文字颜色随皮肤切换（custom 导航栏时状态栏背景透明，露出页面渐变）
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
    // 注册全局“记一笔”入口（tabBar ＋ 调用）
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.openExpense = () => this.setData({ expShow: true, bg: ledger.skinBackground(d.skins.selected) });
    }
  },

  fmt(n) { return Math.round(n); },

  closeExp() { this.setData({ expShow: false }); },
  onExpSaved() {
    this.setData({ expShow: false });
    this.onShow();
  }
});
