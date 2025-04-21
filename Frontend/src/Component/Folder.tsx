import axios from "axios";
import React, { useRef, useState } from "react";

function Folder() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const files = inputRef.current?.files;

    if (!files || files.length === 0) {
      alert("Please select a folder to upload");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i], files[i].webkitRelativePath);
    }

    try {
      setUploading(true);
      const response = await axios.post(
        "http://localhost:3000/addFolder",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { status, message } = response.data;
      console.log(response.data);

      if (status) {
        alert(`✅ ${message}`);
      } else {
        alert("⚠️ Upload failed.");
      }
    } catch (error: any) {
      console.error(error);
      alert("❌ Upload error. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={HandleSubmit}>
        <input
          id="folderInput"
          type="file"
          ref={inputRef}
          webkitdirectory="true"
          multiple
        />
        <button className="" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Folder"}
        </button>
      </form>
    </div>
  );
}

export default Folder;
