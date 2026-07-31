const app = getApp();
const ledger = app.globalData.ledger;

const CAT_COLORS = {
  '餐饮': '#ff8a5b', '交通': '#5b9cff', '购物': '#ff5b9c',
  '居家': '#2fd99a', '其他': '#9b8cff'
};

Page({
  data: {
    legend: [], last7: [], total: 0, list: [], expanded: false,
    bg: '#eef1fb', bgColor: '#eef1fb', nightClass: ''
  },

  onShow() { this.refresh(); },

  refresh() {
    const d = ledger.load();
    ledger.settleIfNewDay(d);
    const exps = d.expenses;
    // 分类占比
    const counts = {};
    exps.forEach(e => { counts[e.cat] = (counts[e.cat] || 0) + e.amount; });
    const total = exps.length;
    const legend = Object.keys(counts).map(k => ({
      k, color: CAT_COLORS[k] || '#9b8cff',
      pct: total > 0 ? Math.round(counts[k] / exps.reduce((s, e) => s + e.amount, 0) * 100) : 0
    }));
    // 近7天
    const now = new Date();
    const last7 = [];
    let max = 1;
    const tmp = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(now); dt.setDate(now.getDate() - i);
      const ds = ledger.todayKey(dt);
      const amt = Math.round(exps.filter(e => e.date === ds).reduce((s, e) => s + e.amount, 0));
      const w = ['日', '一', '二', '三', '四', '五', '六'][dt.getDay()];
      tmp.push({ amt, w });
      if (amt > max) max = amt;
    }
    tmp.forEach(t => last7.push({ amt: t.amt, w: t.w, h: Math.max(8, Math.round(t.amt / max * 200)) }));
    // 总笔数列表
    const list = exps.slice().sort((a, b) => b.ts - a.ts);

    this.setData({
      legend, last7, total, list,
      bg: ledger.skinBackground(d.skins.selected),
      bgColor: ledger.skinBaseColor(d.skins.selected),
      nightClass: ledger.isNight(d.skins.selected) ? 'night' : ''
    });
  },

  toggle() { this.setData({ expanded: !this.data.expanded }); },
  goBack() { wx.navigateBack(); }
});
