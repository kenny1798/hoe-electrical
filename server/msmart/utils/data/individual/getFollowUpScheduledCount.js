const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

async function getFollowUpScheduledCount({ username, startDate, endDate }) {
  const activityLogs = await msmart_structuredActivity.findAll({
    where: {
      username,
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] },
    },
    raw: true,
  });

  // === Group log ikut createdAt (untuk detect attempt)
  const logsByCreatedAt = {};
  for (const log of activityLogs) {
    const key = new Date(log.createdAt).toISOString();
    if (!logsByCreatedAt[key]) logsByCreatedAt[key] = [];
    logsByCreatedAt[key].push(log);
  }

  const attemptLogs = [];
  for (const key in logsByCreatedAt) {
    const group = logsByCreatedAt[key];
    const hasFU = group.some(log => log.followUpDate !== null);
    const hasRemark = group.some(log => log.remarkChange);
    if (hasFU && hasRemark) {
      const selected = group.find(log => log.followUpDate !== null) || group[0];
      attemptLogs.push(selected);
    }
  }

  // === Follow Up Convert: statusBefore = Follow Up → statusAfter in Booking/Closed/Rejected
  const convertLogs = activityLogs.filter(
    log =>
      log.statusBefore === 'Follow Up' &&
      ['Booking', 'Closed', 'Rejected'].includes(log.statusAfter)
  );

  // === Merge & deduplicate
  const mergedLogs = [...attemptLogs, ...convertLogs];
  const uniqueLogs = {};

  for (const log of mergedLogs) {
    const followUpDate = log.followUpDate || log.createdAt;
    const dateKey = new Date(new Date(followUpDate).getTime() + 8 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const key = `${log.msmartleadId}-${dateKey}`;

    const existing = uniqueLogs[key];
    if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
      uniqueLogs[key] = log;
    }
  }

  // === Kira by date
  const countByDate = {};
  for (const log of Object.values(uniqueLogs)) {
    const date = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    countByDate[date] = (countByDate[date] || 0) + 1;
  }

  const total = Object.values(countByDate).reduce((sum, count) => sum + count, 0);

  return {
    total,
    countByDate,
    logs: Object.values(uniqueLogs), // 🧠 digunakan semula
  };
  
}

module.exports = getFollowUpScheduledCount;
