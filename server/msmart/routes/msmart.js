const express = require('express');
const router = express.Router();
const { msmart_team, msmart_structuredActivity, msmartleads, Users, msmart_teamManager, msmart_prospectingActivity, mu_course, mu_progress, Sequelize, msmart_salesTarget, msmart_salesSubmit, msmart_leadForm, msmart_leadFormSubmission, sequelize  } = require('../models');
const { validateToken, validateAdmin } = require('../middlewares/AuthMiddleware');
const {phoneFormat} = require('../middlewares/WhatsAppFormatter'); 
const { Op} = require('sequelize');
const bcrypt = require('bcrypt');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const { getTeamHierarchy } = require('../utils/functions/teamHelper');
const { 
  parsePhoneNumber, 
  excelSerialDateToJSDate, 
  combineDateTime 
} = require('../utils/functions/bulkUploadHelpers');

const getTotalLeadsAdded = require('../utils/data/individual/getTotalLeadsAdded');
const getTotalPresentations = require('../utils/data/individual/getTotalPresentations');
const getFollowUpScheduledCount = require('../utils/data/individual/getFollowUpScheduledCount');
const getFinalStatusCountInRange = require('../utils/data/individual/getFinalStatusCountInRange');
const getAverageFollowUpPerLead = require('../utils/data/individual/getAverageFollowUpPerLead');
const getFollowUpPerCloseRatio = require('../utils/data/individual/getFollowUpPerCloseRatio');
const getFollowUpToClosedRate = require('../utils/data/individual/getFollowUpToClosedRate');
const getFollowUpToRejectedRate = require('../utils/data/individual/getFollowUpToRejectedRate');
const getFollowUpToBookingRate = require('../utils/data/individual/getFollowUpToBookingRate');
const getBookingToClosedRate = require('../utils/data/individual/getBookingToClosedRate');
const getBookingToRejectedRate = require('../utils/data/individual/getBookingToRejectedRate');
const getSalesGapSummary = require('../utils/data/individual/getSalesGapSummary');

const getTotalLeadsAddedManager = require('../utils/data/manager/getTotalLeadsAddedManager');
const getTotalPresentationsManager = require('../utils/data/manager/getTotalPresentationsManager');
const getFollowUpScheduledCountManager = require('../utils/data/manager/getFollowUpScheduledCountManager');
const getFinalStatusCountInRangeManager = require('../utils/data/manager/getFinalStatusCountInRangeManager');
const getAverageFollowUpPerLeadManager = require('../utils/data/manager/getAverageFollowUpPerLeadManager');
const getFollowUpPerCloseRatioManager = require('../utils/data/manager/getFollowUpPerCloseRatioManager');
const getFollowUpToClosedRateManager = require('../utils/data/manager/getFollowUpToClosedRateManager');
const getFollowUpToRejectedRateManager = require('../utils/data/manager/getFollowUpToRejectedRateManager');
const getFollowUpToBookingRateManager = require('../utils/data/manager/getFollowUpToBookingRateManager');
const getBookingToClosedRateManager = require('../utils/data/manager/getBookingToClosedRateManager');
const getBookingToRejectedRateManager = require('../utils/data/manager/getBookingToRejectedRateManager');
const getSalesGapSummaryManager = require('../utils/data/manager/getSalesGapSummaryManager');

const getTotalLeadsAddedTeam = require('../utils/data/team/getTotalLeadsAddedTeam');
const getTotalPresentationsTeam = require('../utils/data/team/getTotalPresentationsTeam');
const getFollowUpScheduledCountTeam = require('../utils/data/team/getFollowUpScheduledCountTeam');
const getFinalStatusCountInRangeTeam = require('../utils/data/team/getFinalStatusCountInRangeTeam');
const getAverageFollowUpPerLeadTeam = require('../utils/data/team/getAverageFollowUpPerLeadTeam');
const getFollowUpPerCloseRatioTeam = require('../utils/data/team/getFollowUpPerCloseRatioTeam');
const getFollowUpToClosedRateTeam = require('../utils/data/team/getFollowUpToClosedRateTeam');
const getFollowUpToRejectedRateTeam = require('../utils/data/team/getFollowUpToRejectedRateTeam');
const getFollowUpToBookingRateTeam = require('../utils/data/team/getFollowUpToBookingRateTeam');
const getBookingToClosedRateTeam = require('../utils/data/team/getBookingToClosedRateTeam');
const getBookingToRejectedRateTeam = require('../utils/data/team/getBookingToRejectedRateTeam');
const getSalesGapSummaryTeam = require('../utils/data/team/getSalesGapSummaryTeam');

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-203a7df8cb364c748cd8fe883473478c'
});

const openai2 = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-dd1ac0dbec404e84a0da233911f08bb1'
});


const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/excel/'); // Folder untuk simpan fail sementara
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: multerStorage  });

const { storage } = require('../config/cloudinary');

const formImgUpload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, .webp allowed!'), false);
    }
  }
});


//Members

router.get('/get/courses', validateToken, async (req,res) => {
  try{
    const username = req.user.username;
    const getTeam = await msmart_teamManager.findOne({where: {username: username}});
    const teamid = await getTeam.teamId;
    const courses = await mu_course.findAll({where: {teamId:{[Op.in]: [0, parseInt(teamid, 10)]}}});
  res.status(201).json(courses);
  }catch(error){
    res.status(404).json({error:"Unable to access to database"})
    console.log(error)
  }
})

router.get('/leads/all/:teamName', validateToken, async (req,res) => {
  try{
  const username = req.user.username;
  const teamName = req.params.teamName;
  const listOfLeads = await msmartleads.findAll({where: {username:username, teamId: teamName}, order:[['updatedAt', 'DESC']]});

    res.status(201).json(listOfLeads);

  }catch(error){
    res.status(404).json({error:"Unable to access to database"})
    console.log(error)
  }
  

})

router.get('/lead/:id', validateToken, async (req,res) => {
  try{
  const lid = req.params.id;
  const username = req.user.username;
  const singleLead = await msmartleads.findOne({where: {username:username, id:lid}});
    res.status(201).json({db: singleLead});
  }catch(error){
    res.status(404).json({error:"Unable to access to database"})
    console.log(error)
  }
  

})

router.get('/sales/:msmartleadId', validateToken, async (req, res) => {
  const { msmartleadId } = req.params;
  const username = req.user.username;

  try {
    const records = await msmart_salesSubmit.findAll({
      where: { msmartleadId, username },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(records);
  } catch (err) {
    console.error('[SalesSubmit GET Error]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get/team/data/:teamName', validateToken, async (req,res) => {
const username = req.user.username;
const teamName = req.params.teamName;
let uploadDB = [];
let uploadDBarr = [];
let presentation = 0;
let followup = 0;
let prospecting = 0;
let presentationarr = [];
let followuparr = [];
let prospectingarr = [];

let addfb = 0;
let followtt = 0;
let savenum = 0;
let connect = 0;
let addfbarr = [];
let followttarr = [];
let savenumarr = [];
let connectarr = [];

let engfb = 0;
let engtt= 0;
let engws= 0;
let eng =0;
let engfbarr = [];
let engttarr= [];
let engwsarr= [];
let engarr = [];

let close = 0;
let book = 0;
let reject = 0;
let result = 0;
let closearr = [];
let bookarr = [];
let rejectarr = [];
let resultarr = [];

let members = [];

const getGroup = await msmart_teamManager.findOne({where:{username:username}});
const managerName = await getGroup.managerName;
const getMembers = await msmart_teamManager.findAll({where: {teamName: teamName, managerName: managerName, position:"Member"}, attributes:['username']});

getMembers.forEach(async(item) => {
  const users = item.dataValues.username;
  if(members.push(users)){
  }
})

for(var i = 0; i<members.length; i++){
  const member = members[i];

  let dbcount = 0;
  const getDB = await msmartleads.findAll({where: {username:member}});
  if(getDB){
    dbcount = await getDB.length
  }
  if(uploadDBarr.push(dbcount)){
  }

  let followupcount = 0;
  let presentcount = 0;
  const getfupres = await msmart_prospectingActivity.findOne({where:{username: member, teamName:teamName, day: process.env.DAY, week: process.env.WEEK, month: process.env.MONTH, year: process.env.YEAR}});
  if(getfupres){
    followupcount = await getfupres.followup;
    presentcount = await getfupres.presentation;
  }
  if(followuparr.push(followupcount)){}
  if(presentationarr.push(presentcount)){}

  let prospectingcount = 0;
}

for(var i=0; i<uploadDBarr.length; i++){
  uploadDB += uploadDBarr[i];
}

for(var i=0; i<followuparr.length; i++){
  followup += followuparr[i];
}

for(var i=0; i<presentationarr.length; i++){
  presentation += presentationarr[i];
}

res.json({uploadDB: uploadDB, followup: followup, presentation: presentation})
})

router.get('/get/team/all', validateToken, async (req,res) => {
  try{
  const username = req.user.username;
  const getTeam = await msmart_team.findAll({where: {username: username}});
  const getManager = await msmart_teamManager.findAll({where:{username:username, position: "Manager", isVerified:1}});
  const getMember = await msmart_teamManager.findAll({where: {username: username, position: "Member", isVerified: 1}});
  res.json({owner: getTeam, manager: getManager, member: getMember})
  }catch(error){
  res.json({error:"Failed to retrieve teams."})
  }
  
});

router.get('/get/team/list', validateToken, async (req,res) => {
  try{
  const getTeam = await msmart_team.findAll();
  res.json(getTeam)
  }catch(error){
  res.json({error:"Failed to retrieve teams."})
  }
  
})

router.get('/admin/get/team/list', validateAdmin, async (req,res) => {
  try{
  const getTeam = await msmart_team.findAll();
  res.json(getTeam)
  }catch(error){
  res.json({error:"Failed to retrieve teams."})
  }
  
})

router.get('/admin/get/team/manager/:id', validateAdmin, async (req,res) => {
  try{
    const id = req.params.id;
    const getManager = await msmart_teamManager.findAll({
      where: {
        teamId: id,
        position: {
          [Op.like]: '%Manager%' // Gunakan % untuk mencari substring
        }
      }
    })
  res.status(201).json(getManager);
  }catch(error){
  res.json({error:"Failed to retrieve teams."})
  }
  
})

router.get('/get/user/team', validateToken, async (req,res) => {
  try{

    const username = req.user.username;
    const getTeam = await msmart_teamManager.findOne({where: {username: username}});
    const teamId = await getTeam.teamId;
    const pos = await getTeam.position;

    res.status(201).json({teamId: teamId, pos: pos});
 
  
  }catch(error){
  res.status(400).json({error:"Failed to retrieve team."})
  }
  
})

router.get('/get/manager/list/:teamName', validateToken, async (req,res) => {
  try {
    const team = req.params.teamName;
    const managers = await msmart_teamManager.findAll({
      where: {
        teamId: team,
        [Op.or]: [ // Use Op.or to check for "Manager" OR "Owner"
          { position: { [Op.like]: '%Manager%' } },
          { position: { [Op.like]: '%Owner%' } }
        ],
        isVerified: 1
      }
    });
    res.json(managers);
  } catch (error) {
    res.json({ error: "Failed to retrieve managers." });
  }
})

router.get('/manager/get/team/member/:teamId', validateToken, async (req, res) => {
  const teamId = req.params.teamId;
  const username = req.user.username;

  try {
    // Langkah 1: Cari semua user yang dikawal secara langsung oleh Manager (user ini)
    const directMembers = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        managerUsername: username
      },
    });

    // Langkah 2: Kumpul semua username dari directMembers
    const directMemberUsernames = directMembers.map(member => member.username);

    // Langkah 3: Cari semua Member lain yang dikawal oleh "Manager & Member" dari directMembers
    const nestedMembers = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        managerUsername: {
          [Op.in]: directMemberUsernames, // Ambil semua username dari directMembers
        },
      },
    });

    // Gabungkan directMembers dan nestedMembers
    const allMembers = [...directMembers, ...nestedMembers];

    // Pastikan tiada duplikasi
    const uniqueMembers = Array.from(new Set(allMembers.map(member => member.username)))
      .map(username => allMembers.find(member => member.username === username));

    // Susun hasil berdasarkan 'position'
    const sortedMembers = uniqueMembers.sort((a, b) => {
      const positions = ['Owner', 'Manager', 'Manager & Member', 'Member']; // Susunan keutamaan posisi
      return positions.indexOf(a.position) - positions.indexOf(b.position);
    });

    res.json({ team: sortedMembers });
  } catch (err) {
    res.json({ err: 'Unable to retrieve team members' });
    console.log(err);
  }
});

router.post('/get/followup/:teamId', validateToken, async (req,res) => {
  const username = req.user.username;
  const teamId = req.params.teamId;
  const {startDate, endDate} = req.body;

  const endOfDate = new Date(endDate);
  endOfDate.setHours(23, 59, 59, 999);

  console.log(startDate, endDate);


  try{

    const followUpLeads = await msmartleads.findAll({
      where: {
        username: username,
        teamId: teamId,
        followUpDate: {
          [Op.between]: [startDate, endOfDate],
        },
      },
      order: [['followUpDate', 'ASC']], // Order by followUpDate ascending
    });

    res.status(201).json(followUpLeads);


  }catch(err){
    res.status(400).json({error: 'Unable to receive follow Ups'})
  }
    
  })

