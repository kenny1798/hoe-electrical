const { Op, fn, col, where } = require("sequelize");
const { msmartleads, push_subscription, msmart_teamManager } = require("../models");
const webpush = require("web-push");

async function sendFollowUpNotifications() {
  const now = new Date();
  now.setUTCSeconds(0, 0); // clear seconds
  const oneMinLater = new Date(now.getTime() + 59 * 1000);

  const leads = await msmartleads.findAll({
    where: {
      followUpDate: {
        [Op.between]: [now, oneMinLater],
      }
    },
  });

  if (!leads.length) return { sent: 0 };

  const usernames = leads.map((lead) => lead.username);

  // Get all subscriptions for those usernames
  const subscriptions = await push_subscription.findAll({
    where: { username: { [Op.in]: usernames } },
  });

  // Group subscriptions per username
  const subMap = {};
  for (const sub of subscriptions) {
    if (!subMap[sub.username]) subMap[sub.username] = [];
    subMap[sub.username].push(sub);
  }

  const positions = await msmart_teamManager.findAll({
    where: { username: { [Op.in]: usernames } },
    attributes: ["username", "position", "teamId"],
  });

  const positionMap = {};
  for (const user of positions) {
    positionMap[user.username] = {
      position: user.position,
      teamId: user.teamId,
    };
  }

  let sentCount = 0;

  for (const lead of leads) {
    const userSubs = subMap[lead.username] || [];
    const userData = positionMap[lead.username];

    if (userSubs.length && userData) {
      const { position, teamId } = userData;
      const normalizedPosition = position.toLowerCase();

      const url = normalizedPosition === "manager" || normalizedPosition === "manager & member"
        ? `/msmart/manager/followup/${teamId}`
        : `/msmart/db/followup/${teamId}`;

      const payload = JSON.stringify({
        title: "Follow Up Reminder",
        body: "You have an upcoming follow up. Click to view details.",
        url,
      });

      for (const subData of userSubs) {
        const sub = {
          endpoint: subData.endpoint,
          keys: {
            auth: subData.auth_key,
            p256dh: subData.p256dh_key,
          },
        };

        try {
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (err) {
          console.error("❌ Failed to push:", err.message);

          if (err.statusCode === 410 || err.statusCode === 404) {
            await push_subscription.destroy({
              where: { endpoint: subData.endpoint }
            });
            console.log("🗑 Deleted invalid subscription:", subData.endpoint);
          }
        }
      }
    }
  }

  console.log(sentCount, "notifications sent");

  return { sent: sentCount };
}

module.exports = { sendFollowUpNotifications };
