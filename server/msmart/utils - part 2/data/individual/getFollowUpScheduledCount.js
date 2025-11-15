const { Op } = require('sequelize');
const { msmart_structuredActivity } = require('../../../models');

async function getFollowUpScheduledCount({ username, startDate, endDate }) {
  // Step 1: Fetch activity logs
  const activityLogs = await msmart_structuredActivity.findAll({
    where: {
      username,
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] },
    },
    raw: true,
  });

  // Step 2: Group logs by username + leadId + date
  const grouped = {};
  for (const log of activityLogs) {
    const dateKey = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10); // Malaysia timezone
    const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  }

  // Step 3: Detect follow-up attempt logs
  const attemptLogs = {};
  for (const key in grouped) {
    const logs = grouped[key];

    const logsByTime = {};
    for (const log of logs) {
      const timeKey = new Date(log.createdAt).toISOString();
      if (!logsByTime[timeKey]) logsByTime[timeKey] = [];
      logsByTime[timeKey].push(log);
    }

    for (const exactGroup of Object.values(logsByTime)) {
      const hasFU = exactGroup.some(log => log.followUpDate !== null);
      const hasRemark = exactGroup.some(log => log.remarkChange);

      if (hasFU && hasRemark) {
        const selected = exactGroup.find(log => log.followUpDate !== null) || exactGroup[0];
        attemptLogs[key] = selected;
        break;
      }
    }
  }

  // Step 4: Detect follow-up converts
  const convertLogs = {};
  for (const log of activityLogs) {
    if (
      log.statusBefore === 'Follow Up' &&
      ['Booking', 'Closed', 'Rejected'].includes(log.statusAfter)
    ) {
      const dateKey = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
      const current = convertLogs[key];
      if (!current || new Date(log.createdAt) > new Date(current.createdAt)) {
        convertLogs[key] = log;
      }
    }
  }

  // Step 5: Merge + dedup
  const mergedLogs = { ...attemptLogs };
  for (const key in convertLogs) {
    const convertLog = convertLogs[key];
    const current = mergedLogs[key];
    if (!current || new Date(convertLog.createdAt) > new Date(current.createdAt)) {
      mergedLogs[key] = convertLog;
    }
  }

  // Step 6: Count by date
  const countByDate = {};
  for (const log of Object.values(mergedLogs)) {
    const date = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    countByDate[date] = (countByDate[date] || 0) + 1;
  }

  const total = Object.values(countByDate).reduce((sum, count) => sum + count, 0);

  return {
    total,
    countByDate,
    logs: Object.values(mergedLogs), // ✅ sama seperti code lama
  };
}

module.exports = getFollowUpScheduledCount;
