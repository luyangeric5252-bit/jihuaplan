// 2026 中国节假日表（无网络，对应 HTML 原型 HOLIDAYS_2026）
// true = 法定假日（按非工作日预算）
const HOLIDAYS_2026 = {
  '2026-01-01': true, '2026-01-02': true, '2026-01-03': true,
  '2026-02-15': true, '2026-02-16': true, '2026-02-17': true,
  '2026-02-18': true, '2026-02-19': true, '2026-02-20': true,
  '2026-02-21': true, '2026-02-22': true, '2026-02-23': true,
  '2026-02-24': true, '2026-02-25': true, '2026-02-26': true,
  '2026-02-27': true, '2026-02-28': true,
  '2026-04-04': true, '2026-04-05': true, '2026-04-06': true,
  '2026-05-01': true, '2026-05-02': true, '2026-05-03': true,
  '2026-05-04': true, '2026-05-05': true,
  '2026-06-19': true, '2026-06-20': true, '2026-06-21': true,
  '2026-09-25': true, '2026-09-26': true, '2026-09-27': true,
  '2026-10-01': true, '2026-10-02': true, '2026-10-03': true,
  '2026-10-04': true, '2026-10-05': true, '2026-10-06': true,
  '2026-10-07': true, '2026-10-08': true
};

// 调休补班日（按工作日预算）
const WORKDAY_OVERRIDE_2026 = {
  '2026-02-14': true,
  '2026-05-09': true,
  '2026-09-19': true,
  '2026-10-10': true
};

function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const wd = d.getDay(); // 0=周日 6=周六
  return wd === 0 || wd === 6;
}

// 是否非工作日（假日表命中 或 周末且非补班）
function isRestDay(dateStr) {
  if (dateStr in HOLIDAYS_2026) return HOLIDAYS_2026[dateStr];
  if (dateStr in WORKDAY_OVERRIDE_2026) return !WORKDAY_OVERRIDE_2026[dateStr];
  return isWeekend(dateStr);
}

module.exports = { HOLIDAYS_2026, WORKDAY_OVERRIDE_2026, isWeekend, isRestDay };
