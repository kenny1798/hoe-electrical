const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToRejectedRateTeam({ followUpLogs, teamId, startDate, endDate }) {
  const followUpLeadIds = [...new Set(followUpLogs.map(log => log.msmartleadId))];

  if (!followUpLeadIds.length) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalRejectedLeads: 0,
    };
  }

  const rejectedLogs = await msmart_structuredActivity.findAll({
    where: {
      msmartleadId: { [Op.in]: followUpLeadIds },
      statusAfter: 'Rejected',
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['edit', 'add'] }
    },
    attributes: ['msmartleadId'],
    group: ['msmartleadId'],
    raw: true
  });

  const rejectedLeadIds = new Set(rejectedLogs.map(log => log.msmartleadId));
  const totalRejectedLeads = rejectedLeadIds.size;
  const totalFollowUpLeads = followUpLeadIds.length;
  const rate = totalFollowUpLeads > 0 ? (totalRejectedLeads / totalFollowUpLeads) * 100 : 0;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads,
    totalRejectedLeads
  };
};