router.post('/manager/get/activity/:teamId', validateToken, async (req, res) => {

  function filterRapidActivities(logs, minutes = 5) {
    if (logs.length < 2) {
        return logs;
    }
  
    const TIME_WINDOW_MS = minutes * 60 * 1000;
    const filteredLogs = [];
  
    for (let i = 0; i < logs.length; i++) {
        const currentLog = logs[i];
        const nextLog = logs[i + 1];
  
        const isLastLog = !nextLog;
        const isDifferentLead = nextLog && nextLog.msmartleadId !== currentLog.msmartleadId;
        const isTimeGapTooBig = nextLog && (new Date(nextLog.createdAt) - new Date(currentLog.createdAt)) >= TIME_WINDOW_MS;
  
        if (isLastLog || isDifferentLead || isTimeGapTooBig) {
            filteredLogs.push(currentLog);
        }
    }
    return filteredLogs;
  }

  try {
      const { startDate, endDate } = req.body;
      const username = req.user.username;
      const { teamId } = req.params;
  
      if (!startDate || !endDate || !teamId) {
          return res.status(400).json({ error: 'selecteddate and teamId are required' });
      }
  
      const startOfDate = new Date(startDate);
      startOfDate.setHours(0, 0, 0, 0);
      const endOfDate = new Date(endDate);
      endOfDate.setHours(23, 59, 59, 999);
  
      // Andaian fungsi getTeamHierarchy ini berfungsi seperti yang dijangka
      const teams = await getTeamHierarchy(username, teamId);
      
      const teamMembers = teams.filter(m =>
          ['Manager & Member', 'Member'].includes(m.position)
      );
  
      if (!teamMembers.length) {
          return res.json([]);
      }
  
      async function enrichLeadsFromIds(logs) {
          if (!logs.length) return [];
          
          const leadIds = [...new Set(logs.map(l => l.msmartleadId))];
  
          const leadDetails = await msmartleads.findAll({
              where: { id: { [Op.in]: leadIds } }
          });
  
          const leadMap = new Map(leadDetails.map(lead => [lead.id, lead]));
  
          return logs.map(log => {
              const base = leadMap.get(log.msmartleadId) || {};
              return {
                  name: base.name || '',
                  phone: (base.phone && base.phone.length > 2) ? base.phone.slice(0, -2) + '**' : (base.phone || ''),
                  country: base.country || '',
                  status: base.status || log.statusAfter || log.statusBefore || 'N/A',
                  createdAt: log.createdAt,
                  updatedAt: base.updatedAt || log.createdAt
              };
          });
      }
  
      const results = await Promise.all(teamMembers.map(async (member) => {
          const memberUsername = member.username;
          const nameInTeam = member.nameInTeam;
  
          let createdLeads = await msmartleads.findAll({
              where: {
                  createdAt: { [Op.between]: [startOfDate, endOfDate] },
                  username: memberUsername,
              },
          });
  
          createdLeads = createdLeads.map(lead => ({
              name: lead.name,
              phone: (lead.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead.phone || ''),
              country: lead.country,
              status: lead.status || '',
              createdAt: lead.createdAt,
              updatedAt: lead.updatedAt
          }));
  
          const activityLogs = await msmart_structuredActivity.findAll({
              where: {
                  username: memberUsername,
                  createdAt: { [Op.between]: [startOfDate, endOfDate] },
                  actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
              },
              order: [['createdAt', 'ASC']], // KEMASKINI: Pastikan data tersusun ikut masa
              raw: true
          });
  
          // --- LOGIK PENAPISAN 5-MINIT YANG BARU ---
          const statusChangeLogs = [];
          const otherLogs = [];
          for (const log of activityLogs) {
              if (log.actionType === 'edit' && log.statusBefore !== log.statusAfter) {
                  statusChangeLogs.push(log);
              } else {
                  otherLogs.push(log);
              }
          }
          const filteredStatusChangeLogs = filterRapidActivities(statusChangeLogs);
          const finalActivityLogs = [...otherLogs, ...filteredStatusChangeLogs];
          // --- TAMAT LOGIK PENAPISAN ---

          const rawClosed = finalActivityLogs.filter(a => a.statusAfter === 'Closed');
          const rawBooking = finalActivityLogs.filter(a => a.statusAfter === 'Booking');
          const rawRejected = finalActivityLogs.filter(a => a.statusAfter === 'Rejected');
  
          // KEMASKINI: Logik 'Follow Up' yang lebih tepat
          const uniqueLogs = {};
          for (const log of finalActivityLogs) {
              const dateKey = new Date(new Date(log.createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
              const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
              const existing = uniqueLogs[key];
              if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
                  uniqueLogs[key] = log;
              }
          }
  
          const [closedLeads, bookingLeads, rejectedLeads, followUpLeads] = await Promise.all([
              enrichLeadsFromIds(rawClosed),
              enrichLeadsFromIds(rawBooking),
              enrichLeadsFromIds(rawRejected),
              enrichLeadsFromIds(Object.values(uniqueLogs))
          ]);
  
          return {
              username: memberUsername,
              nameInTeam,
              totalCreated: createdLeads.length,
              totalClosed: closedLeads.length,
              totalBooking: bookingLeads.length,
              totalRejected: rejectedLeads.length,
              totalFollowUp: followUpLeads.length,
              createdLeads,
              closedLeads,
              bookingLeads,
              rejectedLeads,
              followUpLeads,
          };
      }));
  
      res.json(results);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Unable to retrieve activity data', details: err.message });
  }
});
  
router.post('/manager/get/followup/:teamId', validateToken, async (req, res) => {
  const username = req.user.username;
  const teamId = req.params.teamId;
  const { startDate, endDate } = req.body;

  const startOfToday = `${startDate} 00:00:00`;
  const endOfToday = `${endDate} 23:59:59.999999`;

  try {
      // === Panggil fungsi dari utiliti ===
      const teams = await getTeamHierarchy(username, teamId);

      const members = teams.filter((member) =>
          ['Manager & Member', 'Member'].includes(member.position)
      );

      if (!members.length) {
          return res.status(404).json({ error: 'No team members found' });
      }

      // Dapatkan follow-up leads untuk setiap ahli pasukan
      let leadData = await Promise.all(
          members.map(async (member) => {
              const followUpLeads = await msmartleads.findAll({
                  where: {
                      username: member.username,
                      teamId: teamId,
                      followUpDate: {
                          [Op.between]: [startOfToday, endOfToday],
                      },
                  },
              });
              return followUpLeads; // Hasil untuk setiap ahli dalam bentuk array
          })
      );

      leadData = leadData.flat();

      leadData = leadData.map(lead => ({
          ...lead.toJSON(), // Convert Sequelize object to JSON
          phone: lead.phone.slice(0, -2) + '**' // Censor last 2 digits
      }));

      res.json({ team: members, lead: leadData });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Unable to receive follow Ups', details: err.message });
  }
});

router.get('/manager/get/leads/:teamId', validateToken, async (req,res) => {
  const teamId = req.params.teamId;
  const username = req.user.username;

  try {
      // === Panggil fungsi dari utiliti ===
      const teams = await getTeamHierarchy(username, teamId);

      const members = teams.filter((member) =>
          ['Manager & Member', 'Member'].includes(member.position)
      );

      if (!members.length) {
          return res.status(404).json({ error: 'No team members found' });
      }

      let leadData = await Promise.all(
          members.map(async (member) => {
              return await msmartleads.findAll({
                  where: {
                      username: member.username,
                      teamId: teamId,
                  },
              });
          })
      );

      // Flatten array kerana `leadData` adalah array dalam array
      leadData = leadData.flat();

      // Censor dua digit terakhir phoneNumber
      leadData = leadData.map(lead => ({
          ...lead.get({ plain: true }), // Gantikan `toJSON()` dengan `get({ plain: true })`
          phone: lead.phone.slice(0, -2) + '**' // Censor last 2 digits
      }));

      leadData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      res.status(201).json({ members: members, leads: leadData });

  } catch (err) {
      res.status(400).json({ err: 'Unable to receive leads' });
      console.log(err);
  }
});

router.put('/edit/followup/:teamId/:leadId', validateToken, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const leadId = parseInt(req.params.leadId, 10);
  const username = req.user.username;
  const { editedStatus, editedRemark, edittedFuDate, editClosedAmount } = req.body;

  try {
    const lead = await msmartleads.findOne({ where: { id: leadId } });
    const getTeam = await msmart_teamManager.findOne({ where: { username, teamId } });

    if (!lead || lead.username !== username) {
      return res.status(400).json({ error: 'Unauthorized User' });
    }

    const nameInTeam = getTeam.nameInTeam;
    const updates = {};
    const logs = [];

    // Check for each field change
    if (lead.status !== editedStatus) {
      updates.status = editedStatus;
      logs.push({
        actionType: 'edit',
        statusBefore: lead.status,
        statusAfter: editedStatus
      });
    }

    const prevSalesAmount = lead.salesAmount || 0;
    const newSalesAmount = parseFloat(editClosedAmount) || 0;

    if (prevSalesAmount !== newSalesAmount) {
      updates.salesAmount = newSalesAmount;
    }

    console.log(lead.remark, editedRemark);

    if (lead.remark !== editedRemark) {
      updates.remark = editedRemark;
      logs.push({
        actionType: 'edit',
        remarkChange: true
      });
    }

    const newFollowUpDate = edittedFuDate ? new Date(edittedFuDate) : null;
    const oldFollowUpDate = lead.followUpDate ? new Date(lead.followUpDate) : null;

    const isFollowUpChanged =
      (newFollowUpDate === null && lead.followUpDate !== null) ||
      (newFollowUpDate !== null && String(oldFollowUpDate) !== String(newFollowUpDate));

    if (isFollowUpChanged) {
      updates.followUpDate = newFollowUpDate;

      if (newFollowUpDate !== null) {
        logs.push({
          actionType: 'edit',
          followUpDate: newFollowUpDate
        });
      }
    }

    // Update the lead if there are changes
    if (Object.keys(updates).length > 0) {
      await msmartleads.update(updates, { where: { id: leadId } });

      for (const log of logs) {
        await msmart_structuredActivity.create({
          username,
          teamId,
          msmartleadId: leadId,
          actionType: log.actionType,
          statusBefore: log.statusBefore || null,
          statusAfter: log.statusAfter || null,
          followUpDate: log.followUpDate || null,
          remarkChange: log.remarkChange || null
        });
      }

      // Insert ke msmart_salesSubmit kalau sales amount berubah dan > 0
      if (newSalesAmount > 0 && newSalesAmount !== prevSalesAmount) {
        await msmart_salesSubmit.create({
          username,
          teamId,
          msmartleadId: leadId,
          repeatAmount: newSalesAmount,
          remarks: editedRemark,
          createdAt: new Date()
        });
      }
    }

    return res.status(201).json({ succ: 'Database updated successfully' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Unable to update follow up' });
  }
});

router.put('/manager/edit/remark/:teamId/:id', validateToken, async (req, res) => {
  const teamId = req.params.teamId;
  const id = req.params.id;
  const username = req.user.username;

  try {
      const { remark, updatedRemark } = req.body;

      const now = new Date();
      const formattedDate = now.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
      });

      const lead = await msmartleads.findOne({ where: { id: id, teamId: teamId } });
      if (!lead) {
          return res.status(404).json({ err: "Lead not found" });
      }

      const managerInfo = await msmart_teamManager.findOne({ where: { teamId: teamId, username: username } });
      if (!managerInfo) {
          return res.status(403).json({ err: "Unauthorized access: Not a manager" });
      }

      // === Panggil fungsi dari utiliti ===
      const teams = await getTeamHierarchy(username, teamId);
      const members = teams.filter((member) => ['Manager & Member', 'Member'].includes(member.position));
      const isAuthorized = members.some((member) => member.username === lead.username);

      if (!isAuthorized) {
          return res.status(401).json({ err: "Unauthorized access: unable to update remark" });
      }

      let newRemark;
      const updatedByPattern = /----\n([\s\S]*?)\nUpdated by: .+\n----/;

      if (updatedByPattern.test(lead.remark)) {
          newRemark = lead.remark.replace(updatedByPattern, 
              `----\n${updatedRemark}\n\nUpdated by: ${managerInfo.nameInTeam} (${formattedDate})\n----`
          );
      } else {
          newRemark = `${lead.remark}\n\n----\n${updatedRemark}\n\nUpdated by: ${managerInfo.nameInTeam} (${formattedDate})\n----`;
      }

      await msmartleads.update(
          { remark: newRemark },
          { where: { id: id, teamId: teamId }, silent: true }
      );

      res.status(200).json({ succ: 'Successfully updated remark' });

  } catch (err) {
      console.error(err);
      res.status(500).json({ err: 'Unable to update lead', details: err.message });
  }
});

router.get('/supermanager/get/team/member/:teamId', validateToken, async (req,res) => {
  const teamId = req.params.teamId;
  try{

    const members = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        position: {
          [Op.like]: '%Member%'
        }
      },
      order: [['position', 'ASC'],
              ['managerUsername', 'ASC']] // Sort by position in ascending order
    });

    const managers = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        [Op.or]: [ // Use Op.or to check for "Manager" OR "Owner"
          { position: { [Op.like]: '%Manager%' } },
          { position: { [Op.like]: '%Owner%' } }
        ]
      },
      order: [['position', 'ASC']], // Optional: Sort by position in ascending order
    });

    const manager = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        position: {
          [Op.or]: [
            { [Op.like]: '%Manager%' },
            { [Op.like]: '%Owner%' }
          ]
        }
      },
      order: [['position', 'ASC']], // Optional: Sort by position in ascending order
    });
    

    res.json({team: members, manager: managers});

  }catch(err){
    res.json({err: 'Unable to receive members'})
    console.log(err)
  }
})

router.get('/supermanager/get/team/manager/:teamId', validateToken, async (req,res) => {
  const teamId = req.params.teamId;

  try{

    const members = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
        position: {
          [Op.like]: '%Manager%'
        }
      },
      order: [['position', 'ASC']] // Sort by position in ascending order
    });

    res.json({team: members});

  }catch(err){
    res.json({err: 'Unable to receive members'})
    console.log(err)
  }
})

router.get('/supermanager/get/all/team/member/:teamId', validateToken, async (req,res) => {
  const teamId = req.params.teamId;
  try{

    const members = await msmart_teamManager.findAll({
      where: {
        teamId: teamId,
      },
      order: [['position', 'ASC'],
              ['managerUsername', 'ASC']]
    });

    res.json({team: members});

  }catch(err){
    res.json({err: 'Unable to receive members'})
    console.log(err)
  }
})

router.put('/supermanager/update/member/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const { position, managerUsername } = req.body;

  try {
    let managerName = null;

    // If ada manager, fetch managerName
    if (managerUsername) {
      const manager = await msmart_teamManager.findOne({ where: { username: managerUsername } });
      if (!manager) {
        return res.status(400).json({ err: 'Manager not found' });
      }
      managerName = manager.nameInTeam;
    }

    await msmart_teamManager.update(
      { position, managerUsername, managerName },
      { where: { id } }
    );

    res.json({ succ: 'Member updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Failed to update member' });
  }
});

