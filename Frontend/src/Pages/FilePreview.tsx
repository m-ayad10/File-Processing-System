import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

function FilePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const SERVER_URL=import.meta.env.VITE_SERVER_URL

  const pathAfterDashboard = decodeURIComponent(
    location.pathname.replace(/^\/?preview\/?/, "")
  );

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/file/signed-url/${pathAfterDashboard}`
        );
        setFileUrl(res.data.url);        
        setFileType(pathAfterDashboard.split(".").pop()?.toLowerCase() || "");
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    fetchSignedUrl();
  }, [pathAfterDashboard]);

  const isOfficeFile = (type:string) =>
    ["doc", "docx", "ppt", "pptx", "xls", "xlsx","pdf"].includes(type);

  const renderPreview = () => {
    if (!fileUrl) return <p className="text-gray-600">No file to preview.</p>;

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
      return (
        <img
          src={fileUrl}
          alt="Preview"
          className="max-h-[80vh] mx-auto object-contain"
        />
      );
    }

    

    if (["mp4", "webm", "ogg"].includes(fileType)) {
      return (
        <video
          src={fileUrl}
          controls
          className="w-full max-h-[80vh] mx-auto"
        />
      );
    }

    if (isOfficeFile(fileType)) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            fileUrl
          )}&embedded=true`}
          title="Office File Preview"
          width="100%"
          height="600px"
          className="border rounded"
        />
      );
    }

    return (
      <div className="text-center mt-4">
        <p className="text-gray-700 mb-2">
          Preview not available for this file type.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Click here to download the file
        </a>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center cursor-pointer gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <FaArrowLeft size={20} />
        Back
      </button>

      <h2 className="text-base mb-3 text-gray-800 break-words">
        File Preview:{" "}
        <span className="text-blue-600">{pathAfterDashboard}</span>
      </h2>

      {renderPreview()}
    </div>
  );
}

export default FilePreview;
