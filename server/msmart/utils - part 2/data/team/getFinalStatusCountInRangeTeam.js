const { Op, fn, col } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

const statusList = ['Booking', 'Closed', 'Rejected', 'Follow Up'];

async function getFinalStatusCountInRangeTeam({ teamId, startDate, endDate }) {
  // Step 1: Get all usernames under Member / Manager & Member
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username']
  });

  const usernames = members.map(u => u.username);
  if (!usernames.length) {
    const empty = {};
    for (const status of statusList) {
      empty[status] = { total: 0, countByDate: {} };
    }
    return empty;
  }

  // Step 2: Get latest activity per lead per day
  const latestActivities = await msmart_structuredActivity.findAll({
    attributes: [
      'username',
      'msmartleadId',
      [fn('DATE', col('createdAt')), 'activityDate'],
      [fn('MAX', col('createdAt')), 'latestTime']
    ],
    where: {
      username: { [Op.in]: usernames },
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

  // Step 3: Get actual rows
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
    const date = new Date(row.createdAt).toISOString().slice(0, 10);
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
      if (!hadChange) continue;
    }

    result[status].total += 1;
    if (!result[status].countByDate[user]) result[status].countByDate[user] = {};
    result[status].countByDate[user][date] = (result[status].countByDate[user][date] || 0) + 1;
  }

  return result;
}

module.exports = getFinalStatusCountInRangeTeam;
