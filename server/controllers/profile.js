const profile=require("../models/profile")
const User=require("../models/User")
const CourseProgress = require("../models/courseprpgress")
const {uploadimage}=require("../utils/imageuploader")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const Course =require("../models/course")
exports.updateprofile=async (req,res)=>{
    try {
        const {DOB="",about="",gender,contactNumber}=req.body
        const id=req.user.id
        if(!id){
            return res.status(403).json({
                success:false,message:"all fields required"
            })
        }
        const userdetails=await User.findById(id)
        const prfileid=userdetails.additionalDetails;
        const profliedetails=await profile.findById(prfileid);

        profliedetails.DOB=DOB
        profliedetails.gender=gender
        profliedetails.about=about
        profliedetails.contactNumber=contactNumber
        await profliedetails.save();
        return res.status(200).json({
            success:true,message:"successfully updated profile"
          ,profliedetails
        })
    } catch (error) {
        console.log(error)

        return res.status(400).json({
            success:false,message:error.message
        })
    }
}

exports.deleteaccount=async (req,res)=>{
    try {
        const id=req.user.id;
        const user=await User.findById(id)
        if(!user){
            return res.status(403).json({
                success:false,message:"User not Found"
            })
        }
        await profile.findByIdAndDelete({
            _id:user.additionalDetails._id
        })
        await User.findByIdAndDelete(id)
        return res.status(200).json({
            success:true,message:"Account Deleted Successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,message:error.message
        })
    }
}

exports.getalldetails=async (req,res)=>{
    try {
        const id =req.user.id
        const alluser =await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,message:"data returned",alluser
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success:false,message:error.message
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadimage(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "coursecontent",
            populate: {
              path: "subsection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].coursecontent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].coursecontent[
            j
          ].subsection.reduce((acc, curr) => acc + parseInt(curr.timeduration), 0)
          userDetails.courses[i].totalduration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].coursecontent[j].subsection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentenrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.coursename,
          courseDescription: course.coursedesp,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }