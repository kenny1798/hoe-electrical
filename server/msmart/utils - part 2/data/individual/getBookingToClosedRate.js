const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

async function getBookingToClosedRate({ username, teamId, startDate, endDate }) {
  // Step 1: Cari all unique booking leads
  const bookingRows = await msmart_structuredActivity.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']
    ],
    where: {
      username,
      teamId,
      statusAfter: 'Booking',
      actionType: { [Op.in]: ['add', 'edit'] },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    raw: true
  });

  const bookingLeadIds = bookingRows.map(row => row.msmartleadId);
  if (!bookingLeadIds.length) {
    return {
      total: 0,
      totalBookingLeads: 0,
      totalClosedFromBooking: 0
    };
  }

  // Step 2: Dari booking lead tadi, berapa ended as Closed
  const closedRows = await msmart_structuredActivity.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']
    ],
    where: {
      username,
      teamId,
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['add', 'edit'] },
      createdAt: { [Op.between]: [startDate, endDate] },
      msmartleadId: { [Op.in]: bookingLeadIds }
    },
    raw: true
  });

  const rate = (closedRows.length / bookingLeadIds.length) * 100;

  return {
    total: Number(rate.toFixed(2)),
    totalBookingLeads: bookingLeadIds.length,
    totalClosedFromBooking: closedRows.length
  };
}

module.exports = getBookingToClosedRate;
