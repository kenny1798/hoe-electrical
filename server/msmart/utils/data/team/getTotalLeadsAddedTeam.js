const { Op, fn, col } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

/**
 * Get total leads added by team-wide members (excluding Manager).
 */
async function getTotalLeadsAddedTeam({ teamId, startDate, endDate }) {
  // Step 1: Ambil semua username dgn position Member / Manager & Member
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username']
  });

  const usernames = members.map(u => u.username);
  if (!usernames.length) return { total: 0, countByDate: {} };

  // Step 2: Kira total leads added
  const results = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      [fn('DATE', col('createdAt')), 'date'],
      [fn('COUNT', '*'), 'count']
    ],
    where: {
      username: { [Op.in]: usernames },
      actionType: 'add',
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['username', fn('DATE', col('createdAt'))],
    raw: true
  });

  const countByDate = {};
  let total = 0;

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

module.exports = getTotalLeadsAddedTeam;
