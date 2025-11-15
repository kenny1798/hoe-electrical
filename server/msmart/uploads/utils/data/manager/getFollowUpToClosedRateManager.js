const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpToCloseRateManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Dapatkan semua username anak buah
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
  if (!allUsernames.length) return { total: 0, countByUser: {} };

  // Step 2: Dapatkan semua activity CLOSED
  const closedRows = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['edit', 'add'] },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    order: [['createdAt', 'DESC']],
    raw: true
  });

  if (!closedRows.length) return { total: 0, countByUser: {} };

  // Step 3: Group by user dan kira follow up sebelum closed
  const userStats = {};
  for (const row of closedRows) {
    const username = row.username;
    const leadId = row.msmartleadId;
    const closedAt = row.createdAt;

    const count = await msmart_structuredActivity.count({
      where: {
        username,
        msmartleadId: leadId,
        actionType: 'edit',
        followUpDate: { [Op.ne]: null },
        createdAt: { [Op.lt]: closedAt }
      }
    });

    if (!userStats[username]) {
      userStats[username] = {
        totalClosed: 0,
        totalFollowUpsBeforeClosed: 0
      };
    }

    userStats[username].totalClosed += 1;
    userStats[username].totalFollowUpsBeforeClosed += count;
  }

  // Step 4: Format result
  let totalFollowUps = 0;
  let totalClosed = 0;
  const countByUser = {};

  for (const [username, stat] of Object.entries(userStats)) {
    let  { totalClosed, totalFollowUpsBeforeClosed } = stat;
    const avg = totalClosed === 0 ? 0 : totalFollowUpsBeforeClosed / totalClosed;

    countByUser[username] = {
      totalFollowUpsBeforeClosed,
      totalClosed,
      averageFollowUpToCloseRate: Number(avg.toFixed(2))
    };

    totalFollowUps += totalFollowUpsBeforeClosed;
    totalClosed += totalClosed;
  }

  const overallRate = totalClosed === 0 ? 0 : totalFollowUps / totalClosed;

  return {
    total: Number(overallRate.toFixed(2)),
    countByUser
  };
}

module.exports = getFollowUpToCloseRateManager;