router.post('/supermanager/get/activity/:teamId', validateToken, async (req, res) => {

  function filterRapidActivities(logs, minutes = 5) {
    if (logs.length < 2) {
        return logs;
    }
  
    const TIME_WINDOW_MS = minutes * 60 * 1000;
    const filteredLogs = [];
  
    for (let i = 0; i < logs.length; i++) {
        const currentLog = logs[i];
        const nextLog = logs[i + 1];
  
        const isLastLog = !nextLog;
        const isDifferentLead = nextLog && nextLog.msmartleadId !== currentLog.msmartleadId;
        const isTimeGapTooBig = nextLog && (new Date(nextLog.createdAt) - new Date(currentLog.createdAt)) >= TIME_WINDOW_MS;
  
        if (isLastLog || isDifferentLead || isTimeGapTooBig) {
            filteredLogs.push(currentLog);
        }
    }
    return filteredLogs;
  }

  try {
      const { startDate, endDate } = req.body;
      const { teamId } = req.params;

      if (!startDate || !endDate || !teamId) {
          return res.status(400).json({ error: 'selected date and teamId are required' });
      }

      const startOfDate = new Date(startDate);
      startOfDate.setHours(0, 0, 0, 0);
      const endOfDate = new Date(endDate);
      endOfDate.setHours(23, 59, 59, 999);

      const teamMembers = await msmart_teamManager.findAll({
          where: {
              teamId,
              position: { [Op.in]: ['Member', 'Manager & Member'] },
          },
      });

      if (!teamMembers.length) {
          return res.status(404).json({ error: 'No team members found' });
      }
      
      // --- OPTIMISASI: Ambil data pengurus sekali sahaja ---
      const managers = await msmart_teamManager.findAll({ where: { teamId } });
      const managerMap = new Map(managers.map(m => [m.username, m.nameInTeam]));
      
      // Helper function dalam skop route
      async function enrichLeadsFromIds(logs) {
          if (!logs.length) return [];
          const leadIds = [...new Set(logs.map(log => log.msmartleadId))];
          const leads = await msmartleads.findAll({ where: { id: { [Op.in]: leadIds } } });
          const leadMap = new Map(leads.map(lead => [lead.id, lead]));

          return logs.map(log => {
              const lead = leadMap.get(log.msmartleadId) || {};
              return {
                  name: lead.name || '',
                  phone: (lead.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead.phone || ''),
                  country: lead.country || '',
                  status: lead.status || log.statusAfter || log.statusBefore || 'N/A',
                  createdAt: log.createdAt,
                  updatedAt: lead.updatedAt || log.createdAt
              };
          });
      }

      const results = await Promise.all(teamMembers.map(async (member) => {
          const memberUsername = member.username;
          const nameInTeam = member.nameInTeam;
          const managerNameInTeam = managerMap.get(member.managerUsername) || null;

          let createdLeads = await msmartleads.findAll({
              where: {
                  username: memberUsername,
                  createdAt: { [Op.between]: [startOfDate, endOfDate] }
              },
          });

          createdLeads = createdLeads.map(lead => ({
              name: lead.name,
              phone: (lead.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead.phone || ''),
              country: lead.country,
              status: lead.status || '',
              createdAt: lead.createdAt,
              updatedAt: lead.updatedAt
          }));

          const activityLogs = await msmart_structuredActivity.findAll({
              where: {
                  username: memberUsername,
                  createdAt: { [Op.between]: [startOfDate, endOfDate] },
                  actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
              },
              order: [['createdAt', 'ASC']],
              raw: true
          });

          // --- LOGIK PENAPISAN 5-MINIT YANG BARU ---
          const statusChangeLogs = [];
          const otherLogs = [];
          for (const log of activityLogs) {
              if (log.actionType === 'edit' && log.statusBefore !== log.statusAfter) {
                  statusChangeLogs.push(log);
              } else {
                  otherLogs.push(log);
              }
          }
          const filteredStatusChangeLogs = filterRapidActivities(statusChangeLogs);
          const finalActivityLogs = [...otherLogs, ...filteredStatusChangeLogs];
          // --- TAMAT LOGIK PENAPISAN ---

          const rawClosedLogs = finalActivityLogs.filter(a => a.statusAfter === 'Closed');
          const rawBookingLogs = finalActivityLogs.filter(a => a.statusAfter === 'Booking');
          const rawRejectedLogs = finalActivityLogs.filter(a => a.statusAfter === 'Rejected');

          const uniqueLogs = {};
          for (const log of finalActivityLogs) { // Guna 'finalActivityLogs'
              const dateKey = new Date(new Date(log.createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
              const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
              const existing = uniqueLogs[key];
              if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
                  uniqueLogs[key] = log;
              }
          }

          const [closedLeads, bookingLeads, rejectedLeads, followUpLeads] = await Promise.all([
              enrichLeadsFromIds(rawClosedLogs),
              enrichLeadsFromIds(rawBookingLogs),
              enrichLeadsFromIds(rawRejectedLogs),
              enrichLeadsFromIds(Object.values(uniqueLogs))
          ]);

          return {
              username: memberUsername,
              nameInTeam,
              managerNameInTeam,
              totalCreated: createdLeads.length,
              totalClosed: closedLeads.length,
              totalBooking: bookingLeads.length,
              totalRejected: rejectedLeads.length,
              totalFollowUp: followUpLeads.length,
              createdLeads,
              closedLeads,
              bookingLeads,
              rejectedLeads,
              followUpLeads
          };
      }));

      return res.json(results);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Unable to retrieve activity data', details: err.message });
  }
});

router.post('/supermanager/get/followup/:teamId', validateToken, async (req,res) => {
  const teamId = req.params.teamId;
  const {startDate, endDate} = req.body;
  let leadData = [];

  const startOfToday = startDate + ' 00:00:00'
  const endOfToday = endDate + ' 23:59:59.999999'

  try{

    const members = await msmart_teamManager.findAll({where: {teamId: teamId}});



      let followUpLeads = await msmartleads.findAll({where: {teamId: teamId, followUpDate: {
        [Op.between]: [startOfToday, endOfToday]
      }}});

      followUpLeads = followUpLeads.map(lead => ({
        ...lead.toJSON(), // Convert Sequelize object to JSON
        phone: lead.phone.slice(0, -2) + '**' // Censor last 2 digits
      }));

    res.json({team: members, lead: followUpLeads});

  }catch(err){
    res.json({err: 'Unable to receive follow Ups'})
    console.log(err)
  }
})

router.get('/supermanager/get/leads/:teamId', validateToken, async (req,res) => {
  
  const teamId = req.params.teamId;

  try {
    const members = await msmart_teamManager.findAll({ where: { teamId: teamId } });

    let leads = await msmartleads.findAll({ 
      where: { teamId: teamId },
      order: [['updatedAt', 'DESC']] // Sort by updatedAt descending (latest first)
    });

    // Censor dua digit terakhir phoneNumber
    leads = leads.map(lead => ({
      ...lead.toJSON(), // Convert Sequelize object to JSON
      phone: lead.phone
    }));

    res.status(201).json({ members: members, leads: leads });

  } catch (err) {
    res.status(400).json({ err: 'Unable to receive leads' });
    console.log(err);
  }
});

router.put('/supermanager/edit/remark/:teamId/:id', validateToken, async (req, res) => {
  
  const teamId = req.params.teamId;
  const id = req.params.id;
  const username = req.user.username;

  

  try {
    const { remark, updatedRemark } = req.body;

    const now = new Date();
    const formattedDate = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }); 

    // Check existing remark dalam database
    const lead = await msmartleads.findOne({ where: { id: id, teamId: teamId } });
    const managerName = await msmart_teamManager.findOne({ where: { teamId: teamId, username: username } });

    if (!lead) {
      return res.status(404).json({ err: "Lead not found" });
    }

    let newRemark;

    if (/Updated by: .+/.test(lead.remark)) {
      // Jika "Updated by:" sudah ada, replace remark manager sahaja
      newRemark = lead.remark.replace(/----\n([\s\S]*?)\nUpdated by: .+\n----/, `----\n${updatedRemark}\n\nUpdated by: ${managerName.nameInTeam} (${formattedDate})\n----`);
    } else {
      // Jika "Updated by:" tiada, tambah remark baru dengan format standard
      newRemark = `${lead.remark}\n\n----\n${updatedRemark}\n\nUpdated by: ${managerName.nameInTeam} (${formattedDate})\n----`;
    }

    await msmartleads.update(
      { remark: newRemark }, // Data yang dikemaskini
      { where: { id: id, teamId: teamId }, silent: true } // `silent: true` untuk kekalkan `updatedAt`
    );

    res.status(201).json({ succ: 'Successfully updated remark' });

  } catch (err) {
    res.status(400).json({ err: 'Unable to update lead' });
    console.log(err);
  }
});

router.get('/manager/get/member/:teamId', validateToken, async (req,res) => {

})

router.get('/manager/get/all/leads/:teamName', validateToken, async (req,res) => {
  try{
      const username = req.user.username;
      const teamName = req.params.teamName; // Ini sepatutnya teamId

      // 1. Dapatkan senarai ahli bawah manager
      const getTeam = await msmart_teamManager.findAll({
          where: {
              managerUsername: username, 
              position: { [Op.like]: '%Member%' }
          }
      });
      
      const memberUsernames = getTeam.map(member => member.username);

      if (memberUsernames.length === 0) {
          return res.json([]);
      }

      // Perubahan di sini: Ganti keseluruhan loop dengan satu query
      // ----------------------------------------------------------
      const teamleads = await msmartleads.findAll({
          where: {
              username: { [Op.in]: memberUsernames },
              teamId: teamName // Pastikan ni ID, bukan nama
          }
      });

      res.json(teamleads);
      // ----------------------------------------------------------

  } catch(err){
      console.log(err)
      res.status(500).json({ error: 'Failed to retrieve team leads' });
  }
});

router.post('/lead', validateToken, async (req, res) => {
  const username = req.user.username;
  const { name, team, country, phone, status, remarks, followUp, salesAmount } = req.body;

  try {
      if (!name || !country || !phone || !status) {
          return res.status(400).json({ error: "Lead's details are required" });
      }

      const teamIdInt = parseInt(team, 10); // Use a variable to avoid repeating parseInt

      // -------------------------------------------------------------------
      // ADDED SECTION: Check for Duplicate Phone Number
      // -------------------------------------------------------------------
      const existingLead = await msmartleads.findOne({
          where: {
              phone: phone,
              username: username,
              teamId: teamIdInt
          }
      });

      // If a duplicate is found, send an error and stop execution
      if (existingLead) {
          return res.status(409).json({ error: 'This phone number already exists in your list.' });
      }
      // -------------------------------------------------------------------
      // END OF NEW SECTION
      // -------------------------------------------------------------------

      const getTeam = await msmart_teamManager.findOne({
          where: { username, teamId: teamIdInt }
      });

      // Add a check in case the user does not exist in the selected team
      if (!getTeam) {
          return res.status(403).json({ error: "You do not have access to this team." });
      }

      const fuDate = followUp === '' ? null : new Date(followUp);
      const salesAmt = salesAmount === '' ? null : parseFloat(salesAmount);

      const newLead = await msmartleads.create({
          username,
          teamId: teamIdInt,
          name,
          country,
          phone,
          status,
          remark: remarks,
          followUpDate: fuDate,
          salesAmount: salesAmt
      });

      if (salesAmt && !isNaN(salesAmt) && salesAmt > 0) {
          await msmart_salesSubmit.create({
              username,
              teamId: teamIdInt,
              msmartleadId: newLead.id,
              repeatAmount: salesAmt,
              remarks: remarks,
          });
      }
      
      await msmart_structuredActivity.create({
          username,
          teamId: teamIdInt,
          msmartleadId: newLead.id,
          actionType: 'add',
          statusAfter: status,
          followUpDate: status === 'Follow Up' && fuDate ? fuDate : null
      });

      return res.status(201).json({ status: 'Contact saved successfully' });

  } catch (err) {
      console.log(err);
      // Changed 404 to 500, which is more suitable for a general server error
      return res.status(500).json({ error: "Unable to save contact" });
  }
});

router.post('/bulk-upload/leads', validateToken, upload.single('file'), async (req, res) => {
  try {
      const username = req.user.username;
      const { teamId } = req.body;
      const teamIdInt = parseInt(teamId, 10);

      if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // (Fungsi helper macam combineDateTime & excelSerialDateToJSDate kekal sama)
      function excelSerialDateToJSDate(serial) { /* ... same as before ... */ }
      function combineDateTime(dateStr, timeStr) { /* ... same as before ... */ }

      const validStatuses = ['Closed', 'Booking', 'Rejected', 'Follow Up', 'No Status'];

      // Map all data from sheet first, without filtering
      const allLeadsFromSheet = sheetData.map((row) => {
          if (!row.phone_number || !/^\d+$/.test(row.phone_number.toString())) {
              return null;
          }
          let phone = row.phone_number.toString();
          if (phone.startsWith('0')) phone = phone.slice(1);
          const country = row.country_code && /^[+]?\d+$/.test(row.country_code) ? row.country_code : '60';
          let status = (row.status && validStatuses.includes(row.status)) ? row.status : 'No Status';
          let followUpDate = (row['followUpDate'] && row['followUpTime']) ? combineDateTime(excelSerialDateToJSDate(row['followUpDate']), row['followUpTime']) : null;

          return {
              username: username,
              teamId: teamIdInt,
              name: row.name || 'Bulk Upload',
              country: country,
              phone: phone,
              status: status,
              remark: row.remark || '',
              followUpDate: followUpDate,
          };
      }).filter(item => item !== null);

      // --- NEW LOGIC TO HANDLE DUPLICATES ---

      // Step 1: Extract all phone numbers from the uploaded sheet.
      const phoneNumbersFromSheet = allLeadsFromSheet.map(lead => lead.phone);

      // Step 2: Check which of these numbers already exist in the database for this user and team.
      const existingLeads = await msmartleads.findAll({
          where: {
              username: username,
              teamId: teamIdInt,
              phone: {
                  [Op.in]: phoneNumbersFromSheet
              }
          },
          attributes: ['phone'] // We only need the phone number for comparison
      });
      const existingPhones = new Set(existingLeads.map(lead => lead.phone));

      // Step 3: Filter out the leads that are duplicates.
      const newLeads = allLeadsFromSheet.filter(lead => !existingPhones.has(lead.phone));
      
      // --- END OF NEW LOGIC ---
      
      let report = {
          totalInFile: allLeadsFromSheet.length,
          successfullyAdded: 0,
          skippedDuplicates: 0,
          message: "No new leads to add."
      };

      if (newLeads.length > 0) {
          // Masukkan HANYA data yang baru ke database
          const insertedLeads = await msmartleads.bulkCreate(newLeads, { returning: true });

          // Masukkan activity untuk setiap lead yang BARU dimasukkan
          await Promise.all(
              insertedLeads.map((lead) =>
                  msmart_structuredActivity.create({
                      username: username,
                      teamId: teamIdInt,
                      msmartleadId: lead.id,
                      actionType: 'add',
                      statusAfter: lead.status,
                      followUpDate: lead.status === 'Follow Up' && lead.followUpDate ? lead.followUpDate : null
                  })
              )
          );

          report.successfullyAdded = insertedLeads.length;
          report.skippedDuplicates = allLeadsFromSheet.length - insertedLeads.length;
          report.message = `Upload complete. ${report.successfullyAdded} leads added, ${report.skippedDuplicates} duplicates skipped.`;
      } else {
          // Handle case where all leads in the file were duplicates
          report.skippedDuplicates = allLeadsFromSheet.length;
      }

      // Delete file selepas upload
      fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete uploaded file:', err);
      });

      res.status(201).json(report);

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to upload leads' });
  }
});

