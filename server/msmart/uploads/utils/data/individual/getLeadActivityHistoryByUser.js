const { Op } = require('sequelize');
const { msmart_structuredActivity, msmartleads } = require('../../../models');

/**
 * Get full activity history per lead for a user within a date range.
 * Grouped by msmartleadId with corresponding lead details.
 */
async function getLeadActivityHistoryByUser({ username, startDate, endDate }) {
  // Step 1: Get all activities in range by user
  const activities = await msmart_structuredActivity.findAll({
    where: {
      username,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['createdAt', 'ASC']]
  });

  if (!activities.length) return [];

  // Step 2: Group by msmartleadId
  const grouped = {};
  const leadIds = new Set();

  for (const act of activities) {
    const leadId = act.msmartleadId;
    leadIds.add(leadId);
    if (!grouped[leadId]) grouped[leadId] = [];
    grouped[leadId].push(act);
  }

  // Step 3: Get lead details
  const leadDetails = await msmartleads.findAll({
    where: {
      id: Array.from(leadIds)
    }
  });

  const leadMap = {};
  for (const lead of leadDetails) {
    leadMap[lead.id] = lead;
  }

  // Step 4: Build final result
  const result = Object.entries(grouped).map(([leadId, activityList]) => ({
    leadId: parseInt(leadId),
    leadInfo: leadMap[leadId] || null,
    activities: activityList
  }));

  return result;
}

module.exports = getLeadActivityHistoryByUser;
