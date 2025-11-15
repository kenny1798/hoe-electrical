const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getFollowUpPerCloseRatioTeam({ teamId, startDate, endDate }) {
  // Step 1: Get all team members (Member or Manager & Member)
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: { [Op.in]: ['Member', 'Manager & Member'] }
    },
    attributes: ['username'],
    raw: true
  });

  const usernames = members.map((m) => m.username);
  if (!usernames.length) return { total: 0, countByUser: {} };

  // Step 2: Get all 'Closed' structuredActivity logs
  const closedRows = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: usernames },
      statusAfter: 'Closed',
      actionType: { [Op.in]: ['edit', 'add'] },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    order: [['createdAt', 'DESC']],
    raw: true
  });

  if (!closedRows.length) return { total: 0, countByUser: {} };

  // Step 3: Group by user & calculate follow-ups before each closed
  const userStats = {};
  for (const row of closedRows) {
    const username = row.username;
    const leadId = row.msmartleadId;
    const closedAt = row.createdAt;

    const followUps = await msmart_structuredActivity.count({
      where: {
        username,
        msmartleadId: leadId,
        actionType: 'edit',
        followUpDate: { [Op.ne]: null },
        remarkChange: { [Op.ne]: null },
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
    userStats[username].totalFollowUpsBeforeClosed += followUps;
  }

  // Step 4: Format output
  let totalFollowUps = 0;
  let totalClosedLeads = 0;
  const countByUser = {};

  for (const [username, stat] of Object.entries(userStats)) {
    const avg = stat.totalClosed === 0 ? 0 : stat.totalFollowUpsBeforeClosed / stat.totalClosed;
    countByUser[username] = {
      totalFollowUpsBeforeClosed: stat.totalFollowUpsBeforeClosed,
      totalClosed: stat.totalClosed,
      averageFollowUpPerClosed: Number(avg.toFixed(2))
    };

    totalFollowUps += stat.totalFollowUpsBeforeClosed;
    totalClosedLeads += stat.totalClosed;
  }

  const overallRatio = totalClosedLeads === 0 ? 0 : totalFollowUps / totalClosedLeads;

  return {
    total: Number(overallRatio.toFixed(2)),
    countByUser
  };
}

module.exports = getFollowUpPerCloseRatioTeam;
