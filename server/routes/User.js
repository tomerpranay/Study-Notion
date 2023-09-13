const express=require('express');
const router=express.Router();

const {login,signup,sendotp,changepassword}=require("../controllers/Auth")

const {resetpasswordtoken,resetpassword}=require("../controllers/ResetPassword")

const {auth}=require("../middlewares/auth")

router.post("/login",login)

router.post("/signup",signup)

router.post("/changepassword",auth ,changepassword)
router.post("/sendotp",sendotp)

router.post("/reset-password-token",resetpasswordtoken)

router.post("/reset-password",resetpassword);

module.exports=router;