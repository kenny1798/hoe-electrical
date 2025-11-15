const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpScheduledCountTeam({ teamId, startDate, endDate }) {
  // Step 1: Dapatkan semua ahli team (Member atau Manager & Member)
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username'],
    raw: true
  });

  const usernames = members.map(m => m.username);
  if (!usernames.length) return { total: 0, countByDate: {}, logs: [] };

  // Step 2: Ambil semua activity logs yang berkaitan
  const activityLogs = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: usernames },
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] },
    },
    raw: true,
  });

  // Step 3: Group by createdAt timestamp
  const logsByTime = {};
  for (const log of activityLogs) {
    const key = `${log.username}-${new Date(log.createdAt).toISOString()}`;
    if (!logsByTime[key]) logsByTime[key] = [];
    logsByTime[key].push(log);
  }

  const attemptLogs = [];
  for (const key in logsByTime) {
    const group = logsByTime[key];
    const hasFU = group.some(log => log.followUpDate !== null);
    const hasRemark = group.some(log => log.remarkChange);
    if (hasFU && hasRemark) {
      const selected = group.find(log => log.followUpDate !== null) || group[0];
      attemptLogs.push(selected);
    }
  }

  // Step 4: Convert logs
  const convertLogs = activityLogs.filter(
    log =>
      log.statusBefore === 'Follow Up' &&
      ['Booking', 'Closed', 'Rejected'].includes(log.statusAfter)
  );

  // Step 5: Merge + dedup
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

  // Step 6: Count by user + date
  const countByDate = {};
  for (const log of Object.values(uniqueLogs)) {
    const date = new Date(log.createdAt.getTime() + 8 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const user = log.username;

    if (!countByDate[user]) countByDate[user] = {};
    countByDate[user][date] = (countByDate[user][date] || 0) + 1;
  }

  const total = Object.values(countByDate)
    .flatMap(user => Object.values(user))
    .reduce((sum, count) => sum + count, 0);

  return {
    total,
    countByDate,
    logs: Object.values(uniqueLogs)
  };
}

module.exports = getFollowUpScheduledCountTeam;
