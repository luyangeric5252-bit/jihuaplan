Component({
  properties: {
    selected: { type: String, value: 'today' },
    night: { type: Boolean, value: false }
  },
  methods: {
    onTap(e) {
      const go = e.currentTarget.dataset.go;
      const map = {
        today: '/pages/today/today',
        plan: '/pages/plan/plan',
        record: '/pages/record/record',
        jar: '/pages/jar/jar',
        skins: '/pages/skins/skins'
      };
      const url = map[go];
      if (!url) return;
      wx.switchTab({ url });
    }
  }
});
