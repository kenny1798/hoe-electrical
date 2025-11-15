const { Op, Sequelize } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

async function getBookingToRejectedRate({ username, teamId, startDate, endDate }) {
  // Step 1: Dapatkan semua booking lead
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

  const bookingLeadIds = bookingRows.map(row => row.msmartleadId);
  if (!bookingLeadIds.length) {
    return {
      total: 0,
      totalBookingLeads: 0,
      totalRejectedFromBooking: 0
    };
  }

  // Step 2: Yang ended as Rejected
  const rejectedRows = await msmart_structuredActivity.findAll({
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('msmartleadId')), 'msmartleadId']],
    where: {
      username,
      teamId,
      statusAfter: 'Rejected',
      actionType: { [Op.in]: ['add', 'edit'] },
      createdAt: { [Op.between]: [startDate, endDate] },
      msmartleadId: { [Op.in]: bookingLeadIds }
    },
    raw: true
  });

  const rate = (rejectedRows.length / bookingLeadIds.length) * 100;

  return {
    total: Number(rate.toFixed(2)),
    totalBookingLeads: bookingLeadIds.length,
    totalRejectedFromBooking: rejectedRows.length
  };
}

module.exports = getBookingToRejectedRate;
