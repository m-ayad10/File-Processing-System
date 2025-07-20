import { useEffect } from "react";
import HomeContent from "../Component/HomeContent/HomeContent";
import Navbar from "../Component/Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const SERVER_URL=import.meta.env.VITE_SERVER_URL
  useEffect(() => {
    const validate = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/verify-token`, {
          withCredentials: true,
        });
        const { success, user } = response.data;
        if (success) {
          navigate(`/dashboard/${user.userName}`);
        }
      } catch (error) {
        console.error(error);
      }
    };
    validate();
  }, []);
  return (
    <div className="h-screen">
      <Navbar />
      <HomeContent />
    </div>
  );
}

export default Home;
