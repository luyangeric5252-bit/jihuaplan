const app = getApp();
const ledger = app.globalData.ledger;

Component({
  properties: {
    show: { type: Boolean, value: false },
    night: { type: Boolean, value: false }
  },
  data: { amount: '' },
  observers: {
    'show': function (v) { if (v) this.setData({ amount: '' }); }
  },
  methods: {
    onAmt(e) { this.setData({ amount: e.detail.value }); },
    onClose() { this.triggerEvent('close'); },
    save() {
      const amt = parseFloat(this.data.amount);
      if (!amt || amt <= 0) {
        wx.showToast({ title: '请输入金额', icon: 'none' });
        return;
      }
      const d = ledger.load();
      ledger.doSave(d, amt);
      wx.showToast({ title: '已存入', icon: 'success' });
      this.triggerEvent('close');
      this.triggerEvent('saved');
    }
  }
});
