Component({
  properties: {
    show: { type: Boolean, value: false },
    night: { type: Boolean, value: false }
  },
  data: {
    startY: 0,
    dragging: false,
    offset: 0 // 实时下拉位移（rpx -> 用 px 近似）
  },
  methods: {
    noop() {},
    onMaskTap() {
      this.triggerEvent('close');
    },
    onTouchStart(e) {
      this.setData({ startY: e.touches[0].clientY, dragging: true, offset: 0 });
    },
    onTouchMove(e) {
      if (!this.data.dragging) return;
      const dy = e.touches[0].clientY - this.data.startY;
      // 只允许向下拖
      this.setData({ offset: dy > 0 ? dy : 0 });
    },
    onTouchEnd(e) {
      if (!this.data.dragging) return;
      const dy = e.changedTouches[0].clientY - this.data.startY;
      this.setData({ dragging: false, offset: 0 });
      if (dy > 100) {
        this.triggerEvent('close');
      }
    }
  }
});
