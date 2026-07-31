const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    selected: 'aurora',
    bg: '#eef1fb', bgColor: '#eef1fb', nightClass: '',
    expShow: false,
    skins: [
      { id: 'aurora', name: '极光蓝', g: ['#eef1fb', '#e6e9f7'], bg: ledger.skinBackground('aurora') },
      { id: 'night',  name: '暗夜紫', g: ['#1c1c2e', '#2a2a44'], bg: ledger.skinBackground('night') },
      { id: 'sunset', name: '日落橙', g: ['#fff3e6', '#ffe9d6'], bg: ledger.skinBackground('sunset') },
      { id: 'mint',   name: '薄荷绿', g: ['#eafff4', '#dcfcec'], bg: ledger.skinBackground('mint') },
      { id: 'sakura', name: '樱花粉', g: ['#fff0f6', '#ffe6f0'], bg: ledger.skinBackground('sakura') },
      { id: 'gold',   name: '流金',   g: ['#fff8e6', '#fff0c8'], bg: ledger.skinBackground('gold') }
    ]
  },

  refresh() {
    const d = ledger.load();
    const night = ledger.isNight(d.skins.selected);
    this.setData({
      selected: d.skins.selected,
      bg: ledger.skinBackground(d.skins.selected),
      bgColor: ledger.skinBaseColor(d.skins.selected),
      nightClass: night ? 'night' : ''
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'skins', night });
    }
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.openExpense = () => this.setData({ expShow: true });
    }
  },

  onShow() {
    this.refresh();
  },

  pick(e) {
    const id = e.currentTarget.dataset.id;
    const d = ledger.load();
    ledger.pickSkin(d, id);
    // 即时全局刷新：本页背景、tabBar、状态栏同步变化
    this.refresh();
    wx.showToast({ title: '已切换：' + (this.data.skins.find(s => s.id === id) || {}).name, icon: 'none' });
  },

  closeExp() { this.setData({ expShow: false }); },
  onExpSaved() {
    this.setData({ expShow: false });
    this.refresh();
  }
});
