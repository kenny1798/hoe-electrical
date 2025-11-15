const { msmart_structuredActivity, msmartleads, msmart_salesSubmit } = require('../models');
const { Op, Sequelize } = require('sequelize');

async function migrateClosedToSalesSubmit() {
  try {
    // Step 1: Ambil latest statusAfter = 'Closed' untuk setiap msmartleadId
    const latestClosedActivities = await msmart_structuredActivity.findAll({
      where: { statusAfter: 'Closed' },
      attributes: [
        [Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']
      ],
      group: ['msmartleadId'],
      raw: true
    });

    const maxIds = latestClosedActivities.map((item) => item.maxId);

    // Step 2: Ambil full structuredActivity rows based on maxIds
    const activityRecords = await msmart_structuredActivity.findAll({
      where: { id: { [Op.in]: maxIds } }
    });

    for (const act of activityRecords) {
      const lead = await msmartleads.findOne({
        where: { id: act.msmartleadId }
      });

      if (!lead) continue;

      // Step 3: Insert into msmart_salesSubmit
      // Step 3: Insert into msmart_salesSubmit
      await msmart_salesSubmit.create({
        username: act.username,
        teamId: act.teamId,
        msmartleadId: act.msmartleadId,
        repeatAmount: lead.salesAmount || 0,
        remarks: lead.remark || null,
        createdAt: act.createdAt,
        updatedAt: act.createdAt // 🛠️ set supaya sama
      });

      console.log(`Inserted salesSubmit for leadId ${act.msmartleadId}`);
    }

    console.log('✅ Migration complete!');
  } catch (err) {
    console.error('❌ Migration error:', err);
  }
}

migrateClosedToSalesSubmit();
