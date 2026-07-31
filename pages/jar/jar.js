const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    net: 0, net0: 0, pct: 0, jarCls: '', savedActive: 0, savedCarry: 0, dayDiff: 0, goal: 0,
    reached: false,
    bg: '#eef1fb', nightClass: '',
    saveShow: false, expShow: false
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
      net: net.toFixed(1), net0: Math.round(net), pct, jarCls,
      savedActive: d.savedActive.toFixed(1), savedCarry: d.savedCarry.toFixed(1),
      dayDiff: Math.round(ledger.dayDiff(d) * 10) / 10,
      goal: Math.round(goal), reached: net >= goal,
      bg: ledger.skinBackground(d.skins.selected),
      bgColor: ledger.skinBaseColor(d.skins.selected),
      nightClass: isNight ? 'night' : ''
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'jar', night: isNight });
    }
    wx.setStatusBarStyle({ style: isNight ? 'light' : 'dark' });
    const g = getApp();
    if (g && g.globalData) {
      g.globalData.openExpense = () => this.setData({ expShow: true });
    }
  },

  closeExp() { this.setData({ expShow: false }); },
  onExpSaved() { this.setData({ expShow: false }); this.onShow(); },

  // 主动存钱：打开输入金额弹框
  openSave() { this.setData({ saveShow: true }); },
  closeSave() { this.setData({ saveShow: false }); },
  onSaveSaved() {
    this.setData({ saveShow: false });
    this.dropCoins();
    this.onShow();
  },

  doReset() {
    wx.showModal({
      title: '确认清空', content: '将清空储蓄罐（主动存钱 + 历史固化结余）', success: (r) => {
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

  openDetail() { wx.navigateTo({ url: '/pages/jar-detail/jar-detail' }); },
  openStats() { wx.navigateTo({ url: '/pages/stats/stats' }); }
});
