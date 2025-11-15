const { Op } = require('sequelize');
const { msmart_structuredActivity, msmart_teamManager } = require('../../../models');

async function getAverageFollowUpPerLeadTeam({ teamId, startDate, endDate }) {
  // Step 1: Dapatkan semua user dalam team (position: Member or Manager & Member)
  const members = await msmart_teamManager.findAll({
    where: {
      teamId,
      position: {
        [Op.in]: ['Member', 'Manager & Member']
      }
    },
    attributes: ['username'],
    raw: true
  });

  const usernames = members.map(m => m.username);
  if (!usernames.length) return { total: 0, countByUser: {} };

  // Step 2: Dapatkan follow-up activities
  const activities = await msmart_structuredActivity.findAll({
    where: {
      username: { [Op.in]: usernames },
      actionType: 'edit',
      followUpDate: { [Op.ne]: null },
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    raw: true
  });

  if (!activities.length) return { total: 0, countByUser: {} };

  // Step 3: Kira follow-up dan lead count ikut user
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

module.exports = getAverageFollowUpPerLeadTeam;
