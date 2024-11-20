const express=require('express')
const router=express.Router()

const{
    createcourse,
    getallcourses,
    getCourseDetails,
    getInstructorCourses,getFullCourseDetails,
    editCourse,
    deleteCourse,
}=require("../controllers/course")
const {
    createcategory,
    showcategorys,
    categoryPageDetails
}=require("../controllers/Category")
const {
    createsection,
    updatesection,
    deletesection
}=require('../controllers/section')
const {
    createsubsection,
    updatesubsection,deleteSubSection,
}=require("../controllers/subsection")
const {
    updateCourseProgress,
    getProgressPercentage,
  } = require("../controllers/courseProgress")


const {
    createrating,
    avgrating,
    getallratingandreview
}=require("../controllers/RatingandReview")


const {auth,isstudent,isinstructor,isadmin}=require("../middlewares/auth")






router.post("/addCourse",auth,isinstructor,createcourse)
router.post("/editCourse", auth, isinstructor, editCourse)
router.post("/addSection",auth,isinstructor,createsection)
router.get("/getFullCourseDetails", auth, getFullCourseDetails)
router.post("/updateSection",updatesection)
router.post("/deleteSubSection", auth, isinstructor, deleteSubSection)
router.post("/deleteSection",deletesection)
router.post("/updateCourseProgress", auth, isstudent, updateCourseProgress)
router.post("/addSubSection",createsubsection)

router.post("/updateSubSection",updatesubsection)

router.post("/getAllCourses",getallcourses)

router.post("/getCourseDetails",getCourseDetails)

// router.post("/getProgressPercentage", auth, isstudent, getProgressPercentage)
router.post("/editCourse", auth, isinstructor, editCourse)
router.get("/getInstructorCourses", auth, isinstructor, getInstructorCourses)



router.post("/addCategory",auth,isadmin,createcategory)
router.get("/showAllCategories",showcategorys)
router.post("/getCategoryPageDetails",categoryPageDetails)
router.delete("/deleteCourse", deleteCourse)



router.post("/createRating",auth,isstudent,createrating)
router.get("/getAverageRating",avgrating)
router.get("/getReviews",getallratingandreview)

module.exports=router
