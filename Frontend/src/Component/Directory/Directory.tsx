import { useEffect, useState } from "react";
import FilesAndFolders from "../Files and Folders/FilesAndFolders";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosProgressEvent } from "axios";
import Swal from "sweetalert2";
import { useUserContext } from "../../Context Api/UserContext";
import { FaArrowLeft } from "react-icons/fa";

export type FileOrFolderItem = {
  _id: string;
  name: string;
  path: string;
  parentPath: string;
  type: "folder" | "file";
  __v: number;
  fileId?: string;
  userName?: string;
};

function Directory() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const location = useLocation();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const pathAfterDashboard = decodeURIComponent(
    location.pathname.replace(/^\/?dashboard\/?/, "")
  );
  const [data, setData] = useState<FileOrFolderItem[]>([]);
  const { userName } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL}/folder/fetch/${pathAfterDashboard}`,
          { withCredentials: true }
        );
        const { success, data } = response.data;
        if (success) {
          setData(data);
        }
      } catch (error: any) {
        console.error("Error fetching folder data:", error);
        Swal.fire({
          icon: "error",
          title: `${error?.response.data.message}` || "Something went wrong",
          customClass: {
            popup: "custom-swal-popup",
          },
        });
      }
    };
    fetchData();
  }, [pathAfterDashboard]);

  const CreateFolder = async () => {
    const { value: folderName } = await Swal.fire({
      title: "Create a folder",
      input: "text",
      inputLabel: "Folder name",
      inputPlaceholder: "Enter folder name",
      showCancelButton: true,
      customClass: {
        popup: "custom-swal-popup",
        input: "custom-swal-input",
      },
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
        return null;
      },
    });

    if (folderName) {
      try {
        const response = await axios.post(
          `${SERVER_URL}/folder/${pathAfterDashboard}`,
          {
            folderName,
          }
        );
        const { success, data } = response.data;

        if (success) {
          setData(data);
          Swal.fire({
            icon: "success",
            title: "Folder created",
            text: `Folder "${folderName}" created successfully!`,
            customClass: {
              popup: "custom-swal-popup",
            },
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: error?.response.data.message || "Something went wrong",
          customClass: {
            popup: "custom-swal-popup",
          },
        });
      }
    }
  };

  const handleFile = async () => {
    const { value: file } = (await Swal.fire({
      title: "Select a file",
      input: "file",
      inputAttributes: {
        accept: "*", // Accept all file types
        "aria-label": "Upload a file",
      },
      showCancelButton: true,
      customClass: {
        popup: "custom-swal-popup",
      },
    })) as { value: File | null };

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userName", userName || "");

    Swal.fire({
      title: `Uploading: ${file.name}`,
      html: `<b>Progress: <span id="upload-progress">0</span>%</b>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "custom-swal-popup",
      },
    });

    try {
      const response = await axios.post(
        `${SERVER_URL}/file/${pathAfterDashboard}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const progressSpan = document.getElementById("upload-progress");
              if (progressSpan) {
                progressSpan.textContent = progress.toString();
              }
            }
          },
        }
      );

      const { success, data } = response.data;
      if (success) {
        setData(data);
        Swal.fire({
          icon: "success",
          title: "Upload Complete!",
          customClass: {
            popup: "custom-swal-popup",
          },
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error?.response?.data?.message || "Something went wrong",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  };

  return (
    <div className="">
      {/* User Info Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-1">
        {pathAfterDashboard !== userName && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center cursor-pointer gap-2 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft size={20} />
            <span className="text-base font-medium">Back</span>
          </button>
        )}

        <h3 className="text-2xl font-semibold text-gray-800 break-words flex items-center gap-1">
          {pathAfterDashboard}
          <span className="text-gray-500">/</span>
        </h3>
      </div>

      {/* Divider */}
      <hr className="w-full border-t border-gray-300 my-2" />

      {/* Section Header with Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800"></h3>

        <div className="flex gap-3">
          <button
            onClick={handleFile}
            className="bg-black cursor-pointer hidden md:block text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Upload
          </button>
          <button
            onClick={CreateFolder}
            className="bg-gray-200 cursor-pointer hidden md:block text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Create Folder
          </button>
          <div className=" py-2 relative inline-block text-left md:hidden">
            <BsThreeDotsVertical
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer"
            />
            {isOpen && (
              <div className="absolute right-0 top-[2rem] bg-gray-300  rounded shadow-md z-10">
                <p
                  onClick={handleFile}
                  className="px-5 py-1 hover:bg-gray-400 cursor-pointer text-center whitespace-nowrap "
                >
                  Upload File
                </p>
                <hr className="w-full" />
                <p
                  onClick={CreateFolder}
                  className="px-5 py-1 hover:bg-gray-400 cursor-pointer text-center whitespace-nowrap "
                >
                  Create Folder
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-10">
          No files found.
        </p>
      ) : (
        <FilesAndFolders data={data} setData={setData} />
      )}
      {/* <div>
        <div className="flex gap-4 text-center">
          <FaFolder />
          <p>1744202100757-923260063-offer (1).jpg</p>
        </div>
        <hr className="w-full text-black" />
      </div> */}
    </div>
  );
}

export default Directory;
