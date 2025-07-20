import axios from "axios"
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";


export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const response = await axios.get("http://localhost:3000/verify-token", {
          withCredentials: true,
        });
        const { success } = response.data;
        setIsAuthenticated(success);
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };
    validate();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Please login to continue.",
        customClass: {
          popup: "custom-swal-popup",
        },
      });
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};


// // export const getUserDetails=async(setUser)=>
// // {
// //     try {
// //         const response = await axios.get('http://localhost:3000/verify-token', { withCredentials: true })
// //         const { status, user } = response.data
// //         if (status) {
// //             setUser(user)
// //         }
// //     } catch (error) {
// //         console.error(error)
// //     }
// // }