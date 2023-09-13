const express = require('express');
const app = express();
app.use(express.json());

const dbconnect = require("./config/database")
const cookieParser = require("cookie-parser");
const cors = require('cors')
const { cloudinaryconnect } = require("./config/cloudinary")
const fileUpload = require("express-fileupload")
const dotenv = require("dotenv")
dotenv.config()
const userroute = require('./routes/User');

const profileroute = require("./routes/Profile");

const coursroute = require("./routes/Course");

const paymentroute = require("./routes/Payment");
const contactUsRoute = require("./routes/Contact");


app.use(cookieParser())
app.use(cors({
    origin: "*",
    credential: true
}))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp"
}))
cloudinaryconnect();
app.use("/api/v1/auth", userroute)
app.use("/api/v1/course", coursroute)
app.use("/api/v1/profile", profileroute)
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/payment", paymentroute)
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "serever started succefully"
    })
});

app.listen(process.env.PORT || 4000, () => {
    console.log('server started at ' + 4000);
});

dbconnect.dbconnect();