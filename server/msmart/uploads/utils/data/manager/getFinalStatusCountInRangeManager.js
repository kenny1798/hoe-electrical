const { Op, fn, col } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

const statusList = ['Booking', 'Closed', 'Rejected', 'Follow Up'];

async function getFinalStatusCountInRangeManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Cari anak buah direct dan nested
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });
  const directUsernames = direct.map((u) => u.username);

  const leaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });
  const leaderUsernames = leaders.map((u) => u.username);

  let nestedUsernames = [];
  if (leaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: {
        teamId,
        managerUsername: { [Op.in]: leaderUsernames }
      },
      attributes: ['username']
    });
    nestedUsernames = nested.map((u) => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) {
    const empty = {};
    for (const status of statusList) {
      empty[status] = { total: 0, countByDate: {} };
    }
    return empty;
  }

  // Step 2: Dapatkan latest activity per lead per day
  const latestActivities = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      'msmartleadId',
      [fn('DATE', col('createdAt')), 'activityDate'],
      [fn('MAX', col('createdAt')), 'latestTime']
    ],
    where: {
      username: { [Op.in]: allUsernames },
      actionType: { [Op.in]: ['edit', 'add', 'repeat'] },
      statusAfter: { [Op.in]: statusList },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    group: ['username', 'msmartleadId', fn('DATE', col('createdAt'))],
    raw: true
  });

  const lookupConditions = latestActivities.map(act => ({
    username: act.username,
    msmartleadId: act.msmartleadId,
    createdAt: act.latestTime
  }));

  if (!lookupConditions.length) {
    const empty = {};
    for (const status of statusList) {
      empty[status] = { total: 0, countByDate: {} };
    }
    return empty;
  }

  // Step 3: Dapatkan final rows
  const finalRows = await msmart_structuredActivity.findAll({
    where: {
      [Op.or]: lookupConditions
    },
    raw: true
  });

  const result = {};
  for (const status of statusList) {
    result[status] = { total: 0, countByDate: {} };
  }

  for (const row of finalRows) {
    const status = row.statusAfter;
    const d = new Date(row.createdAt);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const user = row.username;

    if (!result[status]) continue;

    // ✅ Custom logic untuk Follow Up
    if (status === 'Follow Up') {
      const hadChange = finalRows.some(other =>
        other.msmartleadId === row.msmartleadId &&
        other.username === row.username &&
        new Date(other.createdAt) > new Date(row.createdAt) &&
        ['Booking', 'Closed', 'Rejected'].includes(other.statusAfter)
      );
      if (!hadChange) continue; // Skip jika tak berubah status
    }

    result[status].total += 1;
    if (!result[status].countByDate[user]) result[status].countByDate[user] = {};
    result[status].countByDate[user][date] = (result[status].countByDate[user][date] || 0) + 1;
  }

  return result;
}

module.exports = getFinalStatusCountInRangeManager;
