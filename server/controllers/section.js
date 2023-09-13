const course=require("../models/course")
const section=require("../models/section")

exports.createsection=async (req,res)=>{
    try {
        const{sectionName,courseId}=req.body
        if(!sectionName||!courseId){
            return res.status(403).json({
                success:false,
                message:"enter all fileds"
            })
        }
        const newsection=await section.create({
            sectionName:sectionName
        })
        const updatecourse=await course.findOneAndUpdate({_id:courseId},{
            $push:{
                coursecontent:newsection._id
            }
        },{new:true}).populate({
            path: "coursecontent",
            populate: {
                path: "subsection",
            },
        })
        .exec();
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatecourse
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.updatesection=async (req,res)=>{
    try {
        const{sectionName,sectionId,courseId}=req.body
        if(!sectionName||!sectionId){
            return res.status(403).json({
                success:false,
                message:"enter all fileds"
            })
        }
        await section.findByIdAndUpdate(sectionId,{
            sectionName:sectionName
        },{new:true})
        const cours= await course.findById(courseId)
		.populate({
			path:"coursecontent",
			populate:{
				path:"subsection",
			},
		})
		.exec();
            return res.status(200).json({
                success:true,
                message:"updated",
                data:cours
            })
  

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.deletesection=async (req,res)=>{
    try {
        const {sectionId,courseId}=req.body;
        await course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
        await section.findByIdAndDelete(sectionId);
        const cours= await course.findById(courseId).populate({
			path:"coursecontent",
			populate: {
				path: "subsection"
			}
		})
		.exec();

        return res.status(200).json({
            success:true,
            message:"sucesfully deleted",
            data:cours
        })
    } catch (error) {
        
            return res.status(400).json({
                success:false,
                message:error.message
            })
        
    }
}