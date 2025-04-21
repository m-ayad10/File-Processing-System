import axios from 'axios'
import React, { useState } from 'react'

function Header() {
    const [image,setImage]=useState<File|null>(null)

    const handleImageChange=(e:React.ChangeEvent<HTMLInputElement>)=>
    {
        if (e.target.files) {
            setImage(e.target.files[0])
        }
    }

    const handleSubmit=async(e:React.FormEvent)=>
    {
        e.preventDefault()
        if (!image) {
            return
        }
        const formData=new FormData()
        formData.append('file',image)
        try {
            const response=await axios.post('http://localhost:3000/file',formData,{
                headers:{
                    'Content-Type': 'multipart/form-data',
                }
            })
            setImage(null)
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
          console.error('Error uploading file:', error);
            
        }
    }

  return (
    <div>
      <div className="flex justify-end ">
        <form action="" onSubmit={handleSubmit}>
        <input type="file"className='' onChange={handleImageChange}  />
        <button className='' type='submit' >Submit</button>
        </form>
      </div>
    </div>
  )
}

export default Header
