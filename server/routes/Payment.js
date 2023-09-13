const express=require('express');
const router=express.Router();
const {auth,isstudent}=require("../middlewares/auth")
const {capturepayment,verifySignature,sendPaymentSuccessEmail}=require("../controllers/Payment")
router.post("/capturePayment",auth,isstudent,capturepayment)
router.post("/verifySignature",auth ,isstudent,verifySignature)
router.post("/sendPaymentSuccessEmail", auth, isstudent, sendPaymentSuccessEmail);
module.exports=router;