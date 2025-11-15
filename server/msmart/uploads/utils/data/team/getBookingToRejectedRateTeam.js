const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getBookingToRejectedRateTeam({ teamId, startDate, endDate }) {
  // Step 1: Get all team members (Member & Manager & Member)
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
    totalBookingLeads: 0,
    totalRejectedFromBooking: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalBookingLeads = 0;
  let totalRejectedFromBooking = 0;

  for (const username of usernames) {
    // Step 2a: Get booking leads for this user
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

    // Step 2b: Check which of them became Rejected
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

  const totalRate = totalBookingLeads === 0 ? 0 : (totalRejectedFromBooking / totalBookingLeads) * 100;

  return {
    total: Number(totalRate.toFixed(2)),
    totalBookingLeads,
    totalRejectedFromBooking,
    countByUser
  };
}

module.exports = getBookingToRejectedRateTeam;
