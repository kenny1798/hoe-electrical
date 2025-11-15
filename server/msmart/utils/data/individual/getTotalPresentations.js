const { Op, Sequelize, fn, col } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

const validStatuses = ['Follow Up', 'Booking', 'Closed', 'Rejected'];

/**
 * Get total presentations and count per day.
 */
async function getTotalPresentations({ username, startDate, endDate }) {
  const countByDate = {};

  // 1. From 'edit': No Status → valid
  const fromEdit = await msmart_structuredActivity.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username,
      actionType: 'edit',
      statusBefore: 'No Status',
      statusAfter: { [Op.in]: validStatuses },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  for (const row of fromEdit) {
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];
    countByDate[date] = (countByDate[date] || 0) + 1;
  }

  // 2. From 'add': terus dengan valid status
  const fromAdd = await msmart_structuredActivity.findAll({
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username,
      actionType: 'add',
      statusAfter: { [Op.in]: validStatuses },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  for (const row of fromAdd) {
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];
    countByDate[date] = (countByDate[date] || 0) + 1;
  }

  const total = Object.values(countByDate).reduce((sum, val) => sum + val, 0);

  return { total, countByDate };
}

module.exports = getTotalPresentations;
