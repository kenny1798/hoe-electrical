const { Op, fn, col, Sequelize } = require('sequelize');
const { msmartleads, msmart_teamManager } = require('../../../models');

async function getFollowUpScheduledCountManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua anak buah
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
  if (!allUsernames.length) return { total: 0, countByDate: {} };

  // Step 2: Ambil leads dengan followUpDate dalam range
  const results = await msmartleads.findAll({
    attributes: [
      'username',
      [fn('DATE', col('followUpDate')), 'date'],
      [fn('COUNT', '*'), 'count']
    ],
    where: {
      username: { [Op.in]: allUsernames },
      followUpDate: { [Op.between]: [startDate, endDate] }
    },
    group: ['username', fn('DATE', col('followUpDate'))],
    raw: true
  });

  const countByDate = {};
  let total = 0;

  for (const row of results) {
    const user = row.username;
    const date = typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10);
    const count = parseInt(row.count);

    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = count;
    total += count;
  }

  return { total, countByDate };
}

module.exports = getFollowUpScheduledCountManager;
