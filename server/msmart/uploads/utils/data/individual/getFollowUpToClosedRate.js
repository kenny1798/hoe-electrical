const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

/**
 * % of follow up leads that ended as Closed (individual)
 */
async function getFollowUpToClosedRate({ username, startDate, endDate }) {
  const baseFilter = {
    username,
    createdAt: { [Op.between]: [startDate, endDate] }
  };

  // Step 1: Get unique leads that had follow up
  const followUpRows = await msmart_structuredActivity.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']
    ],
    where: {
      ...baseFilter,
      actionType: 'edit',
      followUpDate: { [Op.ne]: null }
    },
    raw: true
  });

  const followUpLeadIds = followUpRows.map(row => row.msmartleadId);

  if (!followUpLeadIds.length) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalClosedLeads: 0
    };
  }

  // Step 2: From that list, find how many ended as Closed
  const closedRows = await msmart_structuredActivity.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']
    ],
    where: {
      ...baseFilter,
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['edit', 'add'] },
      msmartleadId: { [Op.in]: followUpLeadIds }
    },
    raw: true
  });

  const closedLeadIds = closedRows.map(row => row.msmartleadId);
  const rate = (closedLeadIds.length / followUpLeadIds.length) * 100;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads: followUpLeadIds.length,
    totalClosedLeads: closedLeadIds.length
  };
}

module.exports = getFollowUpToClosedRate;
