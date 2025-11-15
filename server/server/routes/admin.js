const express = require('express');
const app = express();
const router = express.Router();
const { sign } = require('jsonwebtoken');
const fs = require('fs');
const {Users, msmart_teamManager } = require('../models');
const { validateAdmin } = require('../middlewares/AuthMiddleware');
require('dotenv').config();

router.post("/login", async (req, res) => {

    const {username, password} = req.body;
    const login = process.env.ADMIN_LOGIN
    const pass = process.env.ADMIN_PASS
    if(!username){
        res.json({error: "Please enter a username"});
    }
    else if (!password){
        res.json({error: "Password cannot be blank"});
    }
    else if (username != login){
        res.json({ error : "Admin doesnt exist" });
    }else if (password != pass){
        res.json({ error : "Wrong password" });
    }else{
        const adminToken = sign({ login:login, pass:pass}, process.env.JWT_SECRET);
        res.json({adminToken: adminToken})
    }
});

router.post("/register", async (req,res) => {

    const {username, name, password, confirmPassword, email, phoneNumber} = req.body;
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
            }
        else{
            const uservalid = 0;
            bcrypt.hash(password, 10).then((hash) => {
            Users.create({
                username: username,
                name: name,
                password: hash,
                email: email,
                phoneNumber: phoneNumber,
                isValidate: uservalid
                        }).then( async () => {
                        res.status(200).json({status: "User registered successfully"})
                        }).catch((error) => {
                            res.status(500).json({error: "Error registering user"})
                        })
    })
}
});

router.get("/auth", validateAdmin, (req, res) => {
    res.json(req.admin)
});

router.get('/getuser', validateAdmin, async (req,res) => {
    try{

        const users = await Users.findAll();
        const teams = await msmart_teamManager.findAll();

        const usersWithTeams = users.map(user => {
            // Cari team untuk user berdasarkan username
            const userTeams = teams.find(team => team.username === user.username);

            
        
            return {
                ...user.toJSON(), // Convert Sequelize instance ke plain object
                teams: userTeams || {}, // Tambah maklumat team
            };
        });

        res.json(usersWithTeams);
        

        

    }catch(err){
        console.log(err)
    }

});

router.get('/getmanager', validateAdmin, async (req,res) => {
let users = [];
let managers = [];

try{

const user = await Users.findAll();
users = user; 


const manager = await Managers.findAll();
for (let i = 0; i < manager.length; i++) {
    managers.push(parseInt(manager[i].UserId, 10));
}


const updatedUsers = users.filter(item => managers.includes(item.id));


res.json({data: updatedUsers});

}catch(error){
    res.json({error: 'Unable to receive managers'})
}

});

router.get('/exclude/manager', validateAdmin, async (req,res) => {

let users = [];
let managers = [];

// Ambil semua pengguna
const user = await Users.findAll();
users = user; // Simpan pengguna terus ke dalam users

// Ambil semua pengurus
const manager = await Managers.findAll();
for (let i = 0; i < manager.length; i++) {
    // Ambil UserId dari setiap pengurus
    managers.push(parseInt(manager[i].UserId, 10));
}

// Filter pengguna yang tidak ada dalam senarai pengurus
const updatedUsers = users.filter(item => !managers.includes(item.id));

// Hantar response dengan pengguna yang telah dikemaskini
res.json(updatedUsers);

});

router.get('/getuser/:user', validateAdmin, async (req,res) => {
    const getuser = req.params.user;

    try{
        const user = await Users.findOne({where: {username:getuser}});
        const team = await msmart_teamManager.findOne({where: {username: getuser}});
        res.json({user:user, team:team});
    }catch(error){
        res.json({error:error})
    }
    
});

router.get('/get/unvalidate/users', validateAdmin, async (req,res) => {
    try{
        const allUser = await Users.findAll({where: {isValidate: 0}});
        res.json({users: allUser});
    }catch(error){
        res.json({error: "Connection to the server failed"});
    }

})

router.get('/approve/:userid', validateAdmin, async (req,res) => {
    try{
        const userid = req.params.userid;
        await Users.update({isValidate: 1}, {where: {id: userid}}).then(() => {
            res.json({success: 'user approved'});
        })
    }catch(error){
        res.json({error: error});
    }
});

router.get('/delete/approval/:userid', validateAdmin, async (req,res) => {
    try{
        const userid = req.params.userid;
        const user = await Users.findOne({where: {id: userid}});
        const deleteUser = await Users.destroy({where:{id: userid}});
        const deleteTeam = await msmart_teamManager.destroy({where:{username: user.username}});

        if(deleteUser && deleteTeam){
            res.json({success: 'User deleted'});
        }
    }catch(error){
        res.json({error: error});
    }
});


router.put('/user/update/', validateAdmin, async (req,res) => {
    const {username, phoneNumber, email} = req.body;
    try{
        Users.update({
            phoneNumber:phoneNumber,
            email: email,
        }, {where: {username:username}}).then(() => {
            res.json({status: "User updated successfully"})
        })
    }catch(error){
        res.json({error:error})
    }
})

router.delete('/manager/:uid', validateAdmin, async (req,res) => {
    const uid = req.params.uid;
    console.log(uid)
    try{

        await Managers.destroy({where: {UserId: uid}}).then(() => {
            res.json({success: "Manager deleted successfully"})
        })

    }catch(error){
        console.log(error)
        res.json({error: "Unable to delete manager"})
    }
})


module.exports = router;