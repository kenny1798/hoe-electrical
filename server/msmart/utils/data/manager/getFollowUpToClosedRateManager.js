const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToClosedRateManager({ teamId, managerUsername, startDate, endDate, followUpLogs }) {
  const totalFollowUp = followUpLogs.length;

  const usernames = [...new Set(followUpLogs.map(log => log.username))];

  if (totalFollowUp === 0 || usernames.length === 0) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalClosedLeads: 0
    };
  }

  const closedCount = await msmart_structuredActivity.count({
    where: {
      username: { [Op.in]: usernames },
      createdAt: { [Op.between]: [startDate, endDate] },
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
    }
  });

  const rate = (closedCount / totalFollowUp) * 100;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads: totalFollowUp,
    totalClosedLeads: closedCount
  };
};
