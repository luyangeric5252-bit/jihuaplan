const ledger = require('./store/ledger.js');

App({
  globalData: {
    ledger
  },
  onLaunch() {
    // 初始化数据 + 跨天结算
    const d = ledger.load();
    ledger.settleIfNewDay(d);
  }
});
