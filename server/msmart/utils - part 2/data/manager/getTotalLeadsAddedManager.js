const { Op, fn, col, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getTotalLeadsAddedManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua username bawah manager
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

  // Step 2: Dapatkan count by username + date
  const results = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', '*'), 'count']
    ],
    where: {
      username: { [Op.in]: allUsernames },
      actionType: 'add',
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    group: ['username', fn('DATE', col('createdAt'))],
    raw: true
  });

  // Step 3: Format output
  let total = 0;
  const countByDate = {};

  for (const row of results) {
    const user = row.username;
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];
    const count = parseInt(row.count);

    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = count;
    total += count;
  }

  return { total, countByDate };
}

module.exports = getTotalLeadsAddedManager;
