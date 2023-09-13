const User = require("../models/User")
const mailSender = require("../utils/mailsender")
const bcrypt = require('bcrypt');
const crypto=require('crypto')
exports.resetpasswordtoken = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Your email is not register"
            })
        }

        const token = crypto.randomUUID();
        await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetpasswordexpires: Date.now() + 5 * 50 * 1000
        },{new:true})


        const url = `http://localhost:3000/update-password/${token}`
        await mailSender.mailSender(email, "password Reset Link", `Pasword reset link is ${url}`)
        return res.status(200).json({
            success: true,
            message: "Reset password email send succesfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

exports.resetpassword = async (req, res) => {
    try {
        
        const { password, confirmpassword, token } = req.body
        console.log(password)
        console.log(confirmpassword)
        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                message: "Password not matching"
            })
        }
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid"
            })
        }
        if (user.resetpasswordexpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "token expired"
            })
        }
        const hashpass=await bcrypt.hash(password,10)

        await User.findOneAndUpdate({token:token},{password:hashpass},{new:true})
        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}