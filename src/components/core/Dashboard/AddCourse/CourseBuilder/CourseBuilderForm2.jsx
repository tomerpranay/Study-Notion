import React from 'react'
import { useState } from "react"
import { useForm } from "react-hook-form"
import IconBtn from "../../../../common/IconBtn"
import { IoAddCircleOutline } from "react-icons/io5"
function CourseBuilderForm() {
    const [editSectionName, setEditSectionName] = useState(true)
    const cancelEdit = () => {
        setEditSectionName(null)
        setValue("sectionName", "")
      }
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
      } = useForm()
  return (
    <div className='text-white'>
    <p>Course Builder</p>
    <form>
        <div>
            <label>Section Name <sup>*</sup></label>
            <input
            id="sectionName"
            
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>
        <div>
        <IconBtn
            type="submit"
            // disabled={loading}
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true}
          >   
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>
          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
    </form>
    </div>
  )
}

export default CourseBuilderForm