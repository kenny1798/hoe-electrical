const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getBookingToClosedRateTeam({ teamId, startDate, endDate }) {
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
    totalClosedFromBooking: 0,
    countByUser: {}
  };

  const countByUser = {};
  let totalBookingLeads = 0;
  let totalClosedFromBooking = 0;

  for (const username of usernames) {
    // Step 2a: Get all Booking leads
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

    const bookingIds = bookingRows.map(r => r.msmartleadId);
    if (!bookingIds.length) continue;

    // Step 2b: Get how many became Closed
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

  const totalRate = totalBookingLeads === 0 ? 0 : (totalClosedFromBooking / totalBookingLeads) * 100;

  return {
    total: Number(totalRate.toFixed(2)),
    totalBookingLeads,
    totalClosedFromBooking,
    countByUser
  };
}

module.exports = getBookingToClosedRateTeam;
