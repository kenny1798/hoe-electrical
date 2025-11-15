const { Op, Sequelize, fn, col } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

const validStatuses = ['Follow Up', 'Booking', 'Closed', 'Rejected'];

async function getTotalPresentationsManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua anak buah bawah manager
  const directMembers = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });
  const directUsernames = directMembers.map(m => m.username);

  const teamLeaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });
  const teamLeaderUsernames = teamLeaders.map(tl => tl.username);

  let nestedUsernames = [];
  if (teamLeaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: {
        teamId,
        managerUsername: { [Op.in]: teamLeaderUsernames }
      },
      attributes: ['username']
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) return { total: 0, countByDate: {} };

  console.log(allUsernames)

  const countByDate = {};
  let total = 0;

  // Step 2a: Presentation from edit (No Status → Valid)
  const fromEdit = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username: { [Op.in]: allUsernames },
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

  // Step 2b: Presentation from add with valid status
  const fromAdd = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      'msmartleadId'
    ],
    where: {
      username: { [Op.in]: allUsernames },
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

module.exports = getTotalPresentationsManager;
