const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpToRejectedRateManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Get all usernames under manager
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
  if (!allUsernames.length) return {
    total: 0,
    totalFollowUpLeads: 0,
    totalRejectedLeads: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalFollowUpLeads = 0;
  let totalRejectedLeads = 0;

  for (const username of allUsernames) {
    // Step 2a: Get follow up lead IDs (distinct)
    const followUpRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        actionType: 'edit',
        followUpDate: { [Op.ne]: null },
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      raw: true
    });
    const followUpIds = followUpRows.map(r => r.msmartleadId);
    if (!followUpIds.length) continue;

    // Step 2b: Get which of those leads ended as Rejected
    const rejectedRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        statusAfter: 'Rejected',
        actionType: { [Op.in]: ['edit', 'add'] },
        createdAt: { [Op.between]: [startDate, endDate] },
        msmartleadId: { [Op.in]: followUpIds }
      },
      raw: true
    });
    const rejectedIds = rejectedRows.map(r => r.msmartleadId);

    const rejectionRate = (rejectedIds.length / followUpIds.length) * 100;

    countByUser[username] = {
      totalFollowUpLeads: followUpIds.length,
      totalRejectedLeads: rejectedIds.length,
      rejectionRate: Number(rejectionRate.toFixed(2))
    };

    totalFollowUpLeads += followUpIds.length;
    totalRejectedLeads += rejectedIds.length;
  }

  const totalRate = totalFollowUpLeads === 0 ? 0 : (totalRejectedLeads / totalFollowUpLeads) * 100;

  return {
    total: Number(totalRate.toFixed(2)),
    totalFollowUpLeads,
    totalRejectedLeads,
    countByUser
  };
}

module.exports = getFollowUpToRejectedRateManager;
