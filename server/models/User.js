const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    ID:{
        type:String
    },
    FirstName: {
        type: String,
        required: true,
        trim: true,
    },
    LastName: {
        type: String,
        required: true,
        trim: true,
    },
    token:{
        type:String
    },
    resetpasswordexpires:{
        type:Date
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,

    },
    
    accounttype: {
        type: String,
        required: true,
        enum: ["Admin", "Student", "Instructor"]
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
     
        ref: "Profile"
    },
    courses:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "course"
    }],
    image:{
        type:String,
        required:true
    },
    courseProgress:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress"
    }],
    contactnumber:{
        type:Number,
        
    },
    

})

module.exports=mongoose.model("User",userSchema)