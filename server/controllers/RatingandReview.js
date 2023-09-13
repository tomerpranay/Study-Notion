const RatingandReview = require("../models/ratingandReview")
const Course = require("../models/course")
const User = require("../models/User")
const { default: mongoose } = require("mongoose")


exports.createrating = async (req, res) => {
    try {
        const { rating, review, courseId } = req.body
        const userid = req.user.id
        const coursedetails = await Course.findOne({ _id: courseId }, {
            studentenrolled: { $elemMatch: { $eq: userid } }
        })
        
        if (!coursedetails){
            return res.status(403).json({
                success: false,
                message: "not enroooled in course"
            })
        }
        
        if (!RatingandReview.findOne({ user: userid }, { course: courseId })) {
            return res.status(403).json({
                success: false,
                message: "review already exist"
            })
        }
        const createRR = await RatingandReview.create({
            user: userid, course: courseId, rating: rating, review: review
        })
        
        await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                ratingandreviw: createRR._id
            }
        }, { new: true })
        return res.status(200).json({
            success: true,
            message: "ratinf and review successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.avgrating = async (req, res) => {
    try {
        const { courseId } = req.body
        const result = await RatingandReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success: true,
            averageRating: 0
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getallratingandreview = async (req, res) => {
    try {
        const allrating = await RatingandReview.find({}).sort({ rating: "desc" }).populate({
            path: "user",
            select: "FirstName LastName email image"
        }).populate({
            path: "course",
            select: "coursename"
        }).exec()
        return res.status(200).json({
            success:true,
            message:"allreview returned",
            data:allrating
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}