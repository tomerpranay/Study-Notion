const category=require('../models/category')
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
exports.createcategory=async (req,res)=>{
    try {
        const{name,description}=req.body
        if(!name||!description){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        const categorydetails= await category.create({
            name:name,
            description:description
        })
        return res.status(200).json({
            success:true,
            message:"category created succesfully"
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

exports.showcategorys=async (req,res)=>{
    try {
        const allcategorys=await category.find({})
        return res.status(200).json({
            success:true,
            message:"All categorys return",
            data:allcategorys
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Publish" },
          populate: "ratingandreviw",
        })
        .exec()
        
      //console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.  ")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.course.length === 0) {
        console.log("No courses found for the selected category.  "+selectedCategory.name)
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
        })
        .exec()
        //console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await category.find()
        .populate({
          path: "course",
          match: { status: "Publish" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

// exports.categoryPageDetails=async (req,res)=>{
//     try {
//         const {categoryId}=req.body
//         const selectcategory=await category.findById(categoryId)
//             .populate("course")
//             .exec()
//     console.log(selectcategory)
//     if(!selectcategory){
//         return res.status(403).json({
//             success:false,
//             message:"category not found"

//         })

//     }
//     if(selectcategory.course.length===0){
//         return res.status(400).json({
//             success:false,
//             message:"No course found for selected category"
//         })
//     }
//     const selectcourse=selectcategory.course;
   
//     const categoryExceptSelected=await category.find({
//         _id:{$ne:categoryId}
//     }).populate("course")
//     let differnetCourses=[];
//     for(const catagory of categoryExceptSelected){
//         differnetCourses.push(...catagory.course)
//     }
    
    
//     const allcategories=await category.find().populate("course")
//     const allcourses=allcategories.flatMap((catagory)=>catagory.course)
//     const mostSelingCourses= allcourses.sort((a,b)=>b.sold-a.sold).slice(0,10)
//     return res.status(200).json({
//         success: true,
//         data:{
//         selectedCategory:selectcategory,
//           differentCategory:differnetCourses,
//           mostSellingCourses:mostSelingCourses
//     }
//     })
//     } catch (error) {
//         return res.status(400).json({
//             success:false,
//             message:error.message
//         })
//     }
// }