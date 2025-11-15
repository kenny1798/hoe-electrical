const { Op, fn, col, Sequelize } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

const statusList = ['Booking', 'Closed', 'Rejected', 'Follow Up'];

/**
 * Get final status per lead (latest per day), and count by date.
 */
async function getFinalStatusCountInRange({ username, startDate, endDate }) {
  // Step 1: Get latest activity per lead per day
  const latestActivities = await msmart_structuredActivity.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'activityDate'],
      'msmartleadId',
      [fn('MAX', col('createdAt')), 'latestTime']
    ],
    where: {
      username,
      actionType: { [Op.in]: ['edit', 'add', 'repeat'] },
      statusAfter: { [Op.in]: statusList },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  const conditions = latestActivities.map(act => ({
    msmartleadId: act.msmartleadId,
    createdAt: act.latestTime
  }));

  if (!conditions.length) {
    const empty = {};
    for (const status of statusList) {
      empty[status] = { total: 0, countByDate: {} };
    }
    return empty;
  }

  // Step 2: Get actual rows
  const finalRows = await msmart_structuredActivity.findAll({
    where: {
      username,
      [Op.or]: conditions
    },
    raw: true
  });

  const result = {};
  for (const status of statusList) {
    result[status] = { total: 0, countByDate: {} };
  }

  for (const row of finalRows) {
    const status = row.statusAfter;
    const dateObj = new Date(row.createdAt);
const date = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000)).toISOString().split('T')[0];

    if (!result[status]) continue;

    result[status].total += 1;
    result[status].countByDate[date] = (result[status].countByDate[date] || 0) + 1;
  }

  return result;
}

module.exports = getFinalStatusCountInRange;
