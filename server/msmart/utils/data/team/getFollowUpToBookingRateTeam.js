const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

module.exports = async function getFollowUpToBookingRateTeam({ followUpLogs, teamId, startDate, endDate }) {
  const followUpLeadIds = [...new Set(followUpLogs.map(log => log.msmartleadId))];

  if (!followUpLeadIds.length) {
    return {
      total: 0,
      totalFollowUpLeads: 0,
      totalBookingLeads: 0,
    };
  }

  const bookingLogs = await msmart_structuredActivity.findAll({
    where: {
      msmartleadId: { [Op.in]: followUpLeadIds },
      statusAfter: 'Booking',
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['edit', 'add'] }
    },
    attributes: ['msmartleadId'],
    group: ['msmartleadId'],
    raw: true
  });

  const bookingLeadIds = new Set(bookingLogs.map(log => log.msmartleadId));
  const totalBookingLeads = bookingLeadIds.size;
  const totalFollowUpLeads = followUpLeadIds.length;
  const rate = totalFollowUpLeads > 0 ? (totalBookingLeads / totalFollowUpLeads) * 100 : 0;

  return {
    total: Number(rate.toFixed(2)),
    totalFollowUpLeads,
    totalBookingLeads
  };
};
