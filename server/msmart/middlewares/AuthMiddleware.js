const { verify } = require('jsonwebtoken');
require('dotenv').config();
const {Users} = require('../models')

const validateToken = async (req, res, next) => {
    const accessToken = req.header("accessToken");

    if (!accessToken) {
        return res.status(401).json({ error: "User not Logged In" });
    }

    try {
        const validToken = verify(accessToken, process.env.JWT_SECRET);
        req.user = validToken;
        const userData = await Users.findOne({ where: { id: validToken.id } });

        if (!userData || userData.isValidate === 0 || userData.isValidate === false) {
            return res.status(403).json({ error: "Subscription expired. Please renew." });
        }

        next(); // Jika user valid, teruskan ke API
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

const validateAdmin = (req, res, next) => {
    const adminToken = req.header("adminToken");

    if (!adminToken) {
    return res.json({ error: "Unauthorized User"});
    }
    try{
        const validToken = verify(adminToken, process.env.JWT_SECRET);
        req.admin = validToken;
        if (validToken){
            return next();
        }
    }catch (err){
        return res.json({ error: err })
    }
};

const verifyToken = (req, res, next) => {
    const valToken = req.header("valToken");

    if (!valToken) {
    return res.json({ error: "User user not validate"});
    }
    try{
        const verifiedToken = verify(valToken, process.env.JWT_ACCESS);
        req.user = verifiedToken;
        if (verifiedToken){
            return next();
        }
    }catch (err){
        return res.json({ error: err })
    }
};

module.exports = {validateToken, verifyToken, validateAdmin};