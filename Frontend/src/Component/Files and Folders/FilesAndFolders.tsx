import {
  FaFileImage,
  FaFileWord,
  FaFilePdf,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileVideo,
} from "react-icons/fa6";
import { FaFolder, FaFile, FaRegStar, FaStar } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IconType } from "react-icons";
import { useEffect, useState } from "react";
import { FileOrFolderItem } from "../Directory/Directory";
import "./style.css";
import "./Responsive.css";
import {  useNavigate } from "react-router-dom";
import axios, { AxiosProgressEvent } from "axios";
import Swal from "sweetalert2";
import { useUserContext } from "../../Context Api/UserContext";

interface iconMapValue {
  color: string;
  icon: IconType;
}

const iconMap: Record<string, iconMapValue> = {
  image: { icon: FaFileImage, color: "text-blue-500" },
  excel: { icon: FaFileExcel, color: "text-green-500" },
  word: { icon: FaFileWord, color: "text-blue-500" },
  pdf: { icon: FaFilePdf, color: "text-red-400" },
  ppt: { icon: FaFilePowerpoint, color: "text-orange-500" },
  video: { icon: FaFileVideo, color: "text-purple-500" },
  folder: { icon: FaFolder, color: "text-yellow-500" },
  default: { icon: FaFile, color: "text-gray-500" },
};

