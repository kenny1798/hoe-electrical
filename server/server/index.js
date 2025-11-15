const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = parseInt(process.env.SERVER_PORT, 10);
const db = require('./models');
const fs = require('fs');
const http = require('http');
const https = require('https');
const {Server} = require("socket.io");
const multer = require('multer');
const path = require('path');


app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('form_images'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });



const sslKey = fs.readFileSync(path.resolve(__dirname, './localhost-key.pem'));
const sslCert = fs.readFileSync(path.resolve(__dirname, './localhost.pem'));

const server = https.createServer(app);

const serverOrigins = ["https://msmart.cloud"];

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

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'form_images')
    },
    filename: (req, file, cb) =>{
        console.log(file)
        cb(null,"Mgen" + Date.now() + path.extname(file.originalname))
    }

});

const upload = multer({storage: storage});

// Routers
const usersRouter = require('./routes/user')
app.use("/api/user", usersRouter);

const validateRouter = require('./routes/validate');
app.use("/api/validate", validateRouter);

const msmartRouter = require('./routes/msmart');
app.use("/api/msmart", msmartRouter);

const adminRouter = require('./routes/admin');
app.use("/api/admin", adminRouter);

 

// Start server
db.sequelize.sync().then(() => {
    server.listen(port, () =>{
                console.log("Server running on port " + port);
    })

})





