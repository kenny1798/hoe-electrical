const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToRejectedRate({ username, startDate, endDate, followUpLogs }) {
  const totalFollowUp = followUpLogs.length;

  const rejectedCount = await msmart_structuredActivity.count({
    where: {
      username,
      createdAt: { [Op.between]: [startDate, endDate] },
      statusAfter: 'Rejected',
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
    }
  });

  const rate = totalFollowUp > 0 ? (rejectedCount / totalFollowUp) * 100 : 0;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads: totalFollowUp,
    totalRejectedLeads: rejectedCount
  };
};
