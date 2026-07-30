// 扁平化面形图标路径（与 HTML 原型一致）
const ICON_PATHS = {
  today: 'M12 3.2 3 10.5V21h6v-6h6v6h6V10.5z',
  plan:  'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v2h14V8zm0 4v2h6v-2zm0 4v2h6v-2z',
  jar:   'M3 7h18a1 1 0 0 1 1 1v3a4 4 0 0 1-3.3 3.94A3 3 0 0 1 15 18.6V20a1 1 0 0 1-2 .5L11.5 20 11 20.5a1 1 0 0 1-2-.5v-1.4a3 3 0 0 1-3.7-3.66A4 4 0 0 1 2 11V8a1 1 0 0 1 1-1zm1.2 3.2a4 4 0 0 0 7.8 1.4 4 4 0 0 0 7.8-1.4z',
  skins: 'M12 3a9 9 0 0 0 0 18c1 0 1.6-.8 1.6-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-3.6-7.4-8-7.4zM9.5 9.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zm5 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z'
};

function iconSrc(key, color) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="' + color + '" d="' + ICON_PATHS[key] + '"/></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const TABS = [
  { key: 'today', label: '今天' },
  { key: 'plan',  label: '计划' },
  { key: 'jar',   label: '储蓄罐' },
  { key: 'skins', label: '皮肤' }
];

Component({
  properties: {
    selected: { type: String, value: 'today' },
    night: { type: Boolean, value: false }
  },
  lifetimes: {
    attached() { this.render(); }
  },
  observers: {
    'selected, night': function () { this.render(); }
  },
  methods: {
    render() {
      const night = this.data.night;
      const selColor = night ? '#aab4ff' : '#5b6cff';
      const norColor = night ? '#a9acc8' : '#7a7a92';
      const tabs = TABS.map(t => ({
        key: t.key,
        label: t.label,
        on: this.data.selected === t.key,
        icon: iconSrc(t.key, this.data.selected === t.key ? selColor : norColor)
      }));
      // ＋ 记账按钮插入中间位置（第 3 位），对齐 HTML 原型
      tabs.splice(2, 0, { add: true });
      this.setData({ tabs });
    },
    onTap(e) {
      const go = e.currentTarget.dataset.go;
      if (go === 'record') {
        // 中间 ＋：打开全局记一笔弹框（由各页注册的 openExpense 处理）
        const app = getApp();
        if (app && app.globalData && typeof app.globalData.openExpense === 'function') {
          app.globalData.openExpense();
        } else {
          wx.switchTab({ url: '/pages/record/record' });
        }
        return;
      }
      const map = {
        today: '/pages/today/today',
        plan: '/pages/plan/plan',
        jar: '/pages/jar/jar',
        skins: '/pages/skins/skins'
      };
      const url = map[go];
      if (!url) return;
      wx.switchTab({ url });
    }
  }
});
