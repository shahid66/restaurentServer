const asyncHandler =require('express-async-handler')
const User = require('../models/UserModel')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const OTPModel = require('../models/OTPModel')

exports.test=(req,res)=>{
res.status(200).json({
    message:"Hello world"
})
}

const generateToken=(id)=>{
return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"1d"})
}

exports.register= asyncHandler(async(req,res)=>{
   
    const {email,name,password}=req.body
    if(!name||!email||!password){
        res.status(400)
        throw new Error ("Please fill in all required fields")
    }
    if(password.length < 6){
        res.status(400)
        throw new Error ("Please insert more then 6 characters")  
    }

    const userExists = await User.findOne({email})

    if(userExists){
        res.status(400)
        throw new Error ("Email has already been registered") 
    }

    const user =await User.create({
        name,
        email,
        password
    })

    const token=generateToken(user._id)

    res.cookie("token",token, {
        path:"/",
        httpOnly:true,
        expires:new Date(Date.now()+ 1000 * 86400),
        sameSite:"none",
        
    })

    if(user){

        
        const {_id,name,email,photo,phone}=user
        res.status(201).json({
            _id,
            name,email,photo,phone,token,

            
        })
    }else{
        res.status(400)
        throw new Error ("Invalid User data")
    }


})

exports.login=asyncHandler(async (req,res)=>{
    const {email,password}=req.body

    if(!email|| !password){
        res.status(400)
        throw new Error ("Please add email and password")
    }

    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error ("User not found") 
    }
    const passwordIsCorrrect= await bcrypt.compare(password,user.password)

    const token=generateToken(user._id)

    // res.cookie("token",token, {
    //     path:"/",
    //     httpOnly:true,
    //     expires:new Date(Date.now()+ 1000 * 86400),
    //     sameSite:"none",
        
    // })

     

    if(user && passwordIsCorrrect){
        const {_id,name,email,photo,phone}=user
          
          res
            .status(200)
            .json({ status: "success", token: token, data:{_id,name,email,photo,phone} });
    }else{
        res.status(400)
        throw new Error ("Invalid Email or Password") 
    }
})

exports.logout=asyncHandler(async(req,res)=>{
    res.cookie("token","", {
        path:"/",
        httpOnly:true,
        expires:new Date(0),
        sameSite:"none",
        secure:true
    })
    return res.status(200).json({message:"Log Out successful"})
})

exports.getUser=asyncHandler(async(req,res)=>{
    let user = req.headers["user"];
    
    const userData=await User.findById(user._id)

    if(userData){
        const {_id,name,email,photo,phone}=userData
        res.status(200).json({
            _id,name,email,photo,phone
        })
    }else{
        res.status(400)
        throw new Error ("User not Found")
    }
})

exports.loggedin=asyncHandler(async(req,res)=>{
    const token= req.cookies.token
    if(!token){
        return res.json(false)
    }
    const verified=jwt.verify(token,process.env.JWT_SECRET)
    if(verified){
        return res.json(true) 
    }
    
})

exports.updateUser=asyncHandler(async(req,res)=>{
    let user = req.headers["user"];
    const userData =await User.findById(user._id)

    if(userData){
        const {_id,name,email,photo,phone}=userData

        userData.email=email;
        userData.name=req.body.name||name;
        userData.phone=req.body.phone||phone;
        userData.photo=req.body.photo||photo;

        const updateUser= await user.save()

        res.status(200).json({
            _id:updateUser._id,name:updateUser.name,email:updateUser.email,photo:updateUser.photo,phone:updateUser.phone
        })
      
    }else{
        res.status(404)
        throw new Error ("User not Found")
    }
})

exports.changepassword=asyncHandler(async(req,res)=>{
    let user = req.headers["user"];
    const userData =await User.findById(user._id)

    const {oldPassword,password}=req.body;

    if(!userData){
        res.status(400)
        throw new Error ("User not found")
    }

    if(!oldPassword || !password){
        res.status(400)
        throw new Error ("Insert all required filed data")
    }

    const passwordIsCorrrect= await bcrypt.compare(oldPassword,user.password)

    if(userData && passwordIsCorrrect){
        userData.password=password
        await userData.save()
        res.status(200).json({
            message:"Password change successfull"
        })
    }else{
        res.status(400)
        throw new Error ("Old password is incorrect")
    }

})

exports.recoveryEmail = async (req, res) => {
    let email = req.params.email;
    let OTPCode = Math.floor(10000 + Math.random() * 900000);
    let expiresAt= Date.now() + 30 * (60 * 1000) // Thirty minutes
  
    try {
      //Email Query
      let UserCount = await UsersModel.aggregate([
        { $match: { email: email } },
        { $count: "total" },
      ]);
  
      if (UserCount[0].total > 0) {
        //OTP insert
        let CreateOTP = await OTPModel.create({ email: email, otp: OTPCode,expiresAt:expiresAt });
        //Email send
        let SendMail = await EmailUtility(
          email,
          "Your PIN Code= " + OTPCode,
          "Task Manager PIN Verification"
        );
  
        res.status(200).json({ status: "success", data: SendMail });
      } else {
        res.status(200).json({ status: "fail", data: "No User Found" });
      }
    } catch (e) {
      res.status(200).json({ status: "fail", data: e });
    }
  };
  
  exports.RecoveryVerifyOTP = async (req, res) => {
    let email = req.params.email;
    let OTP = req.params.OTP;
    let status=0;
    let UpdateStatus=1;
    
  
    try {
      //Email Query
      let CountOTP = await OTPModel.aggregate([{$match:{email:email, otp: OTP,status:status  }},{$count:'total'}]);
  
      if (CountOTP[0].total >  0) {
        //OTP Update
       let UpdateOTPStatus= await OTPModel.updateOne({email:email, otp: OTP,status:status},{email:email, otp: OTP,status:UpdateStatus})
       
  
        res.status(200).json({ status: "success", data: UpdateOTPStatus });
      } else {
        res.status(200).json({ status: "fail", data: "Invalid OTP" });
      }
    } catch (e) {
      res.status(200).json({ status: "failr", data: e });
    }
  };
  
  exports.CreatePassword = async (req, res) => {
    let email = req.body.email;
    let OTPCode=req.body.otp
    let password = req.body.password;
    let UpdateStatus=1;
    
  
    try {
      //Email Query
      let CountOTP = await OTPModel.aggregate([{$match:{email:email, otp: OTPCode,status:UpdateStatus  }},{$count:'total'}]);
  
      if (CountOTP[0].total >  0) {
        //OTP Update
       let UpdatePassword= await UsersModel.updateOne({email:email,},{password: password})
       
  
        res.status(200).json({ status: "success", data: UpdatePassword });
      } else {
        res.status(200).json({ status: "fail", data: "Invalid OTP" });
      }
    } catch (e) {
      res.status(200).json({ status: "failr", data: e });
    }
  };