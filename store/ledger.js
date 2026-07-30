// 计划经济 v2.0 数据层
// 单一数据源 D（对应 HTML 原型全局对象 D）
// 本地优先：wx.setStorageSync；云端可插拔：syncLayer（服务器未接时为空操作）
const { isRestDay } = require('../utils/holidays.js');

const STORAGE_KEY = 'jjp_data_v2';
const NET_VERSION = '2.0';

// 默认数据（对应原型 seed()）
function defaultData() {
  const today = todayKey();
  return {
    version: NET_VERSION,
    plans: { workday: 80, restday: 120, goal: 3000, goalDate: '2026-12-31' },
    savedActive: 0,
    savedCarry: 0,
    expenses: [],          // [{date, amount, cat, note, ts}]
    savedActiveLog: [],    // [{amount, date, ts}]
    skins: { selected: 'aurora', owned: ['aurora', 'sunset', 'mint', 'sakura', 'night', 'gold'] },
    lastSettled: today,
    settledDates: {},
    // 云端预留
    userId: '',            // 登录后填 openid
    lastSync: 0
  };
}

// ---- 日期工具（对应原型 todayKey / addDays） ----
function todayKey(d) {
  d = d || new Date();
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

// ---- 读写 ----
function load() {
  let d = wx.getStorageSync(STORAGE_KEY);
  if (!d || d.version !== NET_VERSION) {
    d = defaultData();
    save(d);
  }
  return d;
}
function save(d) {
  wx.setStorageSync(STORAGE_KEY, d);
}

// ---- 消费统计（对应原型 daySpent/weekSpent/monthSpent/spentOn） ----
function spentOn(d, dateStr) {
  return d.expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
}
function daySpent(d) { return spentOn(d, todayKey()); }
function weekSpent(d) {
  const now = new Date();
  const wd = (now.getDay() + 6) % 7; // 周一=0
  const monday = new Date(now); monday.setDate(now.getDate() - wd);
  const ms = monday.setHours(0, 0, 0, 0);
  return d.expenses.filter(e => new Date(e.date + 'T00:00:00').getTime() >= ms)
    .reduce((s, e) => s + e.amount, 0);
}
function monthSpent(d) {
  const m = todayKey().slice(0, 7);
  return d.expenses.filter(e => e.date.indexOf(m) === 0).reduce((s, e) => s + e.amount, 0);
}

// ---- 预算（对应原型 dayBudget / Plans.monthBudget） ----
function dayBudget(d, dateStr) {
  dateStr = dateStr || todayKey();
  return isRestDay(dateStr) ? d.plans.restday : d.plans.workday;
}
function weekBudget(d) { return d.plans.workday * 5 + d.plans.restday * 2; }
function monthBudget(d) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  let work = 0, rest = 0;
  for (let i = 1; i <= days; i++) {
    const ds = y + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (i < 10 ? '0' + i : i);
    if (isRestDay(ds)) rest++; else work++;
  }
  return work * d.plans.workday + rest * d.plans.restday;
}

// ---- 差值 ----
function dayDiff(d) { return dayBudget(d) - daySpent(d); }
function weekDiff(d) { return weekBudget(d) - weekSpent(d); }
function monthDiff(d) { return monthBudget(d) - monthSpent(d); }

// ---- 核心结算：全量重算历史结转（对应原型 recomputeCarry，幂等） ----
function recomputeCarry(d) {
  const tk = todayKey();
  let earliest = tk;
  d.expenses.forEach(e => { if (e.date < tk && e.date < earliest) earliest = e.date; });
  let carry = 0, cur = earliest;
  while (cur < tk) {
    carry += (dayBudget(d, cur) - spentOn(d, cur));
    cur = addDays(cur, 1);
  }
  d.savedCarry = Math.round(carry * 10) / 10;
  d.lastSettled = tk;
  save(d);
}
function settleIfNewDay(d) { recomputeCarry(d); }
function settleDay(d, dateStr) { if (dateStr >= todayKey()) return; recomputeCarry(d); }

// ---- 储蓄罐净值（对应原型 ledger(): net = savedActive + savedCarry + dayDiff） ----
function net(d) {
  return Math.round((d.savedActive + d.savedCarry + dayDiff(d)) * 10) / 10;
}

// ---- 主动存钱（对应原型 doSave） ----
function doSave(d, amount) {
  d.savedActive = Math.round((d.savedActive + amount) * 10) / 10;
  d.savedActiveLog.push({ amount, date: todayKey(), ts: Date.now() });
  save(d);
}
function doResetActive(d) {
  d.savedActive = 0; d.savedCarry = 0; d.savedActiveLog = [];
  save(d);
}

// ---- 新增消费（对应原型 记账） ----
function addExpense(d, amount, cat, note, date) {
  date = date || todayKey();
  d.expenses.push({ date, amount, cat: cat || '其他', note: note || '', ts: Date.now() });
  save(d);
  settleIfNewDay(d);
}

