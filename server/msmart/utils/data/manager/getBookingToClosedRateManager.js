const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getBookingToClosedRateManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Get all direct & nested members
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });

  const directUsernames = direct.map(m => m.username);

  const teamLeaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });

  const teamLeaderUsernames = teamLeaders.map(tl => tl.username);
  let nestedUsernames = [];

  if (teamLeaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: { teamId, managerUsername: { [Op.in]: teamLeaderUsernames } },
      attributes: ['username']
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) return {
    total: 0,
    totalBookingLeads: 0,
    totalClosedFromBooking: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalBookingLeads = 0;
  let totalClosedFromBooking = 0;

  for (const username of allUsernames) {
    // Step 2a: Get Booking leads for this user
    const bookingRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        teamId,
        statusAfter: 'Booking',
        actionType: { [Op.in]: ['add', 'edit'] },
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      raw: true
    });

    const bookingIds = bookingRows.map(row => row.msmartleadId);
    if (!bookingIds.length) continue;

    // Step 2b: Get how many of those became Closed
    const closedRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        teamId,
        statusAfter: 'Closed',
        actionType: { [Op.in]: ['add', 'edit'] },
        createdAt: { [Op.between]: [startDate, endDate] },
        msmartleadId: { [Op.in]: bookingIds }
      },
      raw: true
    });

    const closedIds = closedRows.map(r => r.msmartleadId);

    const bookingToClosedRate = (closedIds.length / bookingIds.length) * 100;

    countByUser[username] = {
      totalBookingLeads: bookingIds.length,
      totalClosedFromBooking: closedIds.length,
      bookingToClosedRate: Number(bookingToClosedRate.toFixed(2))
    };

    totalBookingLeads += bookingIds.length;
    totalClosedFromBooking += closedIds.length;
  }

  const overallRate = totalBookingLeads === 0 ? 0 : (totalClosedFromBooking / totalBookingLeads) * 100;

  return {
    total: Number(overallRate.toFixed(2)),
    totalBookingLeads,
    totalClosedFromBooking,
    countByUser
  };
}

module.exports = getBookingToClosedRateManager;
