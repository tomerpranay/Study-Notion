const mongoose = require("mongoose")
const ratingandreview = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true,
    },
    review:{
        type:String,
        required:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,required:true,ref:"course"
    }
}
)
module.exports=mongoose.model("RatingandReview",ratingandreview)