const nodemailer=require('nodemailer');
require("dotenv").config()
exports.mailSender=async(email,title,body) => {
    try {

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: 'preer06@gmail.com',
    pass: process.env.MAIL_PASS
  }
  
})

const info = await transporter.sendMail({
    from: "SudyNotion",
    to: `${email}`,
    subject:title,
    html:`<div>${body}</div>`
  });
  console.log(info)
  return info;
    } catch (error) {
        console.log(error);
    }
}