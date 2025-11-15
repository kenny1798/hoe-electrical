const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToClosedRate({ username, startDate, endDate, followUpLogs }) {
  const totalFollowUp = followUpLogs.length;

  const closedCount = await msmart_structuredActivity.count({
    where: {
      username,
      createdAt: { [Op.between]: [startDate, endDate] },
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
    }
  });

  const rate = totalFollowUp > 0 ? (closedCount / totalFollowUp) * 100 : 0;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads: totalFollowUp,
    totalClosedLeads: closedCount
  };
};
