const { Op, fn, col, Sequelize } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

/**
 * Count total leads added per day (by a user).
 * Returns total + countByDate
 */
async function getTotalLeadsAdded({ username, teamId, startDate, endDate }) {
  console.log(username, teamId, startDate, endDate)
  const results = await msmart_structuredActivity.findAll({
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
      [Sequelize.fn('COUNT', '*'), 'count']
    ],
    where: {
      username,
      actionType: 'add',
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
    raw: true
  });

  const countByDate = {};
  let total = 0;

  for (const row of results) {
    const date = typeof row.date === 'string'
  ? row.date
  : new Date(row.date).toISOString().split('T')[0];

    const count = parseInt(row.count);
    countByDate[date] = count;
    total += count;
  }


  return { total, countByDate };
}

module.exports = getTotalLeadsAdded;
