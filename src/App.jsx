import "./App.css";
import { Route, Routes,useNavigate } from "react-router-dom";
import Login from "./pages/Login"
import MyProfile from "./components/core/Dashboard/MyProfile";
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import MyCourses from "./components/core/Dashboard/MyCourses";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import { ACCOUNT_TYPE } from "./utils/constants";
import Settings from "./components/core/Dashboard/Settings";
import Catalog from "./pages/Catalog";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Contact from "./pages/Contact";
import { useDispatch, useSelector } from "react-redux";
import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";
import AddCourse from "./components/core/Dashboard/AddCourse";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Navbar from "./components/common/Navbar"
import EnrolledCourses from "./components/core/Dashboard/EditCourse/index.js";
import Cart from "./components/core/Dashboard/Cart";
import UpdatePassword from "./pages/UpdatePassword";
import CourseDetails from "./pages/CourseDetails";
import Error from "./pages/error"
import Home from "./pages/Home"
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";
import OpenRoute from "./components/core/Auth/OpenRoute"
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.profile)


  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="catalog/:catalogName" element={<Catalog/>} />
      <Route path="course/:courseId" element={<CourseDetails/>} />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route path="/contact" element={<Contact />} />
         <Route
          path="/about"
          element={
            
              <About />
            
          }
        />
        <Route 
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    >
        <Route path="dashboard/my-profile" element={<MyProfile />} />
        <Route path="dashboard/Settings" element={<Settings />} />
        {
        user?.accounttype === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route path="dashboard/cart" element={<Cart />} />
          <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
          </>
        )
      }
      {
        user?.accounttype === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
          <Route path="dashboard/instructor" element={<Instructor />} />
          <Route path="dashboard/add-course" element={<AddCourse />} />
          <Route path="dashboard/my-courses" element={<MyCourses />} />
          <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
          
          </>
        )
      }
      </Route>
      <Route element={
        <PrivateRoute>
          <ViewCourse />
        </PrivateRoute>
      }>

      {
        user?.accounttype === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route 
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          />
          </>
        )
      }
      </Route>
    <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        /> 
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />   
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }
        />  
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