// ---- 皮肤（对应原型 #app 多层径向光晕渐变） ----
// 每个皮肤返回完整 CSS background 字符串（4 角光晕 + 线性底），对齐 HTML 原型
const SKIN_BG_CSS = {
  aurora: 'radial-gradient(120% 90% at 12% 8%, #ffd6e7 0%, transparent 42%),'
        + 'radial-gradient(110% 80% at 88% 14%, #cfe0ff 0%, transparent 45%),'
        + 'radial-gradient(130% 100% at 75% 85%, #d6ffe9 0%, transparent 48%),'
        + 'radial-gradient(120% 90% at 20% 90%, #fff0c8 0%, transparent 46%),'
        + 'linear-gradient(160deg,#eef1fb,#e6e9f7)',
  sunset: 'radial-gradient(120% 90% at 12% 8%, #ffd9b8 0%, transparent 42%),'
        + 'radial-gradient(110% 80% at 88% 14%, #ffc7c0 0%, transparent 45%),'
        + 'radial-gradient(130% 100% at 75% 85%, #ffe3b0 0%, transparent 48%),'
        + 'radial-gradient(120% 90% at 20% 90%, #fff0c8 0%, transparent 46%),'
        + 'linear-gradient(160deg,#fff3e6,#ffe9d6)',
  mint:   'radial-gradient(120% 90% at 12% 8%, #c5ffe6 0%, transparent 42%),'
        + 'radial-gradient(110% 80% at 88% 14%, #d6f5ff 0%, transparent 45%),'
        + 'radial-gradient(130% 100% at 75% 85%, #c8ffd9 0%, transparent 48%),'
        + 'radial-gradient(120% 90% at 20% 90%, #e8fff0 0%, transparent 46%),'
        + 'linear-gradient(160deg,#eafff4,#dcfcec)',
  sakura: 'radial-gradient(120% 90% at 12% 8%, #ffd0e2 0%, transparent 42%),'
        + 'radial-gradient(110% 80% at 88% 14%, #ffe0ec 0%, transparent 45%),'
        + 'radial-gradient(130% 100% at 75% 85%, #ffd6e8 0%, transparent 48%),'
        + 'radial-gradient(120% 90% at 20% 90%, #fff0f6 0%, transparent 46%),'
        + 'linear-gradient(160deg,#fff0f6,#ffe6f0)',
  night:  'radial-gradient(120% 90% at 12% 8%, #3a3a66 0%, transparent 46%),'
        + 'radial-gradient(110% 80% at 88% 14%, #2a2a4e 0%, transparent 48%),'
        + 'radial-gradient(130% 100% at 75% 85%, #1f1f38 0%, transparent 50%),'
        + 'radial-gradient(120% 90% at 20% 90%, #2e2e52 0%, transparent 46%),'
        + 'linear-gradient(160deg,#1c1c2e,#16162a)',
  gold:   'radial-gradient(120% 90% at 12% 8%, #ffe9b0 0%, transparent 42%),'
        + 'radial-gradient(110% 80% at 88% 14%, #fff0c8 0%, transparent 45%),'
        + 'radial-gradient(130% 100% at 75% 85%, #ffe6a8 0%, transparent 48%),'
        + 'radial-gradient(120% 90% at 20% 90%, #fff8e6 0%, transparent 46%),'
        + 'linear-gradient(160deg,#fff8e6,#fff0c8)'
};
const SKIN_BASE = {
  aurora: '#eef1fb', sunset: '#fff3e6', mint: '#eafff4',
  sakura: '#fff0f6', night: '#1c1c2e', gold: '#fff8e6'
};
const SHEET_BG = {
  aurora: '#eef1fb', sunset: '#fff3e6', mint: '#eafff4',
  sakura: '#fff0f6', night: 'rgba(28,28,46,.96)', gold: '#fff8e6'
};
function skinBackground(id) { return SKIN_BG_CSS[id] || SKIN_BG_CSS.aurora; }
function skinBaseColor(id) { return SKIN_BASE[id] || SKIN_BASE.aurora; }
function sheetBackground(id) { return SHEET_BG[id] || SHEET_BG.aurora; }
function isNight(id) { return id === 'night'; }
function pickSkin(d, id) {
  d.skins.selected = id;
  if (!d.skins.owned.includes(id)) d.skins.owned.push(id);
  save(d);
}

// ========== 云端可插拔层（服务器未接时为 no-op） ==========
// 接服务器时只需实现 syncUp / syncDown（如 wx.request 或云函数）
// 上层业务逻辑不依赖此层，切换零成本
const syncLayer = {
  enabled: false,
  // 登录获取 userId（云开发：wx.cloud.callFunction；自建：wx.login -> 后端）
  async login() { return null; },
  // 上传本地数据到服务器
  async syncUp() { return true; },
  // 从服务器拉取并合并
  async syncDown() { return true; }
};

module.exports = {
  STORAGE_KEY, NET_VERSION, defaultData,
  todayKey, addDays,
  load, save,
  spentOn, daySpent, weekSpent, monthSpent,
  dayBudget, weekBudget, monthBudget,
  dayDiff, weekDiff, monthDiff,
  recomputeCarry, settleIfNewDay, settleDay,
  net, doSave, doResetActive, addExpense,
  skinBackground, skinBaseColor, sheetBackground, isNight, pickSkin,
  syncLayer
};
