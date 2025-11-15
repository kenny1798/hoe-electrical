const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getBookingToRejectedRateManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua username bawah manager
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });
  const directUsernames = direct.map(u => u.username);

  const teamLeaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });
  const teamLeaderUsernames = teamLeaders.map(u => u.username);

  let nestedUsernames = [];
  if (teamLeaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: { teamId, managerUsername: { [Op.in]: teamLeaderUsernames } },
      attributes: ['username']
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) {
    return {
      total: 0,
      totalBookingLeads: 0,
      totalRejectedFromBooking: 0,
      countByUser: {}
    };
  }

  const countByUser = {};
  let totalBookingLeads = 0;
  let totalRejectedFromBooking = 0;

  for (const username of allUsernames) {
    // Step 2a: Get booking leads
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

    // Step 2b: Check which became rejected
    const rejectedRows = await msmart_structuredActivity.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
      where: {
        username,
        teamId,
        statusAfter: 'Rejected',
        actionType: { [Op.in]: ['add', 'edit'] },
        createdAt: { [Op.between]: [startDate, endDate] },
        msmartleadId: { [Op.in]: bookingIds }
      },
      raw: true
    });

    const rejectedIds = rejectedRows.map(r => r.msmartleadId);
    const bookingToRejectedRate = (rejectedIds.length / bookingIds.length) * 100;

    countByUser[username] = {
      totalBookingLeads: bookingIds.length,
      totalRejectedFromBooking: rejectedIds.length,
      bookingToRejectedRate: Number(bookingToRejectedRate.toFixed(2))
    };

    totalBookingLeads += bookingIds.length;
    totalRejectedFromBooking += rejectedIds.length;
  }

  const overallRate = totalBookingLeads === 0 ? 0 : (totalRejectedFromBooking / totalBookingLeads) * 100;

  return {
    total: Number(overallRate.toFixed(2)),
    totalBookingLeads,
    totalRejectedFromBooking,
    countByUser
  };
}

module.exports = getBookingToRejectedRateManager;
