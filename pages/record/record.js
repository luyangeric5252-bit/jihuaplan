const app = getApp();
const ledger = app.globalData.ledger;

Page({
  data: {
    amount: '', cat: '餐饮', date: '', note: '',
    cats: ['餐饮', '交通', '购物', '居家', '其他'],
    showDate: false, bg: '#eef1fb', nightClass: ''
  },

  onLoad() {
    const d = ledger.load();
    this.setData({
      date: ledger.todayKey(),
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : ''
    });
  },

  onShow() {
    const d = ledger.load();
    const night = ledger.isNight(d.skins.selected);
    this.setData({
      bg: ledger.skinBackground(d.skins.selected),
      nightClass: night ? 'night' : ''
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 'record', night });
    }
    wx.setStatusBarStyle({ style: night ? 'light' : 'dark' });
  },

  onAmt(e) { this.setData({ amount: e.detail.value }); },
  pickCat(e) { this.setData({ cat: e.currentTarget.dataset.c }); },
  onNote(e) { this.setData({ note: e.detail.value }); },
  toggleDate() { this.setData({ showDate: !this.data.showDate }); },
  onDate(e) { this.setData({ date: e.detail.value }); },

  commit() {
    const amt = parseFloat(this.data.amount);
    if (!amt || amt <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }
    const d = ledger.load();
    ledger.addExpense(d, amt, this.data.cat, this.data.note, this.data.date);
    wx.showToast({ title: '已记录', icon: 'success' });
    setTimeout(() => this.goBack(), 600);
  },

  goBack() {
    // 返回到储蓄罐 tab（记账后最关心储蓄罐变化）
    wx.switchTab({ url: '/pages/jar/jar' });
  }
});
