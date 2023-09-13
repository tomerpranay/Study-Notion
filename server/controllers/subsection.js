const course=require("../models/course")
const section=require("../models/section")
const subsection=require("../models/subsection")
const imageuploader=require("../utils/imageuploader")
require("dotenv")
exports.createsubsection=async (req,res)=>{
    try {
        const{sectionId,title,description}=req.body;
       
        const video=req.files.videofile
        if(!title||!description||!sectionId||!video){
            return res.status(403).json({
                success:false,
                message:"ENter all feilds"
            })
        }
        
        const uploaddetails=await imageuploader.uploadimage(video,process.env.FOLDER_NAME)
        console.log("hello")
        const newsubsection=await subsection.create({
            title,timeduration:`${uploaddetails.duration}`,description,videoUrl:uploaddetails.secure_url
        })
        const us=await section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subsection:newsubsection._id
            }
        },{new:true}).populate("subsection")
        
            return res.status(200).json({
                success:true,
                message:"Subsection created successfully",
                data:us
            })
        
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            
            success:false,
            message:error.message
            
        })
    }
}

exports.updatesubsection=async (req,res)=>{
    try {
        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await subsection.findById(subSectionId)
    
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
    
        if (title !== undefined) {
          subSection.title = title
        }
    
        if (description !== undefined) {
          subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
          const video = req.files.video
          const uploadDetails = await imageuploader(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}`
        }
    
        await subSection.save()
    
        // find updated section and return it
        const updatedSection = await section.findById(sectionId).populate(
          "subSection"
        )
    
        console.log("updated section", updatedSection)
    
        return res.json({
          success: true,
          message: "Section updated successfully",
          data: updatedSection,
        })
    } catch (error) {
    
            return res.status(403).json({
                success:false,
                message:error.message
            })
        
    }
}
exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subsection: subSectionId,
          },
        }
      )
      const subSection = await subsection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      // find updated section and return it
      const updatedSection = await section.findById(sectionId).populate(
        "subsection"
      )
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }