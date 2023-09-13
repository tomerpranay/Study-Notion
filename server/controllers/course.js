const Course = require('../models/course');
const Tag = require('../models/category')
const Category = require('../models/category')
const User = require('../models/User')
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/courseprpgress")
const subsection=require("../models/subsection")
const section=require("../models/section")
const { uploadimage } = require("../utils/imageuploader")

exports.createcourse = async (req, res) => {
    try {
        const { coursename, coursedesp, status: status,tag, whatyouwilllearn,coursecontent, price, category, instructions } = req.body
        const thumbnail = req.files.thumbnail
        if (!coursename || !coursedesp || !whatyouwilllearn || !price || !category) {
            return res.status(403).json({
                success: false,
                message: "All felilds are required"

            })
        }
        console.log("creater course")
        const userid = req.user.id;

        const intructoredetails = await User.findById(userid)
        console.log("Intructoe details -> ", intructoredetails)

        if (!intructoredetails) {
            return res.status(404).json({
                success: false,
                message: "intructor details not found"
            })
        }

        const tagdetails = await Tag.findById(category)
        if (!tagdetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            })
        }
        console.log("hello ")
        const thumbnailUrl = await uploadimage(thumbnail, process.env.FOLDER_NAME)

        const newcourse = await Course.create({
            coursename: coursename,
            coursedesp: coursedesp,
            catagory: tagdetails._id,
            price: price,
            whatyouwilllearn: whatyouwilllearn,
            instructor: intructoredetails._id,
            thumbnail: thumbnailUrl.secure_url,
            status: status,
            tag:tag,
            instructions,
            coursecontent,
        })
        await User.findOneAndUpdate({ _id: intructoredetails._id }, {
            $push: {
                courses: newcourse._id
            }
        }, { new: true })
        
        const categoryDetails2 = await Category.findByIdAndUpdate(
          category,
          {
            $push: {
              course: newcourse._id,
            },
          },
          { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "New course created succesfully",
            data: newcourse
        })


    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.getallcourses = async (req, res) => {
    try {
        const allcourses = await Course.find({}).populate("instructor").exec()
        return res.status(200).json({
            success: true,
            message: "all courses returned"

        })
    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        })
    }

}

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const coursedetails = await Course.findOne({ _id: courseId }).populate({
            path: "instructor",
            populate: {
                path: "additionalDetails"
            }
        }).populate({
            path: "category"
        }).populate({
            path: "ratingandreviw"
        }).populate({
            path: "coursecontent",
            populate: {
                path: "subsection"
            }
        }).exec()
        if (!coursedetails) {
            return res.status(403).json({
                success: false,
                message: "no course deatils found"
            })

        }
        let totalDurationInSeconds = 0
    coursedetails.coursecontent.forEach((content) => {
      content.subsection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeduration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
        return res.status(200).json({
            success: true,
            message: "course details passed",
            data: {coursedetails,
            totalDuration}
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadimage(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingandreviw")
        .populate({
          path: "coursecontent",
          populate: {
            path: "subsection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }

  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentenrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.coursecontent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const Section = await section.findById(sectionId)
        if (Section) {
          const subSections = Section.subsection
          for (const subSectionId of subSections) {
            await subsection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }

  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingandreviw")
        .populate({
          path: "coursecontent",
          populate: {
            path: "subsection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
      
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
  
      let totalDurationInSeconds = 0
      courseDetails.coursecontent.forEach((content) => {
        content.subsection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }