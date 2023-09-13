const User = require("../models/User");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require("dotenv")
const Profile=require("../models/profile")
const mailSender=require('../utils/mailsender');
exports.sendotp = async (req, res) => {
    try {
        const { email } = req.body;
        const chekifexist = await User.findOne({ email: email });
        if (chekifexist) {
            return res.status(401).json({
                success: false,
                message: "user already exist",
            });
        }
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        var r = await OTP.findOne({ otp: otp });
        while (r) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            r = await OTP.findOne({ otp: otp });
        }
        console.log("otp genrated");
        const otppayloader = { email, otp };
        const forotpdbentery = await OTP.create(otppayloader);
        console.log(forotpdbentery);
        console.log("OTP entery created");
        res.status(200).json({
            success: true,
            message: "OTP entery created successfuly",
            otp,
        });
    } catch (err) {
        console.log("while genrating otp error occured: " + err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

exports.signup = async (req, res) => {
    try {
      
        const {
            FirstName,
            LastName,
            password,
            email,
            conformpassword,
            contactnumber,
            accounttype,
            otp,
        } = req.body;
        if (
            !FirstName ||
            !LastName ||
            !email ||
            !password ||
            !conformpassword ||
            !otp
        ) {
            return res.status(403).json({
                sucess: false,
                message: "All fields are reuired",
            });
        }
        
        if (password !== conformpassword) {
            return res.status(400).json({
                seucess: false,
                message: "Password not matching with conformpassword",
            });
        }
        if (await User.findOne({ email: email })) {
            return res.status(400).json({
                success: false,
                message: "user already exist",
            });
        }
        
        const recentotp = await OTP.findOne({email:email}).sort({ createdAt: -1 }).limit(1);
       
        
        console.log(recentotp.otp.toString());
        
        if (recentotp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "user already exist",
            });
        } else if (otp !== recentotp.otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "invalid otp",
            });
        }
        
        const hashedpass = await bcrypt.hash(password, 10);
        const profiledetails = await Profile.create({
            gender: null,
            DOB: null,
            about: null,
            contactNumber: null
        })
        
        const user = await User.create({
            FirstName,
            LastName,
            email,
            password: hashedpass,
            accounttype,
            additionalDetails: profiledetails._id,
            contactnumber,
            conformpassword,otp:recentotp._id,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${FirstName} ${LastName}`
        })
        console.log("hello")
        return res.status(200).json({
            success: true,
            message: "User registered succesfully",
            user
        })
    } catch (err) {
        console.log("while sining up error occured: " + err);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "enter all fields"
            });
        }
        const user = await User.findOne({ email:email })
        if (!user) {
            console.log("User doesnt exist please singup");
            res.status(400).json({
                success: false,
                message: "User do not exist",
            });
        }
        
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accounttype: user.accounttype
            }
            const token = jwt.sign(payload, process.env.JWT_SEC, {
                expiresIn: "2h",
            })

            
            user.token = token;
            user.password = undefined;
           
            const opt = {
                expires: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)),
                httpOnly: true
            }
            
            return res.cookie("token", token, opt).status(200).json({
                success: true,
                token,
                user,
                message: "Login Successfully"
            }),console.log("User Login Successfully")
        }
        else { 
            
            return res.status(400).json({
                success: false,
                message: "Password do not match",
            });
        }
    } catch (err) {
        
        console.log("while sining up error occured: " + err);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

exports.changepassword=async (req,res)=>{
    try {
        const {oldpassword,email,newpassword,confirmnewpassword}=req.body
        if(!oldpassword||!newpassword||!confirmnewpassword){
            res.status(403).json({
                success: false,
                message: "all fileds required",
            });
        }
        const user=await User.findOne({email:email});
        if (await bcrypt.compare(oldpassword, user.password)){
            await User.findOneAndUpdate({email:email},{password:newpassword})
            mailSender(user.email,"Password Changed","Passowrd Changed succefully")
            return res.status(200).json({
                success:true,
                message:"password changed"
            })
        }
        else{
            return res.status(400).json({
                success: false,
                message: "Incorrect Old Password",
            });
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}
