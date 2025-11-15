const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpScheduledCountManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua anak buah
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username'],
  });
  const directUsernames = direct.map(u => u.username);

  const leaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' },
    },
    attributes: ['username'],
  });
  const leaderUsernames = leaders.map(u => u.username);

  let nestedUsernames = [];
  if (leaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: {
        teamId,
        managerUsername: { [Op.in]: leaderUsernames },
      },
      attributes: ['username'],
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) return { total: 0, countByDate: {}, logs: [] };

  // Step 2: Ambil semua activityLogs user bawah manager
  const activityLogs = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] },
    },
    raw: true,
  });

  // === Group by createdAt (untuk detect attempt)
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

  // === Convert logs (statusFrom Follow Up → statusTo Booking/Closed/Rejected)
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
    const key = `${log.username}-${log.msmartleadId}-${dateKey}`;

    const existing = uniqueLogs[key];
    if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
      uniqueLogs[key] = log;
    }
  }

  // === Kira by user + date
  const countByDate = {};
  for (const log of Object.values(uniqueLogs)) {
    const date = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const user = log.username;
    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = (countByDate[user][date] || 0) + 1;
  }

  const total = Object.values(uniqueLogs).length;

  return {
    total,
    countByDate,
    logs: Object.values(uniqueLogs),
  };
}

module.exports = getFollowUpScheduledCountManager;
