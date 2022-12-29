const mongoose = require("mongoose");
const bcrypt=require('bcrypt')

const userSchema = mongoose.Schema({
  name: { type: String, required: [true, "Please add a name"] },
  email: {
    type: String,
    required: [true, " Please add a Email"],
    unique: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  password: { type: String, required: [true, "Please add a Password"],
  minLength:[6," Password must be up to 6 characters"]
 },
 photo:{type:String,default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"},
 phone:{type:String,default:"017"}
},{ timestamps: true,versionKey: false });

userSchema.pre("save", async function(next){

  if(!this.isModified("password")){
return next()
  }

  const salt =await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(this.password,salt)
  this.password=hashedPassword;
  next()
})
const User = mongoose.model("user", userSchema);
module.exports = User;
