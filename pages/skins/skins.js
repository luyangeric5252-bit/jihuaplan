const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    selected: 'aurora',
    bg: ['#eef1fb', '#e6e9f7'], nightClass: '',
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
  },

  pick(e) {
    const id = e.currentTarget.dataset.id;
    const d = ledger.load();
    ledger.pickSkin(d, id);
    // 切换导航栏颜色（对应原型 applySkin）
    const isNight = ledger.isNight(id);
    wx.setNavigationBarColor({
      frontColor: isNight ? '#ffffff' : '#000000',
      backgroundColor: ledger.skinBackground(id)[0]
    });
    this.setData({
      selected: id,
      bg: ledger.skinBackground(id)
    });
    wx.showToast({ title: '已切换', icon: 'none' });
  }
});
