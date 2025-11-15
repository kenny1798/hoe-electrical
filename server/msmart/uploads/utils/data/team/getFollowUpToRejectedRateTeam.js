const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpToRejectedRateTeam({ teamId, startDate, endDate }) {
  // Step 1: Get all team members (position: Member or Manager & Member)
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username'],
    raw: true
  });

  const usernames = members.map(m => m.username);
  if (!usernames.length) return {
    total: 0,
    totalFollowUpLeads: 0,
    totalRejectedLeads: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalFollowUpLeads = 0;
  let totalRejectedLeads = 0;

  for (const username of usernames) {
    // Step 2a: Dapatkan semua leads yang pernah di-follow up
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

    // Step 2b: Dapatkan leads yang berakhir sebagai 'Rejected'
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

module.exports = getFollowUpToRejectedRateTeam;
