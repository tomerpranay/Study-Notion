const mongoose = require("mongoose")
const profileSchema = new mongoose.Schema({
    gender: {
        type: String
    },
    about: {
        type: String
    },
    DOB: {
        type: Date
    },
    contactNumber: {
        type: Number,
        trim: true
    }
})

module.exports = mongoose.model("Profile", profileSchema)