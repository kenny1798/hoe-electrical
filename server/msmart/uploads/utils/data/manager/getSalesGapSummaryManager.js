const { Op } = require('sequelize');
const { msmart_teamManager, msmart_salesTarget, msmart_salesSubmit } = require('../../../models');

function getDateRangeList(startDate, endDate) {
  const result = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    result.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

function getMonthYearRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    result.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

async function getSalesGapSummaryManager({ teamId, managerUsername, startDate, endDate }) {
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });
  const directUsernames = direct.map(u => u.username);

  const leaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });
  const leaderUsernames = leaders.map(u => u.username);

  let nestedUsernames = [];
  if (leaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: {
        teamId,
        managerUsername: { [Op.in]: leaderUsernames }
      },
      attributes: ['username']
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) {
    return {
      targetAmount: 0,
      actualSalesAmount: 0,
      salesGap: 0,
      percentageAchieved: 0,
      countByDate: {}
    };
  }

  const monthYearList = getMonthYearRange(startDate, endDate);
  const dateList = getDateRangeList(startDate, endDate);

  const targetRows = await msmart_salesTarget.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      [Op.or]: monthYearList
    },
    raw: true
  });

  const targetByUserDate = {};
  for (const row of targetRows) {
    const { username, year, month, targetAmount } = row;
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = Number(targetAmount) / daysInMonth;
    for (const dateStr of dateList) {
      const d = new Date(dateStr);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        if (!targetByUserDate[username]) targetByUserDate[username] = {};
        targetByUserDate[username][dateStr] = daily;
      }
    }
  }

  const actualRows = await msmart_salesSubmit.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    attributes: ['username', 'repeatAmount', 'createdAt'],
    raw: true
  });

  const actualByUserDate = {};
  for (const row of actualRows) {
    const username = row.username;
    const localDate = new Date(row.createdAt);
    const date = localDate.getFullYear() + '-' +
                 String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
                 String(localDate.getDate()).padStart(2, '0');
  
    if (!actualByUserDate[username]) actualByUserDate[username] = {};
    if (!actualByUserDate[username][date]) actualByUserDate[username][date] = 0;
    actualByUserDate[username][date] += Number(row.repeatAmount);
  }
  

  const countByDate = {};
  let totalTarget = 0;
  let totalActual = 0;

  for (const username of allUsernames) {
    countByDate[username] = {};
    for (const date of dateList) {
      const t = (targetByUserDate[username]?.[date]) || 0;
      const a = (actualByUserDate[username]?.[date]) || 0;
      const g = t - a;
      const p = t === 0 ? 0 : (a / t) * 100;

      countByDate[username][date] = {
        targetAmount: Number(t.toFixed(2)),
        actualSalesAmount: Number(a.toFixed(2)),
        salesGap: Number(g.toFixed(2)),
        percentageAchieved: Number(p.toFixed(2))
      };

      totalTarget += t;
      totalActual += a;
    }
  }

  const salesGap = totalTarget - totalActual;
  const percentageAchieved = totalTarget === 0 ? 0 : (totalActual / totalTarget) * 100;

  return {
    targetAmount: Number(totalTarget.toFixed(2)),
    actualSalesAmount: Number(totalActual.toFixed(2)),
    salesGap: Number(salesGap.toFixed(2)),
    percentageAchieved: Number(percentageAchieved.toFixed(2)),
    countByDate
  };
}

module.exports = getSalesGapSummaryManager;
