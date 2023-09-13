const { default: mongoose } = require("mongoose")
const { instance } = require("../config/razorpay")
const crypto = require("crypto")
const Course = require("../models/course")
const CourseProgress = require("../models/courseprpgress")
const {
    courseEnrollmentEmail,
  } = require("../mail/templates/courseEnrollmentEmail")
const User = require("../models/User")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const {mailSender} = require("../utils/mailsender")

exports.capturepayment = async (req, res) =>{
    try {
        const {courses}=req.body
        const userId=req.user.id
        if(courses.length===0){
            return res.json({
                success:false,
                message:"Courses cart is empty"
            })
        }
        let ta=0
        for(const course_id of courses){
            let course
            try{
                course=await Course.findById(course_id)
                if(courses.length===0){
                    return res.json({
                        success:false,
                        message:"Could not find course"
                    })
                }
                const uid=new mongoose.Types.ObjectId(userId)
                if (course.studentenrolled.includes(uid)) {
                                return res.status(400).json({
                                    success: false,
                                    message: "User already Enrolled in Course"
                    
                                })
                            }
                            ta=ta+course.price
            }catch(err){
                return res.json({
                    success:false,
                    message:err.message
                })
            }
        }
        try {
        const paymentresponse = await instance.orders.create({
                        "amount": ta * 100,
                        "currency": "INR",
                        "receipt": Math.random(Date.now()).toString(),
                    })
        res.json({
            success:true,
            data:paymentresponse
        })
            
        } catch (error) {
            return res.json({
                success:false,
                message:Error.message
            })
        }

    } catch (error) {
        return res.status(400).json({
                        success: false,
                        message: error.message
                    })
    }
}

// exports.capturepayment = async (req, res) => {
//     try {
//         const { courseId } = req.body
//         const userId = req.user.id
//         if (!courseId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "please provide a valid course ID"

//             })
//         }
//         let course = await Course.findById(courseId)
//         if (!course) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Course not found"
//             })
//         }
//         if (course.studentenrolled.includes(mongoose.Types.ObjectId(userId))) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User already Enrolled in Course"

//             })
//         }
//         const paymentresponse = await instance.orders.create({
//             "amount": course.price * 100,
//             "currency": "INR",
//             "receipt": Math.random(Date.now()).toString(),
//             "notes": {
//                 courseId: course_id,
//                 userId
//             }
//         })
//         return res.status(200).json({
//             success: true,
//             message: "Payment done",
//             courseName: course.couseName,
//             coursedesp: course.coursedesp,
//             thumbnail: course.thumbnail,
//             order_id: paymentresponse.id,
//             currency: paymentresponse.currency,
//             amount: paymentresponse.amount
//         })
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
exports.verifySignature = async (req, res) => {
    try {
        const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses
  const userId=req.user.id
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }
 
  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}
const enrollStudents=async(courses,userId,res)=>{
    if (!courses || !userId) {
        return res
          .status(400)
          .json({ success: false, message: "Please Provide Course ID and User ID" })
      }
      for(const course_id of courses){
        const enro=await Course.findByIdAndUpdate(course_id,{
            $push:{
                studentenrolled:userId
            }
        },
        {new:true})
        if (!enro) {
            return res
              .status(500)
              .json({ success: false, error: "Course not found" })
          }
          const enrostu=await User.findByIdAndUpdate(userId,{
            $push:{
                courses:course_id
            }
          },{new:true})
          const courseProgress = await CourseProgress.create({
            courseID: course_id,
            userId: userId,
            completedVideos: [],
          })
          const emailres=await mailSender(
            enrostu.email,
            `Successfully Enrolled into ${enro.coursename}`,
            courseEnrollmentEmail(
                enro.coursename,
                `${enrostu.FirstName} ${enrostu.LastName}`
              )
          )
          console.log("Email sent successfully: ", emailres.response)
      }
      
}
// exports.verifySignature = async (req, res) => {
//     try {
//         const webhooksecret = "123456"
//         const signature = req.headers["x-razaorpay-signature"]
//         const shasum = crypto.createHmac("sha256", webhooksecret)
//         shasum.update(JSON.stringify(req.body))
//         const digest = shasum.digest("hex")
//         if (digest === signature) {
//             console.log("Paymenty is Authorized")
//             const { courseId, userId } = req.body.payload.payment.entity.notes
//             try {
//                 const enrolledcourse = await Course.findOneAndUpdate({ _id: courseId }, {
//                     $push: {
//                         studentenrolled: userId
//                     }
//                 }, { new: true }
//                 )
//                 if (!enrolledcourse) {
//                     return res.status(403).json({
//                         success: false,
//                         message: "Course not Found"
//                     })
//                 }
//                 console.log(enrolledcourse)
//                 const userupdate = await User.findOneAndUpdate({ _id: userId }, {
//                     $push: {
//                         courses: courseId
//                     }
//                 }, { new: true })

//                 const mail = await mailSender(userupdate.email, "Course Updatation", "You have been Successfully Enrolled in the course")
//             } catch (error) {
//                 return res.status(400).json({
//                     success: false,
//                     message: error.message
//                 })
//             }


//         }   
//         else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid request"
//             })
//         }
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.FirstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }
  