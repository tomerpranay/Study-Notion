const mongoose = require("mongoose")
const courseProgress = new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    completedVideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"subsection"
    }],  userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
})

module.exports=mongoose.model("courseProgress",courseProgress)