const mongoose=require('mongoose')
require('dotenv').config()
exports.dbconnect=()=>{
        mongoose.connect(process.env.DATABASE_URL)
        .then(()=>console.log("DB connected"))
        .catch((error)=>{
            console.log(error+" while coonection DB")
            process.exit(1)})

    
}