router.post('/bulk-upload/get-headers', validateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Baca baris pertama sahaja untuk dapatkan header
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      
      fs.unlink(req.file.path, () => {}); // Padam fail sementara
      
      res.json({ headers });
  } catch (error) {
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ error: 'Could not read file headers.' });
  }
});

router.post('/bulk-upload/analyze', validateToken, upload.single('file'), async (req, res) => {
  const { username } = req.user;
  const { teamId, mode, mapping } = req.body;

  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
      let fieldMapping;
      if (mode === 'easy') {
          fieldMapping = {
              name: 'name',
              phone_number_full: 'phone_number_full',
              status: 'status',
              remark: 'remark',
              followUpDate: 'followUpDate',
              followUpTime: 'followUpTime'
          };
      } else {
          fieldMapping = JSON.parse(mapping);
      }
      
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

      // Langkah 1: Semak Duplicate Dalam Fail Itu Sendiri
      const seenPhonesInFile = new Set();
      sheetData.forEach(row => {
          let phoneInput = fieldMapping.phone ? 
              { phone: row[fieldMapping.phone], country: row[fieldMapping.country] } : 
              { full_phone_number: row[fieldMapping.phone_number_full] };
          
          const { phone } = parsePhoneNumber(phoneInput);
          if (phone && seenPhonesInFile.has(phone)) {
              row._isInternalDuplicate = true;
          } else if (phone) {
              seenPhonesInFile.add(phone);
          }
      });

      // Langkah 2: Banding dengan Database
      const phoneNumbersFromSheet = Array.from(seenPhonesInFile);
      const existingLeads = await msmartleads.findAll({ where: { username, teamId, phone: { [Op.in]: phoneNumbersFromSheet } } });
      const existingLeadsMap = new Map(existingLeads.map(lead => [lead.phone, lead.toJSON()]));
      
      // Langkah 3: Proses Setiap Baris untuk Preview
      const validStatuses = ['Closed', 'Booking', 'Rejected', 'Follow Up', 'No Status'];
      const previewData = sheetData.map((row, index) => {
          let rowAnalysis = { id: index, status: '', newData: {}, originalData: null, errorReason: '' };

          if (row._isInternalDuplicate) {
              rowAnalysis.status = 'error';
              rowAnalysis.errorReason = 'Duplicate phone number found within the uploaded file itself.';
              rowAnalysis.newData = {
                  name: row[fieldMapping.name] || '', phone: 'DUPLICATE IN FILE', country: '-',
                  status: row[fieldMapping.status] || 'No Status', remark: row[fieldMapping.remark] || '',
              };
              return rowAnalysis;
          }

          let phoneInput = fieldMapping.phone ? 
              { phone: row[fieldMapping.phone], country: row[fieldMapping.country] } : 
              { full_phone_number: row[fieldMapping.phone_number_full] };
          
          const { country, phone } = parsePhoneNumber(phoneInput);

          if (!phone) {
              rowAnalysis.status = 'error';
              rowAnalysis.errorReason = 'Invalid format or could not detect a valid country code.';
              rowAnalysis.newData = {
                  name: row[fieldMapping.name] || '',
                  country: 'N/A', phone: phoneInput.full_phone_number || phoneInput.phone || '[INVALID]',
                  status: row[fieldMapping.status] || 'No Status', remark: row[fieldMapping.remark] || '', followUpDate: null
              };
              return rowAnalysis;
          }

          let combinedFollowUpDate = null;
          const excelDate = row[fieldMapping.followUpDate];
          const excelTime = row[fieldMapping.followUpTime];

          if (excelDate) {
              try {
                  const jsDate = excelSerialDateToJSDate(Number(excelDate));
                  combinedFollowUpDate = combineDateTime(jsDate, excelTime);
              } catch (e) { /* Biar null */ }
          }

          const leadData = {
              name: row[fieldMapping.name] || 'Bulk Upload', country, phone,
              status: (row[fieldMapping.status] && validStatuses.includes(row[fieldMapping.status])) ? row[fieldMapping.status] : 'No Status',
              remark: row[fieldMapping.remark] || '', followUpDate: combinedFollowUpDate
          };
          rowAnalysis.newData = leadData;

          if (existingLeadsMap.has(phone)) {
              rowAnalysis.status = 'duplicate';
              rowAnalysis.originalData = existingLeadsMap.get(phone);
          } else {
              rowAnalysis.status = 'new';
          }
          
          return rowAnalysis;
      });

      fs.unlink(req.file.path, () => {});
      res.json({ previewData });

  } catch (error) {
      console.error("Analysis Error:", error);
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ error: 'Failed to analyze file.' });
  }
});

router.post('/bulk-upload/execute', validateToken, async (req, res) => {
  const { username } = req.user;
  const { teamId, leadsToProcess } = req.body;

  const leadsToCreate = [];
  const leadsToUpdate = [];
  let skippedCount = 0;

  for (const lead of leadsToProcess) {
      if (lead.action === 'create') {
          leadsToCreate.push({ ...lead.data, username, teamId });
      } else if (lead.action === 'update') {
          leadsToUpdate.push(lead);
      } else {
          skippedCount++;
      }
  }
  
  const t = await sequelize.transaction();
  try {
      const createdLeads = await msmartleads.bulkCreate(leadsToCreate, { transaction: t, returning: true });

      await Promise.all(createdLeads.map(lead => 
          msmart_structuredActivity.create({
              username, teamId, msmartleadId: lead.id, actionType: 'add', statusAfter: lead.status
          }, { transaction: t })
      ));

      for (const lead of leadsToUpdate) {
          await msmartleads.update(
              lead.data,
              { where: { id: lead.originalData.id }, transaction: t }
          );
          await msmart_structuredActivity.create({
              username, teamId, msmartleadId: lead.originalData.id,
              actionType: 'update', statusBefore: lead.originalData.status, statusAfter: lead.data.status,
              details: 'Updated via bulk upload.'
          }, { transaction: t });
      }

      await t.commit();
      
      res.status(201).json({
          message: 'Upload process completed successfully.',
          successfullyAdded: createdLeads.length,
          successfullyUpdated: leadsToUpdate.length,
          skipped: skippedCount
      });

  } catch (error) {
      await t.rollback();
      console.error("Execution Error:", error);
      res.status(500).json({ error: 'Failed to save data to database.' });
  }
});

router.post('/repeat-sale/:teamId/:leadId', validateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const teamId = req.params.teamId;
    const leadId = req.params.leadId;
    const {repeatAmount, remarks } = req.body;

    if (!username || !teamId || !repeatAmount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // 1. Simpan dalam salesRepeat table
    const newRepeat = await msmart_salesSubmit.create({
      username,
      teamId,
      repeatAmount,
      msmartleadId: leadId,
      remarks,
    });

    // 2. Rekod dalam structuredActivity
    await msmart_structuredActivity.create({
      username,
      teamId,
      msmartleadId: leadId,
      actionType: 'repeat',
      statusBefore: 'Closed',
      statusAfter: 'Closed',
    });

    return res.status(201).json({ message: 'Sales repeat recorded successfully', data: newRepeat });
  } catch (error) {
    console.error('[SalesRepeat POST Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/join/team',validateToken, async (req,res) => {
  try{
    const username = req.user.username;
    const {managerName, yourName, teamName} = req.body;
    const checkTeam = await msmart_team.findOne({where: {id:teamName}});
    const checkManager = await msmart_teamManager.findOne({where: {teamId:teamName, managerName:managerName}});
    const checkData = await msmart_teamManager.findOne({where: {username:username, teamId:teamName, managerName:managerName}});
    const getManagerUname = await msmart_teamManager.findOne({where: {teamId:teamName, managerName:managerName, position:'Manager'}});
    const ManagerUname = await getManagerUname.username;
    if(!checkTeam){
      return res.json({error: "Selected team does not exist"})
    }
    else if(!checkManager){
      return res.json({error: "Selected manager does not exist"})
    }
    else if(checkTeam && !teamName){
     return res.json({error: "Please select a team"});
    }
    else if(teamName === 'Select Team..' || !teamName){
      return res.json({error: "Please select a team"});
    }
    else if(!managerName || managerName === 'Select Manager..'){
      return res.json({error: "Please select a manager"});
    }
    else if(!yourName){
      return res.json({error: "Your name cannot be blank"});
    }
    else if(checkData){
      return res.json({error: "You already submitted application to this team and manager."});
    }
    else{
      await msmart_teamManager.create({
        username: username,
        nameInTeam: yourName,
        teamId: teamName,
        managerName: managerName,
        managerUsername: ManagerUname,
        position: 'Member',
        isVerified: 0
      }).then(() => {
        return res.json({succMsg: `Your application to join ${checkTeam.teamName} under ${managerName} recorded successfully`});
      }).catch((error) => {
        return res.json({error: 'Unable to join team. Please try again.'});
      });
    }
    

  }catch(error){
    console.log(error)
    return res.json({error: 'Unable to join team as Manager. Please try again.'});
  }

})

router.post('/join/manager', validateToken, async (req,res) => {
  try{
    const username = req.user.username;
    const {managerName, yourName, teamId} = req.body;
    const checkTeam = await msmart_team.findOne({where: {id:teamId}});
    const checkName = await msmart_teamManager.findOne({where: {teamId:teamId, managerName:managerName}});
    const checkData = await msmart_teamManager.findOne({where: {username:username, teamId:teamId}});
    if(checkTeam && !teamId){
     return res.json({error: "Please select a team"});
    }else if(!managerName){
      return res.json({error: "Group name cannot be blank"});
    }else if(!yourName){
      return res.json({error: "Your name cannot be blank"});
    }else if(checkName){
      return res.json({error: "Group already exist in this team"});
    }else if(checkData){
      return res.json({error: "You already submitted manager application to this team"});
    }
    else{
      await msmart_teamManager.create({
        username: username,
        nameInTeam: yourName,
        teamId: teamId,
        managerName: managerName,
        managerUsername: username,
        position: 'Manager',
        isVerified: 0
      }).then(() => {
        return res.json({succMsg: 'Successfully join team as Manager'});
      }).catch((error) => {
        return res.json({error: 'Unable to join team as Manager. Please try again.'});
      });
    }
    

  }catch(error){
    console.log(error)
    return res.json({error: 'Unable to join team as Manager. Please try again.'});
  }


})

router.put('/lead/:teamName/:id', validateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const id = req.params.id;
    const teamId = parseInt(req.params.teamName, 10); // better rename var ni, tapi kekal ikut request
    const { name, country, phone, status, remark, followUp, salesAmount } = req.body;

    if (!name || !country || !phone || !status) {
      return res.status(400).json({ error: "Lead details are required" });
    }

    const getTeam = await msmart_teamManager.findOne({
      where: { username, teamId }
    });

    const nameInTeam = getTeam?.nameInTeam || 'Unknown';
    const lead = await msmartleads.findOne({ where: { id } });

    const fuDate = followUp && followUp.trim() !== '' ? new Date(followUp) : null;
    const salesAmt = salesAmount === '' ? null : salesAmount;
    const updates = {};
    const logs = [];

    if (lead.status !== status) {
      updates.status = status;
      logs.push({
        actionType: 'edit',
        statusBefore: lead.status,
        statusAfter: status
      });
    }

    if (lead.remark !== remark) {
      updates.remark = remark;
      logs.push({
        actionType: 'edit',
        remarkChange: true
      });
    }

    const oldFU = lead.followUpDate ? new Date(lead.followUpDate).getTime() : null;
    const newFU = fuDate ? fuDate.getTime() : null;

    if (oldFU !== newFU) {
      updates.followUpDate = fuDate;
      logs.push({
        actionType: 'edit',
        followUpDate: fuDate
      });
    }

    // Update utama ke msmartleads
    await msmartleads.update({
      name,
      country,
      phone,
      status,
      remark,
      followUpDate: fuDate,
      salesAmount: salesAmt
    }, { where: { id } });

    // Insert structured activity logs
    for (const log of logs) {
      await msmart_structuredActivity.create({
        username,
        teamId,
        msmartleadId: id,
        actionType: log.actionType,
        statusBefore: log.statusBefore || null,
        statusAfter: log.statusAfter || null,
        followUpDate: log.followUpDate || null,
        remarkChange: log.remarkChange || null
      });
    }

    // Tambah ke msmart_salesSubmit jika salesAmount berubah dan > 0
    const prevSalesAmount = lead.salesAmount || 0;
    const currentSalesAmount = parseFloat(salesAmount) || 0;

    if (
      currentSalesAmount > 0 &&
      currentSalesAmount !== parseFloat(prevSalesAmount)
    ) {
      await msmart_salesSubmit.create({
        username,
        teamId,
        msmartleadId: id,
        repeatAmount: currentSalesAmount,
        remarks: remark,
        createdAt: new Date() // boleh adjust ikut activity timestamp kalau perlu
      });
    }

    res.json({ success: 'Leads updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Can't update database. Please try again" });
  }
});


router.post('/get/sales-target/:teamId', validateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { month, year } = req.body;
    const username = req.user.username;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const target = await msmart_salesTarget.findOne({
      where: {
        teamId: parseInt(teamId, 10),
        username,
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      }
    });

    return res.json(target || { targetAmount: 0 });
  } catch (err) {
    console.error('❌ Error getting sales target:', err);
    return res.status(500).json({ error: 'Failed to fetch sales target' });
  }
});

