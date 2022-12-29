const asyncHandler =require('express-async-handler')
const User = require('../models/UserModel')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

exports.protect=asyncHandler(async(req,res,next)=>{
    try {
       
        let token=req.headers.token;
       
    if(!token){
        res.status(401)
        throw new Error("Not authorized")
    }

    const verified=jwt.verify(token,process.env.JWT_SECRET)
    
    let user=await User.findById(verified.id).select("-password")

    if(!user){
        res.status(401)
        throw new Error("User not found") 
    }
    
    req.headers.user=user
    next();
    
    } catch (error) {
        res.status(401)
        throw new Error("Not authorized")
    }
})