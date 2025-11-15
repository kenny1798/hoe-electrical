const { Op, fn, col } = require('sequelize');
const { msmartleads, msmart_teamManager } = require('../../../models');

async function getFollowUpScheduledCountTeam({ teamId, startDate, endDate }) {
  // Step 1: Get all members with position Member or Manager & Member
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username']
  });

  const usernames = members.map(m => m.username);
  if (!usernames.length) return { total: 0, countByDate: {} };

  // Step 2: Count leads with followUpDate in range
  const results = await msmartleads.findAll({
    attributes: [
      'username',
      [fn('DATE', col('followUpDate')), 'date'],
      [fn('COUNT', '*'), 'count']
    ],
    where: {
      username: { [Op.in]: usernames },
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

module.exports = getFollowUpScheduledCountTeam;
