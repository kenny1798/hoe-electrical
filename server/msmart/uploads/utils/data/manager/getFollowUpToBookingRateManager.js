const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpToBookingRateManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Get all sub-users
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
    totalBookingLeads: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalFollowUpLeads = 0;
  let totalBookingLeads = 0;

  for (const username of allUsernames) {
    // Step 2a: Get all follow-up leads
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

    // Step 2b: How many of them ended as Booking
    const bookingRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        statusAfter: 'Booking',
        actionType: { [Op.in]: ['edit', 'add'] },
        createdAt: { [Op.between]: [startDate, endDate] },
        msmartleadId: { [Op.in]: followUpIds }
      },
      raw: true
    });

    const bookingIds = bookingRows.map(r => r.msmartleadId);

    const bookingRate = (bookingIds.length / followUpIds.length) * 100;

    countByUser[username] = {
      totalFollowUpLeads: followUpIds.length,
      totalBookingLeads: bookingIds.length,
      bookingRate: Number(bookingRate.toFixed(2))
    };

    totalFollowUpLeads += followUpIds.length;
    totalBookingLeads += bookingIds.length;
  }

  const totalRate = totalFollowUpLeads === 0 ? 0 : (totalBookingLeads / totalFollowUpLeads) * 100;

  return {
    total: Number(totalRate.toFixed(2)),
    totalFollowUpLeads,
    totalBookingLeads,
    countByUser
  };
}

module.exports = getFollowUpToBookingRateManager;
