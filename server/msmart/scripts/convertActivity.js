// scripts/convertActivity.js
const { Sequelize, Op } = require('sequelize');
const { msmart_activity, msmart_structuredActivity } = require('../models');

function parseStructuredActivity(activityText) {
  const changes = [];

  const statusMatch = activityText.match(/updated status from (.+?) to (.+?)\./i);
  if (statusMatch) {
    changes.push({
      actionType: 'edit',
      statusBefore: statusMatch[1].trim(),
      statusAfter: statusMatch[2].trim()
    });
  }

  const followMatch = activityText.match(/updated follow up date on (.+?)\./i);
  if (followMatch) {
    const dateStr = followMatch[1].trim();
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate)) {
      changes.push({
        actionType: 'edit',
        followUpDate: parsedDate
      });
    }
  }

  if (/updated lead'?s? remark/i.test(activityText)) {
    changes.push({
      actionType: 'edit',
      remarkChange: true
    });
  }

  const addMatch = activityText.match(/added new database with status (.+?)$/i);
  if (addMatch) {
    changes.push({
      actionType: 'add',
      statusAfter: addMatch[1].trim()
    });
  }

  return changes;
}

async function convertActivityToStructured() {

  const allActivities = await msmart_activity.findAll({
    order: [['createdAt', 'ASC']],
  });

  let inserted = 0;

  for (const act of allActivities) {
    const changes = parseStructuredActivity(act.activity);
    for (const change of changes) {
      await msmart_structuredActivity.create({
        msmartleadId: act.msmartleadId,
        username: act.username,
        teamId: act.teamId,
        actionType: change.actionType,
        statusBefore: change.statusBefore || null,
        statusAfter: change.statusAfter || null,
        followUpDate: change.followUpDate || null,
        remarkChange: change.remarkChange || null,
        createdAt: act.createdAt, // maintain original time
        updatedAt: act.createdAt
      });
      inserted++;
    }
  }

  console.log(`✅ Done. Total structured rows inserted: ${inserted}`);
}

// Run script
convertActivityToStructured().catch((err) => {
  console.error("❌ Error:", err);
});
