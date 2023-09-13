const mongoose = require("mongoose")
const category = new mongoose.Schema({
   name: {
      type: String
   },
   description: {
      type: String
   },
   course: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course"}
   ]
})

module.exports = mongoose.model("Category", category) 