import { ReactNode, useEffect, useState } from "react";
import { FaBars, FaUtensils } from "react-icons/fa";
import "./style.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../../Context Api/UserContext";
import { FaStar } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import Swal from "sweetalert2";

type SideBarProps = {
  children: ReactNode;
};

function SideBar({ children }: SideBarProps) {
  const { userName, setUserName } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axios.get("http://localhost:3000/verify-token", {
          withCredentials: true,
        });
        const { success, user } = response.data; //{userName: 'Mohammed Ayad', iat: 1745051772, exp: 1745483772}
        if (success) {
          setUserName(user.userName);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getUserDetails();
  }, []);
  const SignOut = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/logout",
        {},
        { withCredentials: true }
      );
      const {message,success}=response.data
      if (success) {
         Swal.fire({
          icon: "success",
          title: message,
          customClass: {
            popup: "custom-swal-popup",
          },
        });
        navigate("/login");
      }
    } catch (error:any) {
      console.error(error);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const sideItems = [
    {
      path: `/dashboard/${userName}`,
      name: "Dashboard",
      icon: <FaUtensils />,
    },
    {
      path: "/starred",
      name: "Starred",
      icon: <FaStar />,
    },
  ];
  return (
    <div>
      {!isOpen && (
        <div className="fa-bar flex">
          <FaBars className="w-8 h-8 m-4" onClick={() => setIsOpen(true)} />
          <img
            className="md:w-[10rem] w-[8rem]  ml-0 m-4"
            src="https://adnan-tech.com/apps/cloud-box/images/logo.png"
            alt=""
          />
        </div>
      )}

      <div className="sidebar-container">
        <div className={`sidebar bg-violet-500 ${isOpen ? "open" : "hidden"}`}>
          <div className="top-section flex">
            <img
              className="md:w-[10rem] w-[8rem]  ml-3 m-4"
              src="https://adnan-tech.com/apps/cloud-box/images/logo.png"
              alt=""
            />
            <FaBars
              className="w-8 h-8 m-4 ml-0"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="menu-items">
            {sideItems.map((item) => (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `link hover:bg-violet-950 ${
                    isActive ? "link-active bg-violet-950" : ""
                  }`
                }
              >
                <div>{item.icon}</div>
                <div>{item.name}</div>
              </NavLink>
            ))}
          </div>
          <div className="logout-section " onClick={SignOut}>
            <FiLogOut className="logout-icon " />
            <p className="logout-name">Logout</p>
          </div>
        </div>
        <main className="main-content w-full bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SideBar;
