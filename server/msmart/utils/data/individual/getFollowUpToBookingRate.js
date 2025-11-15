const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToBookingRateManager({ teamId, managerUsername, startDate, endDate, followUpLogs }) {
  const totalFollowUp = followUpLogs.length;

  // Dapatkan senarai username dari followUpLogs
  const usernames = [...new Set(followUpLogs.map(log => log.username))];

  if (totalFollowUp === 0 || usernames.length === 0) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalBookingLeads: 0
    };
  }

  const bookingCount = await msmart_structuredActivity.count({
    where: {
      username: { [Op.in]: usernames },
      createdAt: { [Op.between]: [startDate, endDate] },
      statusAfter: 'Booking',
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
    }
  });

  const rate = (bookingCount / totalFollowUp) * 100;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads: totalFollowUp,
    totalBookingLeads: bookingCount
  };
};
