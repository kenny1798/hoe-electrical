const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = parseInt(process.env.SERVER_PORT, 10);
const db = require('./models');
const fs = require('fs');
const https = require('https')
const http = require('http');
const {Server} = require("socket.io");
const path = require('path');
const cron = require("node-cron");

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({
    extended: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sslKey = fs.readFileSync(path.resolve(__dirname, './localhost-key.pem'));
const sslCert = fs.readFileSync(path.resolve(__dirname, './localhost.pem'));

const server = https.createServer({ key: sslKey, cert: sslCert }, app);

const serverOrigins = ["https://localhost:3000"];

const io = new Server(server, {
    cors:{
        origin: serverOrigins,
        methods: ["GET", "POST", "PUT"],
    }
});

app.use((req, res, next) => {
    req.io = io;
    return next();
  });

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // Fail terlalu besar
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max 2MB allowed.' });
      }
    } else if (err.message === 'Only .jpg, .png, .webp allowed!') {
      // Jenis fail tak dibenarkan
      return res.status(400).json({ error: err.message });
    }
  
    // Fallback error
    console.error(err);
    return res.status(500).json({ error: 'Server error during file upload' });
  });


// Routers
const validateRouter = require('./routes/validate');
app.use("/api/validate", validateRouter);

const msmartRouter = require('./routes/msmart');
app.use("/api/msmart", msmartRouter);

const subRouter = require('./routes/pushsub');
app.use("/api/subscription", subRouter);


const { sendFollowUpNotifications } = require("./utils/sendFollowUpNotifications");
cron.schedule('* * * * *', async () => {
    await sendFollowUpNotifications();
  });
 

// Start server
db.sequelize.sync().then(() => {
    server.listen(port, () =>{
                console.log("Server running on port " + port);
    })

})





