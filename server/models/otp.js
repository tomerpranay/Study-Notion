const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailsender");
const otp = new mongoose.Schema({
   email:{
    type:String,
    required:true,
   },
   otp:{
    type:Number,
    required:true,
   },
   createdAt:{
    type:Date,
    default:Date.now(),
    expires:5*60,
   }

})
async function sendemail(email,otp) {
    try {
        const mailsender=await mailSender(email,"verification email from EduVantage",otp)
        console.log("email send succefully");
     
        
    } catch (error) {
        console.log("error occured while sending mails: ",error)
        throw error;
    }
}
otp.pre("save",async function  (next) {
    await sendemail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("OTP",otp) 