const getFileTypeFromName = (name: string): string => {
  const extension = name.split(".").pop()?.toLowerCase();
  if (!extension) return "default";

  if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(extension))
    return "image";
  if (["xlsx", "xls"].includes(extension)) return "excel";
  if (["doc", "docx"].includes(extension)) return "word";
  if (["pdf"].includes(extension)) return "pdf";
  if (["ppt", "pptx"].includes(extension)) return "ppt";
  if (["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(extension))
    return "video";

  return "default";
};

function FilesAndFolders({
  data,
  setData,
}: {
  data: FileOrFolderItem[];
  setData: React.Dispatch<React.SetStateAction<FileOrFolderItem[]>>;
}) {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const pathUrl=location.pathname

  const toggleDropdown = (id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const [starred, setStarred] = useState<FileOrFolderItem[]>([]);
  const { userName } = useUserContext();

  useEffect(() => {
    if (!userName) {
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/starred/${userName}`
        );
        const { success, data } = response.data;
        if (success) {          
          setStarred(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [userName,data]);

  const addToStarred = async (item: FileOrFolderItem) => {
    try {
      const formData = new FormData();
      formData.append("name", item.name);
      formData.append("path", item.path);
      formData.append("parentPath", item.parentPath);
      formData.append("type", item.type);
      formData.append("_id", item._id);
      formData.append("userName", userName || "");
      const response = await axios.post(
        `http://localhost:3000/starred`,
        formData,
        {
          headers: { 'Content-Type': 'application/json'  },
        }
      );
  
      const { data, success } = response.data;
  
      if (success) {        
        setStarred(data);
        // Swal.fire({
        //   icon: "success",
        //   title: "Added to Starred",
        //   customClass: {
        //     popup: "custom-swal-popup",
        //   },
        // });
      }
    } catch (error: any) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: error?.response?.data?.message || "Something went wrong",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  };
  

  const removeFromStarred = async (item: FileOrFolderItem) => {
    try {
      let response;
      if (pathUrl==='/starred') {
        response = await axios.delete(
          `http://localhost:3000/starred/${item.fileId}?userName=${userName}`
        );
      }else{
        response = await axios.delete(
          `http://localhost:3000/starred/${item._id}?userName=${userName}`
        );
      }
      
      const { success, data } = response.data;
      if (success) {        
        setStarred(data);
        // Swal.fire({
        //   icon: "success",
        //   title: "Unstarred Successfully",
        //   customClass: {
        //     popup: "custom-swal-popup",
        //   },
        // });
      }
    } catch (error:any) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: `${error?.response.data.message}`||'Something went wrong',
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  };

  const handleDownload = async (item: FileOrFolderItem) => {
    try {
      Swal.fire({
        title: `Downloading`,
        html: `<b>Progress: <span id="download-progress">0</span>%</b>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "custom-swal-popup",
        },
      });

      const url =
        item.type === "folder"
          ? `http://localhost:3000/folder/download/${item.path}`
          : `http://localhost:3000/file/download/${item.path}`;

      const response = await axios.get(url, {
        responseType: "blob",
        onDownloadProgress(progressEvent: AxiosProgressEvent) {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            const progressSpan = document.getElementById("download-progress");
            if (progressSpan) {
              progressSpan.textContent = progress.toString();
            }
          }
        },
      });

      // Create a temporary link to trigger download
      const blob = new Blob([response.data]);
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = `${item.name}${item.type === "folder" ? ".zip" : ""}`;
      document.body.appendChild(link); // required for Firefox
      link.click();
      link.remove();
      URL.revokeObjectURL(urlBlob); // prevent memory leak

      Swal.fire({
        icon: "success",
        title: "Download Complete!",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Something went wrong",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  };

  const handleDelete = async (item: FileOrFolderItem) => {
    try {
      let response;

      const requestData = {
        path: item.path,
        parentPath: item.parentPath,
      };

      if (item.type === "folder") {
        response = await axios.delete(`http://localhost:3000/folder`, {
          data: requestData,
        });
      } else {
        response = await axios.delete(`http://localhost:3000/file/delete`, {
          data: requestData,
        });
      }

      const { success, data, message } = response.data;

      if (success) {
        Swal.fire({
          icon: "success",
          title: message || "Deleted successfully",
          customClass: {
            popup: "custom-swal-popup",
          },
        });
        setData(data); // update the UI
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Something went wrong",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  };

  const handleNameClick = (item: FileOrFolderItem) => {
    if (item.type === "folder") {
      navigate(`/dashboard/${item.path}`);
    } else {
      navigate(`/preview/${item.path}`);
    }
  };

  return (
    <div>
      <div className="directory-container">
        {data.map((item) => {
          const fileType =
            item.type === "folder" ? "folder" : getFileTypeFromName(item.name);
          const { icon: Icon, color } = iconMap[fileType] || iconMap.default;
          
          // const fileIdToCheck = item.fileId || item._id;
          
          const isStarred =pathUrl === "/starred"? starred.some((star) => star._id === item._id): starred.some((star) => star.fileId === item._id);
                    
          return (
            <div key={item._id} className="directory-box">
              <div className="relative">
                <div className="flex justify-between mb-2 items-center">
                  {item.type === "folder" ? (
                    <div></div>
                  ) : isStarred ? (
                    <FaStar
                      className="text-xl cursor-pointer"
                      onClick={() => removeFromStarred(item)}
                    />
                  ) : (
                    <FaRegStar
                      className="text-xl cursor-pointer"
                      onClick={() => addToStarred(item)}
                    />
                  )}
                  <BsThreeDotsVertical
                    className="directory-threedot cursor-pointer"
                    onClick={() => toggleDropdown(item._id)}
                  />
                </div>

                {activeDropdown === item._id && (
                  <div className="absolute right-0 top-[1.1rem] mt-1 bg-gray-100 rounded-sm shadow-md z-10 text-sm">
                    <p
                      onClick={() => handleDownload(item)}
                      className="px-4 py-1 hover:bg-gray-300 text-green-500 cursor-pointer"
                    >
                      Download
                    </p>
                    <hr className="w-full" />
                    <p
                      onClick={() => handleDelete(item)}
                      className="px-4 py-1 hover:bg-gray-300 text-red-500 cursor-pointer"
                    >
                      Delete
                    </p>
                  </div>
                )}
              </div>

              <Icon className={`directory-icon ${color}`} />
              <p
                className="text-center text-blue-600 break-words text-sm cursor-pointer mt-2"
                onClick={() => handleNameClick(item)}
              >
                {item.name || "Untitled"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FilesAndFolders;
