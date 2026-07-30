const app = getApp();
const ledger = app.globalData.ledger;

Component({
  properties: {
    show: { type: Boolean, value: false },
    night: { type: Boolean, value: false }
  },
  data: {
    workday: '80', restday: '120', goal: '3000', goalDate: '2026-12-31'
  },
  observers: {
    'show': function (v) {
      if (v) {
        const d = ledger.load();
        const isNight = ledger.isNight(d.skins.selected);
        this.setData({
          workday: String(Math.round(d.plans.workday)),
          restday: String(Math.round(d.plans.restday)),
          goal: String(Math.round(d.plans.goal)),
          goalDate: d.plans.goalDate,
          night: isNight
        });
      }
    }
  },
  methods: {
    onWork(e) { this.setData({ workday: e.detail.value }); },
    onRest(e) { this.setData({ restday: e.detail.value }); },
    onGoal(e) { this.setData({ goal: e.detail.value }); },
    onDate(e) { this.setData({ goalDate: e.detail.value }); },
    onClose() { this.triggerEvent('close'); },
    save() {
      const d = ledger.load();
      d.plans.workday = parseFloat(this.data.workday) || 0;
      d.plans.restday = parseFloat(this.data.restday) || 0;
      d.plans.goal = parseFloat(this.data.goal) || 0;
      d.plans.goalDate = this.data.goalDate;
      ledger.save(d);
      wx.showToast({ title: '计划已保存', icon: 'success' });
      this.triggerEvent('close');
      this.triggerEvent('saved');
    }
  }
});
