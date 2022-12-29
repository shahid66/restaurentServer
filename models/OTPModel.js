const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
email:{type:String},
otp:{type:String},
status:{type:Number,default:0},

createdDate:{type:Date,default:Date.now()},
expiresAt: {
    type: Date,
    required: true,
  },
},{ timestamps: true,versionKey: false });

const OTPModel=mongoose.model('otps',DataSchema);
module.exports=OTPModel;