router.post('/post/sales-target/:teamId', validateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { month, year, targetAmount } = req.body;
    const username = req.user.username;

    if (!month || !year || targetAmount === undefined) {
      return res.status(400).json({ error: 'Month, year, and targetAmount are required' });
    }

    const [target, created] = await msmart_salesTarget.findOrCreate({
      where: {
        teamId: parseInt(teamId, 10),
        username,
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      },
      defaults: { targetAmount }
    });

    if (!created) {
      target.targetAmount = targetAmount;
      await target.save();
    }

    return res.json({ success: true, message: created ? `Sales Target Created for ${month}/${year}` : `Sales Target Updated for ${month}/${year}` , data: target });
  } catch (err) {
    console.error('❌ Error saving sales target:', err);
    return res.status(500).json({ error: 'Failed to save sales target' });
  }
});

router.put('/manager/approve/member', validateToken, async (req,res) => {
  
  const {id} = req.body;

  try{

    await msmart_teamManager.update({isVerified: 1}, {where: {id: id}}).then(() => {
      res.json({succ:"Approved member request succesfully"})
    })

  }catch(err){
    res.json({err: "Unable to approve member request"})
  }
})

router.put('/repeat-sales/:id', validateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const id = req.params.id;
    const { repeatAmount, remarks } = req.body;

    const sale = await msmart_salesSubmit.findByPk(id);


    if (!sale) {
      return res.status(404).json({ message: 'Sales not found.' });
    }

    await sale.update({
      repeatAmount,
      remarks
    });

    res.status(200).json({ success: 'Sales updated successfully' });
    
  
    }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Can't update sales. Please try again" });
  }
})

router.delete('/lead/:leadid', validateToken, async (req, res) => {
  const username = req.user.username;
  const id = req.params.leadid;

  try {
    // Delete related structuredActivity & salesSubmit
    await msmart_structuredActivity.destroy({ where: { msmartleadId: id } });
    await msmart_salesSubmit.destroy({ where: { msmartleadId: id } });

    // Delete from main table
    const deleted = await msmartleads.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.status(200).json({ succ: 'Lead and related data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete data from database' });
  }
});


router.delete('/manager/member/:id', validateToken, async (req,res) => {

  const id = req.params.id;

  try{

    await msmart_teamManager.destroy({where: {id: id}}).then(() => {
      res.json({succ:"Deleted member request succesfully"})
    })

  }catch(err){
    res.json({err: "Unable to delete member request"})
    console.log(err)
  }

})


//Admin

function toStartOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function toEndOfDay(d)   { const x = new Date(d); x.setHours(23,59,59,999); return x; }

// Sama seperti di /monitor/activity
function filterRapidActivities(logs, minutes = 5) {
  if (logs.length < 2) return logs;
  const TIME_WINDOW_MS = minutes * 60 * 1000;
  const out = [];
  for (let i = 0; i < logs.length; i++) {
    const cur = logs[i];
    const next = logs[i + 1];
    const isLast = !next;
    const isDifferentLead = next && next.msmartleadId !== cur.msmartleadId;
    const isGapBig = next && (new Date(next.createdAt) - new Date(cur.createdAt)) >= TIME_WINDOW_MS;
    if (isLast || isDifferentLead || isGapBig) out.push(cur);
  }
  return out;
}

// Ambil sekali sahaja manager name map (optional – ikut keperluan)
async function getManagerMap(teamId) {
  const managers = await msmart_teamManager.findAll({ where: { teamId } });
  return new Map(managers.map(m => [m.username, m.nameInTeam]));
}

// Enrich leads ikut gaya /monitor/activity (mask phone, dll)
async function enrichLeadsFromIds(logs) {
  if (!logs.length) return [];
  const leadIds = [...new Set(logs.map(l => l.msmartleadId))];
  const leads = await msmartleads.findAll({ where: { id: { [Op.in]: leadIds } } });
  const leadMap = new Map(leads.map(lead => [lead.id, lead]));
  return logs.map(log => {
    const lead = leadMap.get(log.msmartleadId) || {};
    return {
      name: lead?.name || '',
      phone: (lead?.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead?.phone || ''),
      country: lead?.country || '',
      status: lead?.status || log.statusAfter || log.statusBefore || 'N/A',
      createdAt: log.createdAt,
      updatedAt: lead?.updatedAt || log.createdAt
    };
  });
}

// Proses semua activity logs → (finalActivityLogs, closedLogs, bookingLogs, rejectedLogs, followUpUniqueLogs)
function computeActivityBuckets(allLogsAsc /* ASC by createdAt */) {
  const statusChangeLogs = [];
  const otherLogs = [];
  for (const log of allLogsAsc) {
    if (log.actionType === 'edit' && log.statusBefore !== log.statusAfter) statusChangeLogs.push(log);
    else otherLogs.push(log);
  }
  const filteredStatusChangeLogs = filterRapidActivities(statusChangeLogs);
  const finalActivityLogs = [...otherLogs, ...filteredStatusChangeLogs];

  const rawClosedLogs   = finalActivityLogs.filter(a => a.statusAfter === 'Closed');
  const rawBookingLogs  = finalActivityLogs.filter(a => a.statusAfter === 'Booking');
  const rawRejectedLogs = finalActivityLogs.filter(a => a.statusAfter === 'Rejected');

  // “Follow up” = unique touch per lead per hari (ikut /monitor/activity, siap offset +8 jam)
  const uniqueByUserLeadDate = {};
  for (const log of finalActivityLogs) {
    const dateKey = new Date(new Date(log.createdAt).getTime() + 8 * 60 * 60 * 1000) // +08:00
      .toISOString().split('T')[0];
    const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
    const exist = uniqueByUserLeadDate[key];
    if (!exist || new Date(log.createdAt) > new Date(exist.createdAt)) {
      uniqueByUserLeadDate[key] = log;
    }
  }

  return {
    finalActivityLogs,
    rawClosedLogs,
    rawBookingLogs,
    rawRejectedLogs,
    followUpUniqueLogs: Object.values(uniqueByUserLeadDate)
  };
}

router.get('/admin/get/team/list', validateAdmin, async (req,res) => {
  try{
  const getTeam = await msmart_team.findAll();
  res.json(getTeam)
  }catch(error){
  res.json({error:"Failed to retrieve teams."})
  }
  
})

router.post('/create/team', validateAdmin, async (req,res) => {
  try{
    const {username, name, password, confirmPassword, email, phoneNumber, teamName} = req.body;
    const checkTeam = await msmart_team.findOne({where: {teamName:teamName}});


    if(checkTeam){
      return res.json({error: "Team with this name already existed"})
    }else{
    const dupeUsername = await Users.findOne({where: {username: username }});
    const dupeEmail = await Users.findOne({where: {email: email }});
    const dupePhoneNumber = await Users.findOne({where: {phoneNumber: phoneFormat(phoneNumber) }});

              if (!username || !name || !password || !email || !phoneNumber){
            res.json({ error: "All field must be fill"});
        }

            else if (dupeUsername){
            res.json({ error: "Username is already taken"});
        }
            else if (dupeEmail){
                res.json({ error: "Email is already taken"});
            } 
            else if (dupePhoneNumber){
                res.json({ error: "Mobile Number is already taken"});
            }
            else if (password != confirmPassword){
                res.json({ error: "Password and confirm password are to be the same"});
            }else {

              const hashedPass = bcrypt.hashSync(password, 10);
              await Users.create({
                username: username,
                name: name,
                password: hashedPass,
                email: email,
                phoneNumber: phoneNumber,
                isValidate: 1
              }).then( async () => {
                await msmart_team.create({
                  username: username,
                  teamName: teamName
                }).then( async (response) => {
                  await msmart_teamManager.create({
                    username: username,
                    nameInTeam: name,
                    teamId: response.dataValues.id,
                    managerName: username,
                    managerUsername: username,
                    position: 'Owner',
                    isVerified: 1
                  }).then(()=> {
                    res.json({succMsg: 'Team created successfully!'});
                  }).catch((error) => {
                    console.log(error)
                    res.json({error:'Unable to create team. Please try again'});
                  })
                }).catch((error) => {
                  console.log(error);
                  res.json({error:'Unable to create team. Please try again'});
                })
              })

            }


    }
  }catch(error){
    res.json({error: 'Unable to create team. Please try again'});
    console.log(error);
  }
})

router.post('/create/user', validateAdmin, async (req,res) => {
  try{
    const {username, name, position, password, confirmPassword, email, phoneNumber, team, manager} = req.body;
    const dupeUsername = await Users.findOne({where: {username: username }});
    const getTeam = await msmart_team.findOne({where: {id: team}});
    const owner = await getTeam.username;

    let managerName;
    if(position == 'Manager'){
      managerName = owner;
    }
    if(position == 'Member'){
      managerName = manager;
    }

              if (!username || !name || !password || !email || !phoneNumber){
            res.json({ error: "All field must be fill"});
        }

            else if (dupeUsername){
            res.json({ error: "Username is already taken"});
        }
            else if (password != confirmPassword){
                res.json({ error: "Password and confirm password are to be the same"});
            }else {

              const hashedPass = bcrypt.hashSync(password, 10);
              await Users.create({
                username: username,
                name: name,
                password: hashedPass,
                email: email,
                phoneNumber: phoneNumber,
                isValidate: 1
              }).then( async (response) => {
                  await msmart_teamManager.create({
                    username: username,
                    nameInTeam: name,
                    teamId: team,
                    managerName: managerName,
                    managerUsername: managerName,
                    position: position,
                    isVerified: 1
                  }).then(()=> {
                    res.status(200).json({success: 'User created successfully!'});
                  })
                })


    }
  }catch(error){
    res.status(400).json({error: 'Unable to create user. Please try again'});
    console.log(error);
  }
})

router.post('/monitor/manager/:teamId/:username', validateAdmin, async (req,res) => {
  try{
      const teamid = req.params.teamId;
      const username = req.params.username;
      const {date} = req.body;
      let activitiesData = [];
      let trainingData = [];
      let followUpData = [];
      let addDatabase = 0;
      let closed = 0;
      let booked = 0;
      let FollowUp = 0;
      let newTeamMember = 0;

      const newDate = new Date(date);
      const today = newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate();
      const sendToday = newDate.getDate() + '/' + (newDate.getMonth() + 1) + '/' + newDate.getFullYear();
      const tomorrow = new Date(newDate);
      tomorrow.setDate(newDate.getDate() + 1);
      const sendTomorrow = tomorrow.getDate() + '/' + (tomorrow.getMonth() + 1) + '/' + tomorrow.getFullYear();

      const startOfToday = today + ' 00:00:00';
      const endOfToday = today + ' 23:59:59.999999';

      const startOfTomorrow = tomorrow.toISOString().slice(0, 10) + ' 00:00:00';
      const endOfTomorrow = tomorrow.toISOString().slice(0, 10) + ' 23:59:59.999999';

      // === Panggil fungsi dari utiliti ===
      const teams = await getTeamHierarchy(username, teamid);

      const members = teams.filter((member) =>
          ['Manager & Member', 'Member'].includes(member.position)
      );
      const courses = await mu_course.findAll({where: {teamId:{[Op.in]: [0, parseInt(teamid, 10)]}}});

      if(members.length > 0){
          const newMember = members.filter(item => {
              const createdDate = new Date(item.createdAt).toDateString();
              const todayDate = new Date(newDate).toDateString();
              return (createdDate === todayDate);
          });
          newTeamMember = newMember.length;
      }

      // ... (selebihnya kod sama macam asal)
      // ... (rest of the code is the same as original)
      for (var i = 0; i < courses.length; i++) {
          const course = await courses[i];
          const getEnroll = await mu_progress.findAndCountAll({where: {username: username, shortlink: course.shortlink}});
      }

      for(var i=0; i< members.length; i++){
          let progressData = [];
          const member = members[i];
          for(var j=0; j < courses.length; j++){
              let progress;
              let status;
              const course = await courses[j];
              const lessonCount = await course.vidCount;
              const progresses = await mu_progress.findOne({where: {username: member.username, shortlink: course.shortlink}}); 
              if(!progresses){
                  progress = 0;
                  status = 'Not Started';
              }else if(progresses.currentLesson >= lessonCount){
                  progress = lessonCount;
                  status = 'Completed';
              }else if(progresses.currentLesson < lessonCount){
                  status = 'Not Completed';
                  progress = await progresses.currentLesson;
              }
              progressData.push({[course.courseName]: `${progress} / ${course.vidCount}`, status: status});
          }
          trainingData.push({name:member.nameInTeam, username: member.username, progressData: progressData});
          
          const leads = await msmartleads.findAll({where: {username: member.username, teamId: teamid}});
          const todaysleads = leads.filter(item => {
              const leadDate = new Date(item.createdAt).toDateString();
              const todayDate = new Date(newDate).toDateString();
              return leadDate === todayDate;
          });
          const closedLeads = leads.filter(item => {
              const updatedDate = new Date(item.updatedAt).toDateString();
              const todayDate = new Date(newDate).toDateString();
              return updatedDate === todayDate && item.status === 'Closed';
          });
          const bookingLeads = leads.filter(item => {
              const updatedDate = new Date(item.updatedAt).toDateString();
              const todayDate = new Date(newDate).toDateString();
              return updatedDate === todayDate && item.status === 'Booking';
          });
          const rejectedLeads = leads.filter(item => {
              const updatedDate = new Date(item.updatedAt).toDateString();
              const todayDate = new Date(newDate).toDateString();
              return updatedDate === todayDate && item.status === 'Rejected';
          });
          activitiesData.push({name:member.nameInTeam, username: member.username, newDatabase: todaysleads.length, closed: closedLeads.length, booked: bookingLeads.length, rejected: rejectedLeads.length, totalLeads: leads.length});
          addDatabase += todaysleads.length;
          closed += closedLeads.length;
          booked += bookingLeads.length;

          const followUp = await msmartleads.findAll({where: {username: member.username, teamId: teamid, followUpDate: {[Op.between]: [startOfTomorrow, endOfTomorrow]}}})
          const todayFollowUp = await msmartleads.findAll({where: {username: member.username, teamId: teamid, followUpDate: {[Op.between]: [startOfToday, endOfToday]}}})

          if(followUp.length > 0){
              followUpData.push({agentname:member.nameInTeam, followUp: followUp});
          }
          FollowUp += todayFollowUp.length;
      }

      const content = `bagi short analysis and corrective action untuk ni,\ DATA\ new member registered: ${newTeamMember}\ total added database: ${addDatabase}\ total closed: ${closed} \ total booked: ${booked}\ total follow up: ${FollowUp} \ total team members: ${members.length}\ TARGET\ new member registered: sekurang-kurangnya 1 sehari\ total added database: 3-5 * total team members\ total closed: 0.7 * total team members\ total booked: 1 * total team members\ total follow up: 2-3 * total team members\ OUTPUT\ nak format macam ni\ *New Member Registered:* ? (Target: ?)\ *Action:*\ buat untuk semua data kecuali total team members ikut format.\ buat kesimpulan pendek untuk analysis bawah sekali.\ ayat jangan terlalu baku, nak pendek ringkas dan padat dalam bahasa melayu dan terma english macam perkataan close, book, follow up dan database tu jangan translate ke bahasa melayu.`;
      const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: content }],
          model: "deepseek-chat",
      });
      const prompt = await completion.choices[0].message.content;

      res.status(201).json({date: {today: sendToday, tomorrow: sendTomorrow}, database: activitiesData, followUp: followUpData, training:trainingData, overall: {newTeamMember: newTeamMember ,newDatabase: addDatabase, closed: closed, booked: booked, FollowUp: FollowUp}, totalTeam: members.length, prompt: prompt});

  } catch(err) {
      res.status(404).json({error: 'Unable to retrieve data. Please try again'});
      console.log(err);
  }
})

