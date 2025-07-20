import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FileOrFolderItem } from "../Component/Directory/Directory";
import FilesAndFolders from "../Component/Files and Folders/FilesAndFolders";
import { useUserContext } from "../Context Api/UserContext";
import axios from "axios";

function StarredFiles() {
  const [data, setData] = useState<FileOrFolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { userName } = useUserContext();
  const SERVER_URL=import.meta.env.VITE_SERVER_URL

  useEffect(() => {
    if (!userName) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/starred/${userName}`);
        const { success, data } = response.data;
        if (success) {
          setData(data);
        }
      } catch (error) {
        console.error("Error fetching starred files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userName]);

  return (
    <div className="p-9 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center gap-3">
        <FaStar className="text-yellow-500 text-3xl" />
        <h2 className="text-3xl font-semibold text-gray-800">Starred</h2>
      </div>
      <hr className="mb-1 border-gray-300" />

      {loading ? (
        <div className="text-gray-500 text-center mt-10">Loading starred files...</div>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-10">No starred files found.</p>
      ) : (
        <FilesAndFolders data={data} setData={setData} />
      )}
    </div>
  );
}

export default StarredFiles;
