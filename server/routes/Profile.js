const express=require('express');
const router=express.Router();
const { auth } = require("../middlewares/auth")
const  {isinstructor}= require("../middlewares/auth")
const {updateprofile,deleteaccount,getalldetails}=require("../controllers/profile")
const {updateDisplayPicture,
getEnrolledCourses,
instructorDashboard,
}=require("../controllers/profile")
router.delete("/deleteaccount",auth,deleteaccount)
router.get("/getalldetails",auth,getalldetails)
router.put("/updateProfile",auth ,updateprofile)

router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isinstructor, instructorDashboard)

module.exports=router;