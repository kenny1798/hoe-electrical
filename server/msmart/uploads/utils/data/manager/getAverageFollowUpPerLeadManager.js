const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getAverageFollowUpPerLeadManager({ teamId, managerUsername, startDate, endDate }) {
  // Step 1: Get all anak buah bawah manager
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

  // Step 2: Ambil semua activity follow up
  const activities = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: allUsernames },
      actionType: 'edit',
      followUpDate: { [Op.ne]: null },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    raw: true
  });

  if (!activities.length) return { total: 0, countByUser: {} };

  // Step 3: Kira ikut user
  const countByUser = {};
  for (const row of activities) {
    const username = row.username;
    const leadId = row.msmartleadId;

    if (!countByUser[username]) {
      countByUser[username] = {
        leadSet: new Set(),
        followUpCount: 0
      };
    }

    countByUser[username].followUpCount += 1;
    countByUser[username].leadSet.add(leadId);
  }

  let totalFollowUps = 0;
  let totalLeads = 0;
  const outputByUser = {};

  for (const [username, data] of Object.entries(countByUser)) {
    const userFollowUps = data.followUpCount;
    const userLeads = data.leadSet.size;
    const avg = userLeads === 0 ? 0 : userFollowUps / userLeads;

    outputByUser[username] = {
      totalFollowUps: userFollowUps,
      totalLeads: userLeads,
      averageFollowUpPerLead: Number(avg.toFixed(2))
    };

    totalFollowUps += userFollowUps;
    totalLeads += userLeads;
  }

  const grandAverage = totalLeads === 0 ? 0 : totalFollowUps / totalLeads;

  return {
    total: Number(grandAverage.toFixed(2)),
    countByUser: outputByUser
  };
}

module.exports = getAverageFollowUpPerLeadManager;
