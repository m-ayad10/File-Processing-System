import { useEffect } from "react";
import HomeContent from "../Component/HomeContent/HomeContent";
import Navbar from "../Component/Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const validate = async () => {
      try {
        const response = await axios.get("http://localhost:3000/verify-token", {
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
