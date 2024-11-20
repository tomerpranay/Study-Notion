const jwt =require("jsonwebtoken")
const User=require("../models/User")
require("dotenv").config()
exports.auth=async (req,res,next)=>{
    try {
        const token=req.cookies.token||req.body.token||req.header("Authorization").replace("Bearer ","");

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is not found",
            });
        }
        console.log(token)
        try {console.log("enter in auth")
        
            const decode=await jwt.verify(token,process.env.JWT_SEC)
            console.log(decode)
            req.user=decode
            
        } catch (error) {
            console.log("jojoj")
            return res.status(401).json({
                success: false,
                message:error.message
            });
        }
        next()
    } catch (error) {
       return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

exports.isstudent=async (req,res,next)=>{
try {
    if(req.user.accounttype!=="Student"){
        return res.status(401).json({
            success: false,
            message: "this os a protected route for Student Only",
        });
    }
    next()
} catch (error) {
    return res.status(400).json({
        success: false,
        message: error.message,
    });
}
}

exports.isinstructor=async (req,res,next)=>{
    try {
        if(req.user.accounttype!=="Instructor"){
            return res.status(401).json({
                success: false,
                message: "this is a protected route for Instructor Only",
            });
        }
        next()
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
    }

    exports.isadmin=async (req,res,next)=>{
        try {
            if(req.user.accounttype!=="Admin"){
                return res.status(401).json({
                    success: false,
                    message: "this os a protected route for Admin Only",
                });
            }
            next()
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        }