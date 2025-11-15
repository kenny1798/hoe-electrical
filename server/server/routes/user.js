const express = require('express');
const router = express.Router();
const { Users, msmart_teamManager} = require('../models');
const {phoneFormat} = require('../middlewares/WhatsAppFormatter'); 
const bcrypt = require('bcrypt');
const fs = require('fs')
const { sign } = require('jsonwebtoken');
const { validateToken, verifyToken } = require('../middlewares/AuthMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
require('dotenv').config()


router.get("/username", validateToken, async (req,res) => {
    const username = req.user.username
    const user = await Users.findOne({where: {username: username}});
    res.json({user: user});
});

router.get("/validate", validateToken, (req, res) => {
    res.json(req.user)
});


// router.post("/signup", async (req,res) => {

//     const {username, name, password, confirmPassword, email, phoneNumber} = req.body;
//     const dupeUsername = await Users.findOne({where: {username: username }});
//     const dupeEmail = await Users.findOne({where: {email: email }});
//     const dupePhoneNumber = await Users.findOne({where: {phoneNumber: phoneFormat(phoneNumber) }});

//         if (!username || !name || !password || !email || !phoneNumber){
//             res.json({ error: "All field must be fill"});
//         }

//             else if (dupeUsername){
//             res.json({ error: "Username is already taken"});
//         }
//             else if (dupeEmail){
//                 res.json({ error: "Email is already taken"});
//             } 
//             else if (dupePhoneNumber){
//                 res.json({ error: "Mobile Number is already taken"});
//             }
//             else if (password != confirmPassword){
//                 res.json({ error: "Password and confirm password are to be the same"});
//             }
//         else{
//             const uservalid = 0;
//             bcrypt.hash(password, 10).then((hash) => {
//             Users.create({
//                 username: username,
//                 name: name,
//                 password: hash,
//                 email: email,
//                 phoneNumber: phoneNumber,
//                 isValidate: uservalid
//                         }).then( async () => {
//                         const user = await Users.findOne({ where: {username: username }});
//                         const accessToken = sign({ username: user.username, id: user.id, isValidate: user.isValidate}, process.env.JWT_SECRET);
//                         const loginUser = user.username;
//                         res.json({token: accessToken, username:loginUser})
//                         })
//     })
// }
// });

router.post("/login", async (req, res) => {

    const {username, password} = req.body;
    const user = await Users.findOne({ where: {username: username }});
    if(!username){
        res.json({error: "Please enter a username"})
    }
    else if (!password){
        res.json({error: "Password cannot be blank"})
    }
    else if (!user){
        res.json({ error : "User doesnt exist" });
    }else{
        bcrypt.compare(password, user.password).then((match) => {
        if (!match){ 
            res.json({ error: "Wrong password entered"});
    }else{
        if(user.isValidate === true){
            const accessToken = sign({ username: user.username, id: user.id, isValidate: user.isValidate}, process.env.JWT_SECRET);
            const validToken = sign({id: user.id, isValidate: user.isValidate}, process.env.JWT_ACCESS)
            const loginUser = user.username;
            res.json({token: accessToken, valToken: validToken, username:loginUser})
        }else{
            const accessToken = sign({ username: user.username, id: user.id, isValidate: user.isValidate}, process.env.JWT_SECRET);
            const loginUser = user.username;
            res.json({token: accessToken, username:loginUser})
        }
        }
            
    })}})


router.get("/auth", validateToken, (req, res) => {
    res.json(req.user)
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
      // Save token and expiry to user
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = resetPasswordExpires;
      await user.save();
  
      // Send reset email
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASS,
        },
      });
  
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
      const message = `
        <h1>Password Reset Request</h1>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `;
  
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset',
        html: message,
      });
  
      res.json({ message: 'Email sent' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending email' });
      console.log(error)
    }
  });

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
    try {
      const user = await Users.findOne({
        where: {
          resetPasswordToken,
          resetPasswordExpires: { [Op.gt]: Date.now() },
        },
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

    bcrypt.hash(password, 10).then(async (hash) => {
        user.password = hash; // You can hash password here if needed
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      res.json({ message: 'Password updated' });
})
  

      
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password' });
      console.log(error)
    }
  });

router.post("/change/password", validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const {currPass, newPass, ConfirmNewPass} = req.body;
        console.log(newPass, ConfirmNewPass)
        const user = await Users.findOne({where: {username:username}});
        if(!currPass || !newPass || !ConfirmNewPass){
            res.json({error:"Field cannot be blank"});
        }else if(newPass != ConfirmNewPass){
            res.json({error:"New password confirmation does not match"})
        }else{
            bcrypt.compare(currPass, user.password).then((match) => {
                if(!match){
                    res.json({error:"Incorrect current password"})
                }else{
                    bcrypt.hash(newPass, 10).then( async (hash) => {
                        await Users.update({password: hash}, {where:{username:username}}).then(() => {
                            res.json({success:"Password updated successfully"})
                        })
                    })
                }
            })
        }
    }catch(err){
        console.log(err)
    }
})

router.post("/forgot-password", async (req,res) => {
try{
    const {username, email} = req.body;
    const checkUser = await Users.findOne({where: {username: username}});
    const userEmail = await checkUser.email;
    if(!checkUser){
        res.json({error: `We couldn't find a user with username ${username}`})
    }else if(email != userEmail){
        res.json({error: "Email address is incorrect"})
    }else{
        const secret = JWT_SECRET + checkUser.password;
        const token = sign({email: email, id: checkUser.id}, secret, {expiresIn:'10m'});
        const link = process.env.CLIENT + `${checkUser.id}/${token}`
    }
}catch(err){

console.log(err)

}
})

router.get('reset-password/:id/:token', async (req,res) => {
    const {id, token} = req.params;
    const checkUser = await Users.findOne({where: {id: id}});
    if(!checkUser){
        res.json({status:"No", error:"We couldn't verify link for this user"})
    }
})

router.put("/change/email", validateToken, async (req,res) => {
    const username = req.user.username;
    const {newEmail, confirmEmail} = req.body;
    const checkEmail = await Users.findOne({where: {email: newEmail}})
    console.log(`${username} : ${newEmail} : ${confirmEmail}`)
    if(!newEmail){
        res.json({error: "New Email field cannot be blank!"});
    }else if(!confirmEmail){
        res.json({error: "Confirm Email field cannot be blank!"});
    }else if(checkEmail){
        res.json({error: `User with email ${newEmail} existed!`});
    }
    else if(newEmail != confirmEmail){
        res.json({error: "Incorrect confirm email address!"})
    }else{
        try{
            Users.update({email: newEmail},  {where: {username:username}}).then(() => {
                res.json({success: "Email successfully updated!"})
            })
        }catch(error){
            res.json({error: "Can't update email address, please try again."});
        }  
    }
})


module.exports = router;