router.post('/monitor/manager/:teamId', validateAdmin, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { date } = req.body;

    // ==== Range ====
    let rangeStart, rangeEnd;
    if (date && typeof date === 'object' && date.start && date.end) {
      rangeStart = toStartOfDay(`${date.start}T00:00:00`);
      rangeEnd   = toEndOfDay(`${date.end}T00:00:00`);
    } else if (typeof date === 'string' && date.length) {
      rangeStart = toStartOfDay(`${date}T00:00:00`);
      rangeEnd   = toEndOfDay(`${date}T00:00:00`);
    } else {
      const today = new Date();
      rangeStart = toStartOfDay(today);
      rangeEnd   = toEndOfDay(today);
    }

    const toDisp = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    const sendToday = (toDisp(rangeStart) === toDisp(rangeEnd)) ? toDisp(rangeStart) : `${toDisp(rangeStart)} - ${toDisp(rangeEnd)}`;

    // ==== Data asas (kekal) ====
    const members = await msmart_teamManager.findAll({
      where: { teamId, position: { [Op.like]: '%Member%' } }
    });
    const courses = await mu_course.findAll({
      where: { teamId: { [Op.in]: [0, parseInt(teamId, 10)] } }
    });

    const memberUsernames = members.map(m => m.username);
    if (!memberUsernames.length) {
      return res.status(201).json({
        date: { today: sendToday },
        database: [],
        followUp: [],
        training: [],
        overall: { newTeamMember: 0, newDatabase: 0, closed: 0, booked: 0, FollowUp: 0 },
        totalTeam: 0
      });
    }

    // ==== Pull pukal ====
    const allLeads = await msmartleads.findAll({
      where: { username: { [Op.in]: memberUsernames }, teamId }
    });

    // Activity logs ikut gaya /monitor/activity
    const activityLogs = await msmart_structuredActivity.findAll({
      where: {
        username: { [Op.in]: memberUsernames },
        createdAt: { [Op.between]: [rangeStart, rangeEnd] },
        actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
      },
      order: [['createdAt', 'ASC']],
      raw: true
    });

    // Group by username → proses ikut member
    const logsByUser = new Map();
    for (const l of activityLogs) {
      if (!logsByUser.has(l.username)) logsByUser.set(l.username, []);
      logsByUser.get(l.username).push(l);
    }

    // Training (kekal)
    const courseShortlinks = courses.map(c => c.shortlink);
    const allProgresses = await mu_progress.findAll({
      where: { username: { [Op.in]: memberUsernames }, shortlink: { [Op.in]: courseShortlinks } }
    });

    const trainingData = [];
    const activitiesData = [];
    const followUpData = [];

    // Overall counters
    let addDatabase = 0;
    let closed = 0, booked = 0, FollowUp = 0;

    // Utility inRange (untuk added database)
    const inRange = (dt) => { const d = new Date(dt); return d >= rangeStart && d <= rangeEnd; };

    for (const member of members) {
      const username = member.username;
      const leadsForMember = allLeads.filter(l => l.username === username);

      // Added Database = createdAt in range (kekal)
      const leadsAddedInRange = leadsForMember.filter(l => inRange(l.createdAt));

      // Activity-based counts (selari /monitor/activity)
      const userLogsAsc = logsByUser.get(username) || [];
      const { rawClosedLogs, rawBookingLogs, rawRejectedLogs, followUpUniqueLogs } = computeActivityBuckets(userLogsAsc);

      // Enrich untuk followUpData (nak paparan senarai)
      const followUpLeads = await enrichLeadsFromIds(followUpUniqueLogs);

      activitiesData.push({
        name: member.nameInTeam,
        username,
        newDatabase: leadsAddedInRange.length,
        closed: rawClosedLogs.length,
        booked: rawBookingLogs.length,
        rejected: rawRejectedLogs.length,
        totalLeads: leadsForMember.length
      });

      if (followUpLeads.length > 0) {
        followUpData.push({ agentname: member.nameInTeam, followUp: followUpLeads });
      }

      // Training (kekal)
      const progressData = [];
      for (const course of courses) {
        const prog = allProgresses.find(p => p.username === username && p.shortlink === course.shortlink);
        const lessonCount = course.vidCount;
        let progress = 0, status = 'Not Started';
        if (prog) {
          if (prog.currentLesson >= lessonCount) { progress = lessonCount; status = 'Completed'; }
          else { progress = prog.currentLesson; status = 'Not Completed'; }
        }
        progressData.push({ [course.courseName]: `${progress} / ${lessonCount}`, status });
      }
      trainingData.push({ name: member.nameInTeam, username, progressData });

      // Overall sum
      addDatabase += leadsAddedInRange.length;
      closed += rawClosedLogs.length;
      booked += rawBookingLogs.length;
      FollowUp += followUpLeads.length;
    }

    res.status(201).json({
      date: { today: sendToday },
      database: activitiesData,
      followUp: followUpData,
      training: trainingData,
      overall: { newTeamMember: 0, newDatabase: addDatabase, closed, booked, FollowUp }, // newTeamMember asal dikira by createdAt member; kalau nak kekal, tambah balik logic tu.
      totalTeam: members.length
    });

  } catch (err) {
    console.log(err);
    res.status(404).json({ error: 'Unable to retrieve data. Please try again' });
  }
});

router.post('/monitor/team/:teamId', validateAdmin, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { date } = req.body;

    // ==== Range ====
    let rangeStart, rangeEnd;
    if (date && typeof date === 'object' && date.start && date.end) {
      rangeStart = toStartOfDay(`${date.start}T00:00:00`);
      rangeEnd   = toEndOfDay(`${date.end}T00:00:00`);
    } else if (typeof date === 'string' && date.length) {
      rangeStart = toStartOfDay(`${date}T00:00:00`);
      rangeEnd   = toEndOfDay(`${date}T00:00:00`);
    } else {
      const today = new Date();
      rangeStart = toStartOfDay(today);
      rangeEnd   = toEndOfDay(today);
    }
    const inRange = (dt) => { const d = new Date(dt); return d >= rangeStart && d <= rangeEnd; };

    // ==== Query asas (kekal) ====
    const members = await msmart_teamManager.findAll({
      where: { teamId: teamId, position: { [Op.like]: '%Member%' } }
    });
    const managers = await msmart_teamManager.findAll({
      where: { teamId: teamId, position: { [Op.like]: '%Manager%' } }
    });
    const courses = await mu_course.findAll({
      where: { teamId: { [Op.in]: [0, parseInt(teamId, 10)] } }
    });

    const memberUsernames = members.map(m => m.username);
    if (!memberUsernames.length) {
      return res.status(201).json({ teamData: [], trainingData: [], followUpData: [], manager: managers });
    }

    // Pull pukal leads (untuk added database & totalLeads)
    const allLeads = await msmartleads.findAll({
      where: { username: { [Op.in]: memberUsernames }, teamId: teamId }
    });

    // Pull pukal activity logs (ikut /monitor/activity)
    const activityLogs = await msmart_structuredActivity.findAll({
      where: {
        username: { [Op.in]: memberUsernames },
        createdAt: { [Op.between]: [rangeStart, rangeEnd] },
        actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
      },
      order: [['createdAt', 'ASC']],
      raw: true
    });

    const logsByUser = new Map();
    for (const l of activityLogs) {
      if (!logsByUser.has(l.username)) logsByUser.set(l.username, []);
      logsByUser.get(l.username).push(l);
    }

    // Training (kekal)
    const courseShortlinks = courses.map(c => c.shortlink);
    const allProgresses = await mu_progress.findAll({
      where: { username: { [Op.in]: memberUsernames }, shortlink: { [Op.in]: courseShortlinks } }
    });

    let teamData = [];
    let trainingData = [];
    let followUpData = [];

    for (const member of members) {
      const username = member.username;
      const leadsForMember = allLeads.filter(l => l.username === username);

      // Added Database = createdAt in range
      const leadsAddedInRange = leadsForMember.filter(l => inRange(l.createdAt));

      // Activity-based buckets
      const userLogsAsc = logsByUser.get(username) || [];
      const { rawClosedLogs, rawBookingLogs, rawRejectedLogs, followUpUniqueLogs } = computeActivityBuckets(userLogsAsc);

      // teamData counts (selari /activity)
      teamData.push({
        name: member.nameInTeam,
        username,
        manager: member.managerUsername,
        newDatabase: leadsAddedInRange.length,
        closed: rawClosedLogs.length,
        booked: rawBookingLogs.length,
        rejected: rawRejectedLogs.length,
        totalLeads: leadsForMember.length
      });

      // followUpData = senarai “unique touches”
      const followUpLeads = await enrichLeadsFromIds(followUpUniqueLogs);
      if (followUpLeads.length > 0) {
        followUpData.push({
          name: member.nameInTeam,
          username,
          manager: member.managerUsername,
          followUp: followUpLeads
        });
      }

      // Training (kekal)
      const progressData = [];
      for (const course of courses) {
        const prog = allProgresses.find(p => p.username === username && p.shortlink === course.shortlink);
        const lessonCount = course.vidCount;
        let progress = 0, status = 'Not Started';
        if (prog) {
          if (prog.currentLesson >= lessonCount) { progress = lessonCount; status = 'Completed'; }
          else { progress = prog.currentLesson; status = 'Not Completed'; }
        }
        progressData.push({ [course.courseName]: `${progress} / ${lessonCount}`, status });
      }
      trainingData.push({ name: member.nameInTeam, username, manager: member.managerUsername, progressData });
    }

    res.status(201).json({
      teamData,
      trainingData,
      followUpData,
      manager: managers
    });

  } catch (err) {
    console.log(err);
    res.status(404).json({ error: 'Unable to retrieve data. Please try again' });
  }
});


