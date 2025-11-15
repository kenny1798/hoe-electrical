const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpPerCloseRatioManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua anak buah
  const direct = await msmart_teamManager.findAll({
    where: { teamId, managerUsername },
    attributes: ['username']
  });
  const directUsernames = direct.map(u => u.username);

  const leaders = await msmart_teamManager.findAll({
    where: {
      teamId,
      managerUsername,
      position: { [Op.like]: '%Manager%' }
    },
    attributes: ['username']
  });
  const leaderUsernames = leaders.map(u => u.username);

  let nestedUsernames = [];
  if (leaderUsernames.length) {
    const nested = await msmart_teamManager.findAll({
      where: {
        teamId,
        managerUsername: { [Op.in]: leaderUsernames }
      },
      attributes: ['username']
    });
    nestedUsernames = nested.map(u => u.username);
  }

  const allUsernames = [...new Set([...directUsernames, ...nestedUsernames])];
  if (!allUsernames.length) return { total: 0, countByUser: {} };

  // Step 2: Ambil semua log (add/edit/repeat) dalam date range
  const logs = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      createdAt: { [Op.between]: [startDate, endDate] },
      actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
    },
    raw: true
  });

  // Step 3: Pisah ikut user
  const logsByUser = {};
  for (const log of logs) {
    const username = log.username;
    if (!logsByUser[username]) logsByUser[username] = [];
    logsByUser[username].push(log);
  }

  const countByUser = {};
  let totalClosed = 0;
  let totalFollowUpsBeforeClosed = 0;

  for (const [username, userLogs] of Object.entries(logsByUser)) {
    const leadMap = {};

    // Group by leadId
    for (const log of userLogs) {
      const leadId = log.msmartleadId;
      if (!leadMap[leadId]) leadMap[leadId] = [];
      leadMap[leadId].push(log);
    }

    let userClosed = 0;
    let userFollowUps = 0;

    for (const [leadId, leadLogs] of Object.entries(leadMap)) {
      const closedLog = leadLogs
        .filter(l => l.statusAfter === 'Closed')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (!closedLog) continue;

      userClosed += 1;

      const followUps = leadLogs.filter(l =>
        l.createdAt < closedLog.createdAt &&
        l.followUpDate !== null &&
        l.remarkChange
      );

      userFollowUps += followUps.length;
    }

    const avg = userClosed === 0 ? 0 : userFollowUps / userClosed;

    countByUser[username] = {
      totalFollowUpsBeforeClosed: userFollowUps,
      totalClosed: userClosed,
      averageFollowUpPerClosed: Number(avg.toFixed(2))
    };

    totalClosed += userClosed;
    totalFollowUpsBeforeClosed += userFollowUps;
  }

  const overallRatio = totalClosed === 0 ? 0 : totalFollowUpsBeforeClosed / totalClosed;

  return {
    total: Number(overallRatio.toFixed(2)),
    countByUser
  };
}

module.exports = getFollowUpPerCloseRatioManager;
