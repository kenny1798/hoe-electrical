const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

/**
 * Get ratio: follow ups per closed lead (by user).
 */
async function getFollowUpPerCloseRatio({ username, startDate, endDate }) {
  // Step 1: Dapatkan semua leads yang user close
  const closedRows = await msmart_structuredActivity.findAll({
    where: {
      username,
      actionType: { [Op.in]: ['edit', 'add'] },
      statusAfter: 'Closed',
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    order: [['createdAt', 'DESC']]
  });

  if (!closedRows.length) return { total: 0 };

  let totalFollowUps = 0;

  for (const row of closedRows) {
    const leadId = row.msmartleadId;
    const closedAt = row.createdAt;

    const followUps = await msmart_structuredActivity.count({
      where: {
        username,
        msmartleadId: leadId,
        actionType: 'edit',
        followUpDate: { [Op.ne]: null },
        createdAt: { [Op.lt]: closedAt }
      }
    });

    totalFollowUps += followUps;
  }

  const ratio = totalFollowUps / closedRows.length;
  return { total: Number(ratio.toFixed(2)) };
}

module.exports = getFollowUpPerCloseRatio;
