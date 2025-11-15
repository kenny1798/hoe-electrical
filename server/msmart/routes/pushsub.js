const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");
const { push_subscription, Users, msmartleads } = require('../models');
const webpush = require('web-push');
const { validateToken } = require('../middlewares/AuthMiddleware');
const crypto = require('crypto');
const {sendFollowUpNotifications} = require('../utils/sendFollowUpNotifications');

webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  router.post('/save-subscription', validateToken, async (req, res) => {
    try {
      const { deviceId, subscription, fingerprint } = req.body;
      const username = req.user.username;
      const { endpoint, keys } = subscription;
  
      // Step 1: Generate fingerprint hash
      const hashSource = `${fingerprint.userAgent}|${fingerprint.platform}|${fingerprint.timezone}|${fingerprint.screen.width}x${fingerprint.screen.height}`;
      const deviceFingerprint = crypto.createHash('sha256').update(hashSource).digest('hex');
      
  
      let existingSub = null;
  
      // Step 2: Try match by deviceId
      if (deviceId) {
        existingSub = await push_subscription.findOne({
          where: { username: username, device_id: deviceId }
        });
      }
  
      // Step 3: Fallback to fingerprint match
      if (!existingSub) {
        existingSub = await push_subscription.findOne({
          where: { username: username, device_fingerprint: deviceFingerprint }
        });
      }
  
      // Step 4: Upsert logic
      if (existingSub) {
        await existingSub.update({
          endpoint,
          auth_key: keys.auth,
          p256dh_key: keys.p256dh,
          updatedAt: new Date()
        });
      } else {
        await push_subscription.create({
          username: username,
          device_id: deviceId || null,
          device_fingerprint: deviceFingerprint,
          endpoint,
          auth_key: keys.auth,
          p256dh_key: keys.p256dh,
        });
      }
  
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Error saving subscription:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/send-notification', async (req, res) => {
    const { username, title, body, url} = req.body;
  

    try {
      const subs = await push_subscription.findAll({ where: { username: username } });
      if (!subs.length) return res.status(404).json({ error: 'User not subscribed' });
  
      const payload = JSON.stringify({ title, body, url });
  
      for (const sub of subs) {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth_key,
            p256dh: sub.p256dh_key,
          },
        };
  
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (err) {
          console.error('❌ Failed to push:', err);
        }
      }

  
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/check-subscription', validateToken, async (req, res) => {

    try{
      const {endpoint } = req.body;
      const username = req.user.username;

      const existing = await push_subscription.findOne({
        where: {
          username: username,
          endpoint: endpoint
        }
      });

      res.json({ exists: !!existing });

    }catch (err) {
      console.error('❌ Error checking subscription:', err);
      res.status(500).json({ error: 'Server error' });
    }
  

  

  });

  router.post("/send-followup", async (req, res) => {
    try {
      const result = await sendFollowUpNotifications();
      res.json({ success: true, message: `Sent ${result.sent} follow-up notifications.` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