router.post('/monitor/activity/:teamId', validateAdmin, async (req, res) => {

  function filterRapidActivities(logs, minutes = 5) {
    if (logs.length < 2) {
        return logs;
    }
  
    const TIME_WINDOW_MS = minutes * 60 * 1000;
    const filteredLogs = [];
  
    for (let i = 0; i < logs.length; i++) {
        const currentLog = logs[i];
        const nextLog = logs[i + 1];
  
        const isLastLog = !nextLog;
        const isDifferentLead = nextLog && nextLog.msmartleadId !== currentLog.msmartleadId;
        const isTimeGapTooBig = nextLog && (new Date(nextLog.createdAt) - new Date(currentLog.createdAt)) >= TIME_WINDOW_MS;
  
        if (isLastLog || isDifferentLead || isTimeGapTooBig) {
            filteredLogs.push(currentLog);
        }
    }
    return filteredLogs;
  }

  try {
      const { startDate, endDate } = req.body;
      const { teamId } = req.params;

      if (!startDate || !endDate || !teamId) {
          return res.status(400).json({ error: 'selected date and teamId are required' });
      }

      const startOfDate = new Date(startDate);
      startOfDate.setHours(0, 0, 0, 0);
      const endOfDate = new Date(endDate);
      endOfDate.setHours(23, 59, 59, 999);

      const teamMembers = await msmart_teamManager.findAll({
          where: {
              teamId,
              position: { [Op.in]: ['Member', 'Manager & Member'] },
          },
      });

      if (!teamMembers.length) {
          return res.status(404).json({ error: 'No team members found' });
      }
      
      // --- OPTIMISASI: Ambil data pengurus sekali sahaja ---
      const managers = await msmart_teamManager.findAll({ where: { teamId } });
      const managerMap = new Map(managers.map(m => [m.username, m.nameInTeam]));
      
      // Helper function dalam skop route
      async function enrichLeadsFromIds(logs) {
          if (!logs.length) return [];
          const leadIds = [...new Set(logs.map(log => log.msmartleadId))];
          const leads = await msmartleads.findAll({ where: { id: { [Op.in]: leadIds } } });
          const leadMap = new Map(leads.map(lead => [lead.id, lead]));

          return logs.map(log => {
              const lead = leadMap.get(log.msmartleadId) || {};
              return {
                  name: lead.name || '',
                  phone: (lead.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead.phone || ''),
                  country: lead.country || '',
                  status: lead.status || log.statusAfter || log.statusBefore || 'N/A',
                  createdAt: log.createdAt,
                  updatedAt: lead.updatedAt || log.createdAt
              };
          });
      }

      const results = await Promise.all(teamMembers.map(async (member) => {
          const memberUsername = member.username;
          const nameInTeam = member.nameInTeam;
          const managerNameInTeam = managerMap.get(member.managerUsername) || null;

          let createdLeads = await msmartleads.findAll({
              where: {
                  username: memberUsername,
                  createdAt: { [Op.between]: [startOfDate, endOfDate] }
              },
          });

          createdLeads = createdLeads.map(lead => ({
              name: lead.name,
              phone: (lead.phone && lead.phone.length > 2) ? lead.phone.slice(0, -2) + '**' : (lead.phone || ''),
              country: lead.country,
              status: lead.status || '',
              createdAt: lead.createdAt,
              updatedAt: lead.updatedAt
          }));

          const activityLogs = await msmart_structuredActivity.findAll({
              where: {
                  username: memberUsername,
                  createdAt: { [Op.between]: [startOfDate, endOfDate] },
                  actionType: { [Op.in]: ['add', 'edit', 'repeat'] }
              },
              order: [['createdAt', 'ASC']],
              raw: true
          });

          // --- LOGIK PENAPISAN 5-MINIT YANG BARU ---
          const statusChangeLogs = [];
          const otherLogs = [];
          for (const log of activityLogs) {
              if (log.actionType === 'edit' && log.statusBefore !== log.statusAfter) {
                  statusChangeLogs.push(log);
              } else {
                  otherLogs.push(log);
              }
          }
          const filteredStatusChangeLogs = filterRapidActivities(statusChangeLogs);
          const finalActivityLogs = [...otherLogs, ...filteredStatusChangeLogs];
          // --- TAMAT LOGIK PENAPISAN ---

          const rawClosedLogs = finalActivityLogs.filter(a => a.statusAfter === 'Closed');
          const rawBookingLogs = finalActivityLogs.filter(a => a.statusAfter === 'Booking');
          const rawRejectedLogs = finalActivityLogs.filter(a => a.statusAfter === 'Rejected');

          const uniqueLogs = {};
          for (const log of finalActivityLogs) { // Guna 'finalActivityLogs'
              const dateKey = new Date(new Date(log.createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
              const key = `${log.username}-${log.msmartleadId}-${dateKey}`;
              const existing = uniqueLogs[key];
              if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
                  uniqueLogs[key] = log;
              }
          }

          const [closedLeads, bookingLeads, rejectedLeads, followUpLeads] = await Promise.all([
              enrichLeadsFromIds(rawClosedLogs),
              enrichLeadsFromIds(rawBookingLogs),
              enrichLeadsFromIds(rawRejectedLogs),
              enrichLeadsFromIds(Object.values(uniqueLogs))
          ]);

          return {
              username: memberUsername,
              nameInTeam,
              managerNameInTeam,
              totalCreated: createdLeads.length,
              totalClosed: closedLeads.length,
              totalBooking: bookingLeads.length,
              totalRejected: rejectedLeads.length,
              totalFollowUp: followUpLeads.length,
              createdLeads,
              closedLeads,
              bookingLeads,
              rejectedLeads,
              followUpLeads
          };
      }));

      return res.json(results);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Unable to retrieve activity data', details: err.message });
  }
});

router.post('/monitor/overall', validateAdmin,async (req,res) => {
  try{
    const selecteddate = req.body.date;

    // Formatkan tarikh agar sesuai dengan database
    const startOfDay = new Date(selecteddate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selecteddate);
    endOfDay.setHours(23, 59, 59, 999);

    // Ambil data msmart_teamManager secara manual
    const teamManagerData = await msmart_teamManager.findAll({
      attributes: ['teamId', 'username', 'nameInTeam'],
    });

    const mapTeamManager = teamManagerData.reduce((map, manager) => {
      map[manager.username] = manager.nameInTeam;
      return map;
    }, {});

    // Ambil data msmart_team secara manual
    const teamData = await msmart_team.findAll({
      attributes: ['id', 'teamName'],
    });

    const mapTeamName = teamData.reduce((map, team) => {
      map[team.id] = team.teamName;
      return map;
    }, {});

    // 1. Top 10 username + nameInTeam + teamName untuk createdAt = selecteddate
    const topCreatedLeads = await msmartleads.findAll({
      attributes: [
        'username',
        'teamId',
        [Sequelize.fn('COUNT', Sequelize.col('username')), 'totalLeads'],
      ],
      where: {
        [Op.and]: [
          { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
          { username: { [Op.ne]: null } },
          { teamId: { [Op.ne]: null } },
        ],
      },
      group: ['username', 'teamId'],
      order: [[Sequelize.literal('totalLeads'), 'DESC']],
      limit: 10,
    });

    const enrichedCreatedLeads = topCreatedLeads.map(lead => ({
      ...lead.dataValues,
      nameInTeam: mapTeamManager[lead.username] || null,
      teamName: mapTeamName[lead.teamId] || null,
    }));

    // 2. Top 10 username + nameInTeam + teamName untuk status = closed
    const topClosedLeads = await msmartleads.findAll({
      attributes: [
        'username',
        'teamId',
        [Sequelize.fn('COUNT', Sequelize.col('username')), 'totalLeads'],
      ],
      where: {
        [Op.and]: [
          { status: 'closed' },
          { [Op.or]: [
            { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
            { updatedAt: { [Op.between]: [startOfDay, endOfDay] } },
          ] },
          { username: { [Op.ne]: null } },
          { teamId: { [Op.ne]: null } },
        ],
      },
      group: ['username', 'teamId'],
      order: [[Sequelize.literal('totalLeads'), 'DESC']],
      limit: 10,
    });

    const enrichedClosedLeads = topClosedLeads.map(lead => ({
      ...lead.dataValues,
      nameInTeam: mapTeamManager[lead.username] || null,
      teamName: mapTeamName[lead.teamId] || null,
    }));

    // 3. Top 10 username + nameInTeam + teamName untuk status = booking
    const topBookingLeads = await msmartleads.findAll({
      attributes: [
        'username',
        'teamId',
        [Sequelize.fn('COUNT', Sequelize.col('username')), 'totalLeads'],
      ],
      where: {
        [Op.and]: [
          { status: 'booking' },
          { [Op.or]: [
            { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
            { updatedAt: { [Op.between]: [startOfDay, endOfDay] } },
          ] },
          { username: { [Op.ne]: null } },
          { teamId: { [Op.ne]: null } },
        ],
      },
      group: ['username', 'teamId'],
      order: [[Sequelize.literal('totalLeads'), 'DESC']],
      limit: 10,
    });

    const enrichedBookingLeads = topBookingLeads.map(lead => ({
      ...lead.dataValues,
      nameInTeam: mapTeamManager[lead.username] || null,
      teamName: mapTeamName[lead.teamId] || null,
    }));

    // 4. Top 10 username + nameInTeam + teamName untuk followupDate = selecteddate
    const topFollowupLeads = await msmartleads.findAll({
      attributes: [
        'username',
        'teamId',
        [Sequelize.fn('COUNT', Sequelize.col('username')), 'totalLeads'],
      ],
      where: {
        [Op.and]: [
          { followupDate: { [Op.between]: [startOfDay, endOfDay] } },
          { username: { [Op.ne]: null } },
          { teamId: { [Op.ne]: null } },
        ],
      },
      group: ['username', 'teamId'],
      order: [[Sequelize.literal('totalLeads'), 'DESC']],
      limit: 10,
    });

    const enrichedFollowupLeads = topFollowupLeads.map(lead => ({
      ...lead.dataValues,
      nameInTeam: mapTeamManager[lead.username] || null,
      teamName: mapTeamName[lead.teamId] || null,
    }));

    // 5. Top 3 teams by category: created, closed, booking, followup
    const categories = [
      { name: 'created', condition: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } },
      { name: 'closed', condition: { status: 'closed', [Op.or]: [
          { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
          { updatedAt: { [Op.between]: [startOfDay, endOfDay] } },
        ] } },
      { name: 'booking', condition: { status: 'booking', [Op.or]: [
          { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
          { updatedAt: { [Op.between]: [startOfDay, endOfDay] } },
        ] } },
      { name: 'followup', condition: { followupDate: { [Op.between]: [startOfDay, endOfDay] } } },
    ];

    const topTeamsByCategory = {};

    for (const category of categories) {
      const topTeams = await msmartleads.findAll({
        attributes: [
          'teamId',
          [Sequelize.fn('COUNT', Sequelize.col('teamId')), 'totalLeads'],
        ],
        where: {
          teamId: { [Op.ne]: null },
          ...category.condition,
        },
        group: ['teamId'],
        order: [[Sequelize.literal('totalLeads'), 'DESC']],
        limit: 3,
      });

      topTeamsByCategory[category.name] = topTeams.map(team => ({
        ...team.dataValues,
        teamName: mapTeamName[team.teamId] || 'Unknown Team',
      }));
    }

    // Gabungkan hasil untuk semua kategori
    const results = {
      createdLeads: enrichedCreatedLeads,
      closedLeads: enrichedClosedLeads,
      bookingLeads: enrichedBookingLeads,
      followupLeads: enrichedFollowupLeads,
      topTeams: topTeamsByCategory,
    };

    res.status(200).json(results);
  } catch(err) {
    res.status(404).json({error: 'Unable to retrieve data. Please try again'});
    console.log(err);
  }
});




//Public

router.get('/get/team/:teamId', async (req,res) => {
  try{
    const teamid = req.params.teamId;
    const team = await msmart_team.findOne({where: {id: parseInt(teamid, 10)}});
    const managers = await msmart_teamManager.findAll({where: {teamId: teamid, position: {
      [Op.like]: '%Manager%'
    }}});
    res.status(201).json({team: team, manager: managers});
  }catch(err){
    res.status(404).json({error: 'Unable to retrieve data. Please try again'});
    console.log(err);
  }
})

router.post('/register/user/:teamId', async (req,res) => {
  try{
    const teamId = req.params.teamId;
    const {username, name, password, confirmPassword, position, email, phoneNumber, managerName} = req.body;
    const dupeUsername = await Users.findOne({where: {username: username }});
    const dupeEmail = await Users.findOne({where: {email: email }});

      if (!username || !name || !password || !email || !phoneNumber){
            res.status(400).json({ error: "All field must be fill"});
        }
            else if (dupeUsername){
            res.status(400).json({ error: "Username is already taken"});
        }
            else if (dupeEmail){
            res.status(400).json({ error: "Email is already taken"});
        }
            else if (password != confirmPassword){
                res.status(400).json({ error: "Password and confirm password does not match"});
            }else {

              const hashedPass = bcrypt.hashSync(password, 10);

             const createUser = async () => {
              await Users.create({
                username: username,
                name: name,
                password: hashedPass,
                email: email,
                phoneNumber: phoneNumber,
                isValidate: 1
              })
             } 

            const createMember = async () => {
              await msmart_teamManager.create({
                username: username,
                nameInTeam: name,
                teamId: teamId,
                managerName: managerName,
                managerUsername: managerName,
                position: 'Member',
                isVerified: 1
              })
            } 

            const createManager = async () => {
              await msmart_teamManager.create({
                username: username,
                nameInTeam: name,
                teamId: teamId,
                managerName: managerName,
                managerUsername: managerName,
                position: 'Manager',
                isVerified: 1
              })
            }

            const createTeamLeader = async () => {
              await msmart_teamManager.create({
                username: username,
                nameInTeam: name,
                teamId: teamId,
                managerName: managerName,
                managerUsername: managerName,
                position: 'Manager & Member',
                isVerified: 1
              })
            } 


            if (position === 'Member'){
              await createUser();
              await createMember();
            }else if (position === 'Manager'){
              await createUser();
              await createManager();
            }else {
              await createUser();
              await createTeamLeader();
            }
                    
        res.status(200).json({success: 'User registered successfully!'});
                  



    }
  }catch(error){
    res.status(400).json({error: 'Unable to create user. Please try again'});
    console.log(error);
  }
})

//Stats

router.post('/stats/individual/:teamId', validateToken, async (req, res) => {
  try {
    const { startDate, endOfDate } = req.body;
    const teamId = parseInt(req.params.teamId, 10);
    const username = req.user.username;

    const endDate = new Date(endOfDate);
    endDate.setHours(23, 59, 59, 999);

    const filters = { username, teamId, startDate, endDate };

    const followUpScheduled = await getFollowUpScheduledCount(filters);

    const [
      totalLeadsAdded,
      totalPresentations,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    ] = await Promise.all([
      getTotalLeadsAdded(filters),
      getTotalPresentations(filters),
      getFinalStatusCountInRange(filters),
      getAverageFollowUpPerLead(filters),
      getFollowUpPerCloseRatio(filters),
      getBookingToClosedRate(filters),
      getBookingToRejectedRate(filters),
      getSalesGapSummary({ username, startDate, endDate })
    ]);
    
    // Guna logs dari followUpScheduled
    const followUpToClosedRate = await getFollowUpToClosedRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    const followUpToRejectedRate = await getFollowUpToRejectedRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    const followUpToBookingRate = await getFollowUpToBookingRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    
    


    res.json({
      totalLeadsAdded,
      totalPresentations,
      followUpScheduled,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    });
  } catch (err) {
    console.error('❌ Error in /stats/individual:', err);
    res.status(500).json({ error: 'Failed to generate individual stats' });
  }
});

router.post('/stats/manager/:teamId', validateToken, async (req, res) => {
  try {
    const { startDate, endOfDate } = req.body;
    const teamId = parseInt(req.params.teamId, 10);
    const managerUsername = req.user.username;

    const endDate = new Date(endOfDate);
    endDate.setHours(23, 59, 59, 999);

    const filters = { teamId, managerUsername, startDate, endDate };

    const followUpScheduled = await getFollowUpScheduledCountManager(filters);

    const [
      totalLeadsAdded,
      totalPresentations,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    ] = await Promise.all([
      getTotalLeadsAddedManager(filters),
      getTotalPresentationsManager(filters),
      getFinalStatusCountInRangeManager(filters),
      getAverageFollowUpPerLeadManager(filters),
      getFollowUpPerCloseRatioManager(filters),
      getBookingToClosedRateManager(filters),
      getBookingToRejectedRateManager(filters),
      getSalesGapSummaryManager(filters)
    ]);

    // Guna followUpLogs untuk 3 fungsi followUp-to-X
    const followUpToClosedRate = await getFollowUpToClosedRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    const followUpToRejectedRate = await getFollowUpToRejectedRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    const followUpToBookingRate = await getFollowUpToBookingRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    res.json({
      totalLeadsAdded,
      totalPresentations,
      followUpScheduled,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    });
  } catch (err) {
    console.error('❌ Error in /stats/manager:', err);
    res.status(500).json({ error: 'Failed to generate manager stats' });
  }
});

router.post('/stats/manager/individual/:teamId', validateToken, async (req, res) => {
  try {
    const { startDate, endOfDate, username} = req.body;
    const teamId = parseInt(req.params.teamId, 10);

    const endDate = new Date(endOfDate);
    endDate.setHours(23, 59, 59, 999);

    const filters = { username, teamId, startDate, endDate };

    const followUpScheduled = await getFollowUpScheduledCount(filters);

    const [
      totalLeadsAdded,
      totalPresentations,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    ] = await Promise.all([
      getTotalLeadsAdded(filters),
      getTotalPresentations(filters),
      getFinalStatusCountInRange(filters),
      getAverageFollowUpPerLead(filters),
      getFollowUpPerCloseRatio(filters),
      getBookingToClosedRate(filters),
      getBookingToRejectedRate(filters),
      getSalesGapSummary({ username, startDate, endDate })
    ]);
    
    // Guna logs dari followUpScheduled
    const followUpToClosedRate = await getFollowUpToClosedRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    const followUpToRejectedRate = await getFollowUpToRejectedRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    const followUpToBookingRate = await getFollowUpToBookingRate({ username, startDate, endDate, followUpLogs: followUpScheduled.logs });
    
    


    res.json({
      totalLeadsAdded,
      totalPresentations,
      followUpScheduled,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    });
  } catch (err) {
    console.error('❌ Error in /stats/individual:', err);
    res.status(500).json({ error: 'Failed to generate individual stats' });
  }
});

router.post('/stats/team/:teamId', async (req, res) => {
  try {
    const { startDate, endOfDate } = req.body;
    const teamId = parseInt(req.params.teamId, 10);
    const endDate = new Date(endOfDate);
    endDate.setHours(23, 59, 59, 999);

    const filters = { teamId, startDate, endDate };

    // Step 1: Kira follow up dulu untuk guna dalam 3 fungsi lain
    const followUpScheduled = await getFollowUpScheduledCountTeam(filters);

    // Step 2: Extract logs & pass to XRate
    const logs = followUpScheduled.logs || [];

    const [
      totalLeadsAdded,
      totalPresentations,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    ] = await Promise.all([
      getTotalLeadsAddedTeam(filters),
      getTotalPresentationsTeam(filters),
      getFinalStatusCountInRangeTeam(filters),
      getAverageFollowUpPerLeadTeam(filters),
      getFollowUpPerCloseRatioTeam(filters),
      getFollowUpToClosedRateTeam({ followUpLogs: logs, teamId, startDate, endDate }),
      getFollowUpToRejectedRateTeam({ followUpLogs: logs, teamId, startDate, endDate }),
      getFollowUpToBookingRateTeam({ followUpLogs: logs, teamId, startDate, endDate }),
      getBookingToClosedRateTeam(filters),
      getBookingToRejectedRateTeam(filters),
      getSalesGapSummaryTeam(filters)
    ]);

    res.json({
      totalLeadsAdded,
      totalPresentations,
      followUpScheduled,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    });
  } catch (err) {
    console.error('❌ Error in /stats/team:', err);
    res.status(500).json({ error: 'Failed to generate team stats' });
  }
});

router.post('/stats/team/manager/:teamId', validateToken, async (req, res) => {
  try {
    const { startDate, endOfDate, managerUsername } = req.body;
    const teamId = parseInt(req.params.teamId, 10);

    const endDate = new Date(endOfDate);
    endDate.setHours(23, 59, 59, 999);

    const filters = { teamId, managerUsername, startDate, endDate };

    const followUpScheduled = await getFollowUpScheduledCountManager(filters);

    const [
      totalLeadsAdded,
      totalPresentations,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    ] = await Promise.all([
      getTotalLeadsAddedManager(filters),
      getTotalPresentationsManager(filters),
      getFinalStatusCountInRangeManager(filters),
      getAverageFollowUpPerLeadManager(filters),
      getFollowUpPerCloseRatioManager(filters),
      getBookingToClosedRateManager(filters),
      getBookingToRejectedRateManager(filters),
      getSalesGapSummaryManager(filters)
    ]);

    // Guna followUpLogs untuk 3 fungsi followUp-to-X
    const followUpToClosedRate = await getFollowUpToClosedRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    const followUpToRejectedRate = await getFollowUpToRejectedRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    const followUpToBookingRate = await getFollowUpToBookingRateManager({
      ...filters,
      followUpLogs: followUpScheduled.logs
    });

    res.json({
      totalLeadsAdded,
      totalPresentations,
      followUpScheduled,
      finalStatus,
      avgFollowUpPerLead,
      followUpPerCloseRatio,
      followUpToClosedRate,
      followUpToRejectedRate,
      followUpToBookingRate,
      bookingToClosedRate,
      bookingToRejectedRate,
      salesGapSummary
    });
  } catch (err) {
    console.error('❌ Error in /stats/manager:', err);
    res.status(500).json({ error: 'Failed to generate manager stats' });
  }
});

//LeadForm

router.get('/lead-form/:customUrl', async (req, res) => {
  try {
    const { customUrl } = req.params;

    const form = await msmart_leadForm.findOne({ where: { customUrl } });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/lead-forms/:teamId', validateToken, async (req, res) => {
  try {
    const username = req.user.username;

    const forms = await msmart_leadForm.findAll({
      where: { username },
      order: [['createdAt', 'DESC']]
    });

    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/lead-form', validateToken, formImgUpload.single('formImage'), async (req, res) => {
  try {
      const {
          teamId, formTitle, formDescription, formTheme, customUrl,
          formConfig, thankYouEnabled, thankYouPageMessage, redirectEnabled,
          redirectUrl, autoRedirect, pixelMeta, pixelTiktok, pixelGoogleAds
      } = req.body;
      const username = req.user.username;

      if (!username || !formTitle || !formDescription || !formTheme || !customUrl || !formConfig || !teamId) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      let parsedConfig;
      try {
          parsedConfig = JSON.parse(formConfig);
      } catch (e) {
          return res.status(400).json({ error: 'Invalid form configuration format' });
      }

      const existing = await msmart_leadForm.findOne({ where: { customUrl } });
      if (existing) {
          return res.status(409).json({ error: 'Custom URL already in use' });
      }

      // #CHANGED# - Get the secure URL directly from req.file.path provided by Cloudinary
      const formImage = req.file ? req.file.path : null;

      const newForm = await msmart_leadForm.create({
          username,
          teamId,
          formTitle,
          formDescription,
          formTheme,
          customUrl,
          formConfig: parsedConfig,
          formImage, // Save the full Cloudinary URL
          enabledThankYouPage: thankYouEnabled === 'true',
          thankYouPageMessage,
          enabledRedirect: redirectEnabled === 'true',
          redirectUrl,
          isAutoRedirect: autoRedirect === 'true',
          pixelMeta,
          pixelTiktok,
          pixelGoogleAds
      });

      res.status(201).json({ message: 'Form created successfully', form: newForm });

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});

router.get('/lead-form/:formId/submissions', validateToken, async (req, res) => {
  const { formId } = req.params;
  try {
    const submissions = await msmart_leadFormSubmission.findAll({
      where: { formId },
      order: [['createdAt', 'DESC']], // 🔥 SUSUN BY LATEST
      raw: true,
    });
    
    
    const msmartleadIds = submissions.map(sub => sub.msmartleadId);
    
    // Dapatkan semua msmartleads yang berkaitan
    const relatedLeads = await msmartleads.findAll({
      where: { id: msmartleadIds },
      raw: true,
    });
    
    // Gabungkan dua data secara manual
    const mergedSubmissions = submissions.map(sub => {
      const lead = relatedLeads.find(l => l.id === sub.msmartleadId);
      return {
        ...sub,
        msmartlead: lead || null,
      };
    });
    
    res.json(mergedSubmissions);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

router.put("/lead-form/:formId", validateToken, formImgUpload.single("formImage"), async (req, res) => {
  const { formId } = req.params;
  const {
      formTitle, formDescription, formTheme, customUrl,
      enabledThankYouPage, thankYouPageMessage, enabledRedirect,
      redirectUrl, isAutoRedirect, pixelMeta, pixelTiktok, pixelGoogleAds,
  } = req.body;

  try {
      let formConfig = JSON.parse(req.body.formConfig || "[]");
      
      const newImagePath = req.file ? req.file.path : null;

      const existingForm = await msmart_leadForm.findByPk(formId);
      if (!existingForm) {
          return res.status(404).json({ error: "Form not found" });
      }

      const oldImagePath = existingForm.formImage;

      // #IMPROVED# - Safer logic to delete the OLD image from Cloudinary
      // It now checks if a new image is uploaded AND if the old path is a valid Cloudinary URL
      if (newImagePath && oldImagePath && oldImagePath.includes('cloudinary.com')) {
          try {
              // A more robust way to extract the public_id
              const folderPath = 'msmart/form-images/';
              // Find the start of the folder path in the URL
              const startIndex = oldImagePath.indexOf(folderPath);
              
              if (startIndex !== -1) {
                  // Get the substring from the folder path to the end
                  let publicId = oldImagePath.substring(startIndex);
                  // Remove the file extension (e.g., .webp, .jpg)
                  publicId = publicId.substring(0, publicId.lastIndexOf('.'));
                  
                  await cloudinary.uploader.destroy(publicId);
                  console.log("✅ Successfully deleted old image from Cloudinary:", publicId);
              }
          } catch (deleteErr) {
              console.error("❌ Failed to delete old image from Cloudinary:", deleteErr);
              // We don't stop the process, just log the error
          }
      }

      await existingForm.update({
          formTitle,
          formDescription,
          formTheme,
          customUrl,
          formImage: newImagePath || oldImagePath, // Use new image if available, otherwise keep the old one
          formConfig,
          enabledThankYouPage: enabledThankYouPage === 'true', // Ensure boolean conversion
          thankYouPageMessage,
          enabledRedirect: enabledRedirect === 'true', // Ensure boolean conversion
          redirectUrl,
          isAutoRedirect: isAutoRedirect === 'true', // Ensure boolean conversion
          pixelMeta,
          pixelTiktok,
          pixelGoogleAds,
      });

      res.json({ success: true, message: "Form updated successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during form update" });
  }
});

router.delete('/lead-form/:id', validateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const { id } = req.params;

    const form = await msmart_leadForm.findOne({ where: { id, username } });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or unauthorized' });
    }

    await form.destroy();
    res.json({ message: 'Form deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/lead-form/submit', async (req, res) => {
  try {
      const { customUrl, data } = req.body;

      if (!customUrl || !data || !data.phone || !data.countryCode) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const form = await msmart_leadForm.findOne({ where: { customUrl } });
      if (!form) {
          return res.status(404).json({ error: 'Form not found' });
      }
      
      // #ADDED# - New check for duplicate submission on this specific form
      // -------------------------------------------------------------------
      const { phone } = data;
      const formId = form.id;
      
      const existingSubmission = await msmart_leadFormSubmission.findOne({
          where: {
              formId: formId,
              // We need to query inside the JSON 'answers' field
              [Op.and]: [
                  Sequelize.where(Sequelize.json('answers.phone'), phone)
              ]
          }
      });
      
      if (existingSubmission) {
          return res.status(409).json({ error: 'This phone number has already been submitted on this form.' });
      }
      // -------------------------------------------------------------------
      // #END OF ADDED LOGIC#

      const { username, teamId } = form;
      const { name: dataName, countryCode, extra, desc } = data;
      const name = dataName || `${customUrl} Lead`;
      const extraFields = extra || {};

      // Step 1: Find all potential existing leads for this phone, user, and team
      const existingLeads = await msmartleads.findAll({
          where: { phone, username, teamId },
          order: [['updatedAt', 'DESC']] // Order by latest update first
      });

      let processedLead;
      let actionType = 'add'; // Default action is 'add'

      const newRemarkContent = `[${customUrl}]\n${Object.entries(extraFields).map(([key, value]) => `${key}: ${value}`).join("\n")}`;

      if (existingLeads.length > 0) {
          // If one or more leads exist, we will UPDATE the most recent one
          actionType = 'update';
          const leadToUpdate = existingLeads[0]; // The first one is the latest

          // To preserve history, we append the new remark to the old one
          const updatedRemark = `---- (New Form Submission) ----\n${newRemarkContent}\n\n ---- (Previous Remark) ----\n${leadToUpdate.remark}`;

          await leadToUpdate.update({
              name: name, // Update name with the latest from form
              remark: updatedRemark,
              status: 'No Status' // Reset status for the new submission
          });
          processedLead = leadToUpdate;

      } else {
          // If no lead exists, we CREATE a new one (original behavior)
          processedLead = await msmartleads.create({
              username,
              teamId,
              name,
              country: countryCode,
              phone,
              status: 'No Status',
              remark: newRemarkContent
          });
      }

      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Create the submission log, using the ID from the processed lead
      await msmart_leadFormSubmission.create({
          msmartleadId: processedLead.id,
          formId: formId,
          answers: { countryCode, phone, name: dataName, ...extraFields },
          desc: { ...desc, ip: ipAddress, browser: userAgent }
      });

      // Create the activity log with a dynamic actionType
      await msmart_structuredActivity.create({
          username,
          msmartleadId: processedLead.id,
          teamId,
          actionType: actionType, // This will be either 'add' or 'update'
          statusAfter: 'No Status',
          remarkChange: true, // Remark was definitely added or updated
      });

      res.status(201).json({
          message: `Lead ${actionType === 'add' ? 'submitted' : 'updated'} successfully`,
          lead: processedLead
      });

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;