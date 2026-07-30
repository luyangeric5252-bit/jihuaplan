const app = getApp();
const ledger = app.globalData.ledger;

const CATS = ['餐饮','交通','购物','居家','娱乐','医疗','学习','人情','其他'];
const CAT_EMOJI = {
  '餐饮':'🍜','交通':'🚌','购物':'🛍️','居家':'🏠','娱乐':'🎮',
  '医疗':'💊','学习':'📚','人情':'🎁','其他':'📦'
};

Component({
  properties: {
    show: { type: Boolean, value: false },
    night: { type: Boolean, value: false },
    presetDate: { type: String, value: '' } // 补记时传入的日期
  },
  data: {
    cats: CATS,
    catEmoji: CAT_EMOJI,
    amount: '', cat: '餐饮', date: '', note: '',
    showDate: false, tag: '今天'
  },
  observers: {
    'show': function (v) {
      if (v) this.resetForm();
    }
  },
  methods: {
    resetForm() {
      const d = ledger.load();
      const isNight = ledger.isNight(d.skins.selected);
      const date = this.data.presetDate || ledger.todayKey();
      let tag = '今天';
      if (this.data.presetDate && this.data.presetDate !== ledger.todayKey()) {
        const st = this.dayStatus(d, this.data.presetDate);
        tag = this.data.presetDate + ' ' + (st === 'none' ? '补记' : '补记(已记' + ledger.spentOn(d, this.data.presetDate).toFixed(0) + ')');
      }
      this.setData({
        amount: '', cat: '餐饮', date, note: '', showDate: false, tag,
        night: isNight
      });
    },
    dayStatus(d, ds) {
      const tk = ledger.todayKey();
      if (ds > tk) return 'future';
      const spent = ledger.spentOn(d, ds);
      const budget = ledger.dayBudget(d, ds);
      if (spent > budget) return 'bad';
      if (spent > 0) return 'ok';
      return 'none';
    },
    onAmt(e) { this.setData({ amount: e.detail.value }); },
    onNote(e) { this.setData({ note: e.detail.value }); },
    pickCat(e) { this.setData({ cat: e.currentTarget.dataset.c }); },
    toggleDate() { this.setData({ showDate: !this.data.showDate }); },
    onDate(e) { this.setData({ date: e.detail.value, showDate: false }); },
    onDrag() {},
    onClose() { this.triggerEvent('close'); },
    commit() {
      const amt = parseFloat(this.data.amount);
      if (!amt || amt <= 0) {
        wx.showToast({ title: '请输入金额', icon: 'none' });
        return;
      }
      const d = ledger.load();
      ledger.addExpense(d, amt, this.data.cat, this.data.note, this.data.date);
      wx.showToast({ title: '已记录', icon: 'success' });
      this.triggerEvent('close');
      this.triggerEvent('saved');
    }
  }
});
