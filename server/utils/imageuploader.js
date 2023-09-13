const cloudinary = require('cloudinary').v2

exports.uploadimage=async (file,folder,height,quality)=>{
    const opt={folder}
    if(height){
        opt.height=height
    }
    if(quality){
        opt.quality=quality
    }
    opt.resource_type="auto"
    return await cloudinary.uploader.upload(file.tempFilePath,opt)
}

