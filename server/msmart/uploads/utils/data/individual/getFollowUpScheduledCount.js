const { Op, Sequelize, fn, col } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

async function getFollowUpScheduledCount({ username, startDate, endDate }) {
  // Step 1: Ambil follow up yang latest per lead per hari
  const latestFU = await msmart_structuredActivity.findAll({
    attributes: [
      'msmartleadId',
      [fn('DATE', col('followUpDate')), 'fuDate'],
      [fn('MAX', col('createdAt')), 'latestTime']
    ],
    where: {
      username,
      followUpDate: { [Op.between]: [startDate, endDate]  }
    },
    group: ['msmartleadId', fn('DATE', col('followUpDate'))],
    raw: true
  });

  const conditions = latestFU.map(row => ({
    msmartleadId: row.msmartleadId,
    createdAt: row.latestTime
  }));

  if (!conditions.length) return { total: 0, countByDate: {} };

  // Step 2: Dapatkan full row ikut condition atas
  const fullRows = await msmart_structuredActivity.findAll({
    where: {
      username,
      [Op.or]: conditions
    },
    raw: true
  });

  // Step 3: Kira ikut tarikh followUpDate
  const countByDate = {};
  let total = 0;

  for (const row of fullRows) {
    if (!row.followUpDate) continue;

    const date = new Date(row.followUpDate.getTime() + 8 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    countByDate[date] = (countByDate[date] || 0) + 1;
    total += 1;
  }

  return { total, countByDate };
}

module.exports = getFollowUpScheduledCount;
