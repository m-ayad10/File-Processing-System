import { useNavigate } from "react-router-dom";
import image from "../../assets/home.svg";
import './style.css'
function HomeContent() {
    const navigate=useNavigate()
  return (
    <div className="  ">
      <div
        className="p-5 h-screen sm:bg-center "
        style={{
          // backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          //   background,
          //   backgroundPositionX: "center",
        }}
      >
        
        <img src={image} alt="" className="h-screen object-cover  object-center ms-2 sm:ms-10 md:ms-32 sm:object-left" />
        <div className="home-text-container ">
          <h1 className="text-4xl font-medium ">
            Organize your files  and keep them safe, 
            everywhere!
          </h1>
          <p className="text-gray-95000 from-transparent">We offer secure storage, ensuring all your data is protected from unauthorised access</p>
          <button className="p-2.5 mt-1 bg-violet-700 text-white rounded cursor-pointer" onClick={()=>navigate('/login')}>Get Started</button>
        </div>

        {/* <div>
          <img
            src="https://th.bing.com/th/id/OIP.2LdeCtlYjRUwugHgg9qcegAAAA?pid=ImgDet&w=164&h=131&c=7&dpr=1.5"
            alt=""
          />
        </div> */}
      </div>
    </div>
  );
}

export default HomeContent;
