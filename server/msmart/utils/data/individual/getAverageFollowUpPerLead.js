const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

/**
 * Get average number of follow ups made per lead (by user).
 */
async function getAverageFollowUpPerLead({ username, startDate, endDate }) {
  const activities = await msmart_structuredActivity.findAll({
    where: {
      username,
      actionType: 'edit',
      followUpDate: { [Op.ne]: null },
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  if (!activities.length) return { total: 0 };

  const countMap = {};
  for (const row of activities) {
    const leadId = row.msmartleadId;
    countMap[leadId] = (countMap[leadId] || 0) + 1;
  }

  const totalLeads = Object.keys(countMap).length;
  const totalFollowUps = Object.values(countMap).reduce((sum, val) => sum + val, 0);

  const avg = totalLeads === 0 ? 0 : totalFollowUps / totalLeads;

  return { total: Number(avg.toFixed(2)) };
}

module.exports = getAverageFollowUpPerLead;
