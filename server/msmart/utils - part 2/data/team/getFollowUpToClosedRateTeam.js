const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToClosedRateTeam({ followUpLogs, teamId, startDate, endDate }) {
  const followUpLeadIds = [...new Set(followUpLogs.map(log => log.msmartleadId))];

  if (!followUpLeadIds.length) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalClosedLeads: 0,
    };
  }

  const closedLogs = await msmart_structuredActivity.findAll({
    where: {
      msmartleadId: { [Op.in]: followUpLeadIds },
      statusAfter: 'Closed',
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['edit', 'add'] }
    },
    attributes: ['msmartleadId'],
    group: ['msmartleadId'],
    raw: true
  });

  const closedLeadIds = new Set(closedLogs.map(log => log.msmartleadId));
  const totalClosedLeads = closedLeadIds.size;
  const totalFollowUpLeads = followUpLeadIds.length;
  const rate = totalFollowUpLeads > 0 ? (totalClosedLeads / totalFollowUpLeads) * 100 : 0;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads,
    totalClosedLeads
  };
};
