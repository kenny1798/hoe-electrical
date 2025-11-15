const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

/**
 * Get ratio: follow up attempts per closed lead (individual).
 */
async function getFollowUpPerCloseRatio({ username, startDate, endDate }) {
  // Step 1: Dapatkan semua log penutupan (Closed)
  const closedLogs = await msmart_structuredActivity.findAll({
    where: {
      username,
      actionType: { [Op.in]: ['edit', 'add'] },
      statusBefore: { [Op.ne]: 'Closed' }, // optional filter, just to make sure it was really a transition
      statusAfter: 'Closed',
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    order: [['createdAt', 'DESC']],
    raw: true
  });

  if (!closedLogs.length) return { total: 0 };

  let totalFollowUps = 0;

  // Step 2: Untuk setiap Closed log, cari jumlah follow-up sah sebelum closed
  for (const log of closedLogs) {
    const closedAt = log.createdAt;

    const allLogsForLead = await msmart_structuredActivity.findAll({
      where: {
        username,
        msmartleadId: log.msmartleadId,
        actionType: { [Op.in]: ['add', 'edit', 'repeat'] },
        createdAt: { [Op.lt]: closedAt }
      },
      raw: true
    });

    // Group logs by createdAt (per exact action timestamp)
    const grouped = {};
    for (const row of allLogsForLead) {
      const timeKey = new Date(row.createdAt).toISOString();
      if (!grouped[timeKey]) grouped[timeKey] = [];
      grouped[timeKey].push(row);
    }

    let followUpCount = 0;
    for (const group of Object.values(grouped)) {
      const hasRemark = group.some(g => g.remarkChange);
      const hasFUDate = group.some(g => g.followUpDate !== null);
      if (hasRemark && hasFUDate) {
        followUpCount++;
      }
    }

    totalFollowUps += followUpCount;
  }

  const ratio = totalFollowUps / closedLogs.length;
  return { total: Number(ratio.toFixed(2)) };
}

module.exports = getFollowUpPerCloseRatio;
