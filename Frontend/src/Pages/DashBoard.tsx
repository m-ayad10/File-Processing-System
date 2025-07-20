import { useLocation } from "react-router-dom";
import Directory from "../Component/Directory/Directory";
import { useUserContext } from "../Context Api/UserContext";
import { CiCloudOn } from "react-icons/ci";
import { useEffect, useState } from "react";
import axios from "axios";

function DashBoard() {
  const location = useLocation();
  const { userName } = useUserContext();
  const [size,setSize]=useState<number>(0)
  const SERVER_URL=import.meta.env.VITE_SERVER_URL
  

  const getFolderSize = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/folder/size/${userName}`);
      const { success, size} = response.data; //{userName: 'Mohammed Ayad', iat: 1745051772, exp: 1745483772}
      if (success) {
        setSize(size)
      }
    } catch (error) {
      console.error(error);
    }
  };
  const pathAfterDashboard = decodeURIComponent(
    location.pathname.replace(/^\/?dashboard\/?/, "")
  );
  useEffect(()=>{
    if (!userName) {
      return
    }
    getFolderSize()
  },[userName,pathAfterDashboard])

  // Get the path after '/dashboard'
  

  return (
    <div className="p-4 md:p-7 lg:p-10">
      {pathAfterDashboard === userName && (
        <div className="block lg:flex gap-2.5">
          <div className=" bg-white p-7 px-6 sm:p-10 rounded-lg mb-4 w-full lg:w-1/2">
            <h1 className="text-2xl font-medium ">
              Welcome {userName ? userName : ""}
            </h1>
          </div>
          <div className="bg-white p-2 px-6 rounded-xl shadow-md w-full lg:w-1/2 mb-4">
            <div className="flex items-center gap-4 ">
              <CiCloudOn className="text-6xl text-blue-500" />
              <h1 className="text-2xl font-semibold text-gray-800">Storage</h1>
            </div>
            <div className="">
              <input
                type="range"
                min="0"
                max="100"
                value={size}
                readOnly
                className="w-full accent-blue-500 mt-0"
              />
            </div>
           
            <h4 className="text-sm text-gray-500">{size}% full - 100 MB</h4>
          </div>
        </div>
      )}

      <Directory />
    </div>
  );
}

export default DashBoard;
