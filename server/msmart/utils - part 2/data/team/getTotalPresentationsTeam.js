const { Op, fn, col } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

const validStatuses = ['Follow Up', 'Booking', 'Closed', 'Rejected'];

async function getTotalPresentationsTeam({ teamId, startDate, endDate }) {
  // Step 1: Ambil semua user Member & Manager & Member
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username']
  });

  const usernames = members.map(u => u.username);
  if (!usernames.length) return { total: 0, countByDate: {} };

  const countByDate = {};
  let total = 0;

  // Step 2a: Edit from No Status → Valid
  const fromEdit = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username: { [Op.in]: usernames },
      actionType: 'edit',
      statusBefore: 'No Status',
      statusAfter: { [Op.in]: validStatuses },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['username', 'msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  for (const row of fromEdit) {
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];
    const user = row.username;
    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = (countByDate[user][date] || 0) + 1;
    total += 1;
  }

  // Step 2b: Add dengan Valid Status
  const fromAdd = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username: { [Op.in]: usernames },
      actionType: 'add',
      statusAfter: { [Op.in]: validStatuses },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['username', 'msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  for (const row of fromAdd) {
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];
    const user = row.username;
    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = (countByDate[user][date] || 0) + 1;
    total += 1;
  }

  return { total, countByDate };
}

module.exports = getTotalPresentationsTeam;
