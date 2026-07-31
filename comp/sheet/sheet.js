Component({
  properties: {
    show: { type: Boolean, value: false },
    night: { type: Boolean, value: false }
  },
  methods: {
    noop() {},
    onMaskTap() {
      this.triggerEvent('close');
    }
  }
});
