const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    net: 0, pct: 0, jarCls: '', savedActive: 0, savedCarry: 0, dayDiff: 0,
    showDetail: false, logs: [], coins: [], bg: '#eef1fb', sheetBg: '#eef1fb', nightClass: '',
    expShow: false
  },

  onShow() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const net = ledger.net(d);
    const goal = d.plans.goal;
    const pct = Math.max(4, Math.min(100, (net / goal) * 100));
    const isNight = ledger.isNight(d.skins.selected);
    let jarCls = '';
    if (net < 0) jarCls = 'red';
    else if (net >= goal) jarCls = 'done';
    if (isNight) jarCls += ' night';
    this.setData({
      net: net.toFixed(1), pct, jarCls,
      savedActive: d.savedActive.toFixed(1), savedCarry: d.savedCarry.toFixed(1),
      dayDiff: Math.round(ledger.dayDiff(d) * 10) / 10,
      bg: ledger.skinBackground(d.skins.selected),
      sheetBg: ledger.sheetBackground(d.skins.selected),
      nightClass: isNight ? 'night' : ''
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'jar', night: isNight });
    }
    wx.setStatusBarStyle({ style: isNight ? 'light' : 'dark' });
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.openExpense = () => this.setData({ expShow: true });
    }
  },

  closeExp() { this.setData({ expShow: false }); },
  onExpSaved() {
    this.setData({ expShow: false });
    this.onShow();
  },

  // 主动存钱 + 金币（对应原型 doSave + coinRain）
  doSave() {
    const d = ledger.load();
    ledger.doSave(d, 50);
    this.dropCoins();
    this.onShow();
  },

  doReset() {
    wx.showModal({
      title: '确认重置', content: '将清空主动存钱记录', success: (r) => {
        if (r.confirm) { const d = ledger.load(); ledger.doResetActive(d); this.onShow(); }
      }
    });
  },

  dropCoins() {
    const coins = [];
    for (let i = 0; i < 10; i++) {
      coins.push({ id: Date.now() + i, x: 8 + Math.random() * 84, label: '¥' });
    }
    this.setData({ coins });
    setTimeout(() => this.setData({ coins: [] }), 1200);
  },

  openDetail() {
    const d = ledger.load();
    const logs = d.savedActiveLog.slice().sort((a, b) => b.ts - a.ts);
    this.setData({
      showDetail: true, logs,
      sheetBg: ledger.sheetBackground(d.skins.selected)
    });
  },
  closeDetail() { this.setData({ showDetail: false }); },
  noop() {},

  openStats() { wx.navigateTo({ url: '/pages/stats/stats' }); }
});
