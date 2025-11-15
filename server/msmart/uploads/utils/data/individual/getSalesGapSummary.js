const { Op, Sequelize } = require('sequelize');
const { msmart_salesTarget, msmart_salesSubmit } = require('../../../models');

// Helper: list all months between start & end
function getMonthYearRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    let daysIncluded = daysInMonth;
    if (year === start.getFullYear() && month === start.getMonth() + 1) {
      daysIncluded = daysInMonth - start.getDate() + 1;
    }
    if (year === end.getFullYear() && month === end.getMonth() + 1) {
      daysIncluded = end.getDate();
    }

    result.push({ year, month, daysInMonth, daysIncluded });
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

function getDateRangeList(startDate, endDate) {
  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push(dateStr);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

async function getSalesGapSummary({ username, startDate, endDate }) {
  const monthYearList = getMonthYearRange(startDate, endDate);
  const dateList = getDateRangeList(startDate, endDate);

  // Step 1: Target dari msmart_salesTarget
  const whereConditions = monthYearList.map(({ year, month }) => ({ year, month, username }));
  const targetRows = await msmart_salesTarget.findAll({
    where: { [Op.or]: whereConditions },
    raw: true
  });

  const targetByDate = {};
  for (const dateStr of dateList) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const row = targetRows.find(r => r.year === year && r.month === month);
    if (row) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const daily = Number(row.targetAmount) / daysInMonth;
      targetByDate[dateStr] = daily;
    } else {
      targetByDate[dateStr] = 0;
    }
  }

  // Step 2: Actual sales dari msmart_salesSubmit ikut createdAt
  const actualRows = await msmart_salesSubmit.findAll({
    where: {
      username,
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    attributes: ['repeatAmount', 'createdAt'],
    raw: true
  });

  const actualByDate = {};
  for (const row of actualRows) {
    const localDate = new Date(row.createdAt);
    const date = localDate.getFullYear() + '-' +
                 String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
                 String(localDate.getDate()).padStart(2, '0');
  
    if (!actualByDate[date]) actualByDate[date] = 0;
    actualByDate[date] += Number(row.repeatAmount);
  }
  

  // Step 3: Final calculation
  const countByDate = {};
  let targetAmount = 0;
  let actualSalesAmount = 0;

  for (const date of dateList) {
    const t = targetByDate[date] || 0;
    const a = actualByDate[date] || 0;
    const g = t - a;
    countByDate[date] = {
      targetAmount: Number(t.toFixed(2)),
      actualSalesAmount: Number(a.toFixed(2)),
      salesGap: Number(g.toFixed(2)),
      percentageAchieved: t === 0 ? 0 : Number(((a / t) * 100).toFixed(2))
    };
    targetAmount += t;
    actualSalesAmount += a;
  }

  const salesGap = targetAmount - actualSalesAmount;
  const percentageAchieved = targetAmount === 0 ? 0 : (actualSalesAmount / targetAmount) * 100;

  return {
    targetAmount: Number(targetAmount.toFixed(2)),
    actualSalesAmount: Number(actualSalesAmount.toFixed(2)),
    salesGap: Number(salesGap.toFixed(2)),
    percentageAchieved: Number(percentageAchieved.toFixed(2)),
    countByDate
  };
}

module.exports = getSalesGapSummary;
