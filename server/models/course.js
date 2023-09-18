const mongoose = require("mongoose")
const courseSchema = new mongoose.Schema({
    coursename:{
        type:String
    },
    coursedesp:{
        type:String,
        trim:true
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatyouwilllearn:{
        type:String
    },
    coursecontent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"section",
        
    }],
    ratingandreviw:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingandReview",
    }],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String
    },
    tag:{
        type:[String],
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    studentenrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    inctructions:{
        type:[String]
    },
    status:{
        type:String,
        enum:["Draft","Publish"]
    },
    createdAt: {
		type:Date,
		default:Date.now
	},
})

module.exports=mongoose.model("course",courseSchema)