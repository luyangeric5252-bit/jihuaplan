const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    selected: 'aurora',
    bg: '#eef1fb', nightClass: '',
    skins: [
      { id: 'aurora', name: '极光蓝', g: ['#eef1fb', '#e6e9f7'] },
      { id: 'sunset', name: '日落橙', g: ['#fff3e6', '#ffe9d6'] },
      { id: 'mint',   name: '薄荷绿', g: ['#eafff4', '#dcfcec'] },
      { id: 'sakura', name: '樱花粉', g: ['#fff0f6', '#ffe6f0'] },
      { id: 'night',  name: '暗夜紫', g: ['#1c1c2e', '#2a2a44'] },
      { id: 'gold',   name: '流金',   g: ['#fff8e6', '#fff0c8'] }
    ]
  },

  onShow() {
    const d = ledger.load();
    this.setData({
      selected: d.skins.selected,
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : ''
    });
    const night = ledger.isNight(d.skins.selected);
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'skins', night });
    }
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
  },

  pick(e) {
    const id = e.currentTarget.dataset.id;
    const d = ledger.load();
    ledger.pickSkin(d, id);
    // 切换状态栏文字颜色（custom 导航栏下状态栏背景透明，露出页面渐变）
    const isNight = ledger.isNight(id);
    wx.setStatusBarStyle({ style: isNight ? 'light' : 'dark' });
    this.setData({
      selected: id,
      bg: ledger.skinBackground(id),
      nightClass: isNight ? 'night' : ''
    });
    wx.showToast({ title: '已切换', icon: 'none' });
  }
});
