import { FaUserAlt } from "react-icons/fa";
import React, { useState } from "react";
import logo from "../assets/main_logo.png";
import passwordIcon from "../assets/passwordIcon.png";
import loginBg from "../assets/login_bg.png";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

const AdminLogin = () => {
  const [email, setEmail] = useState(""); // The input field for email/username
  const [password, setPassword] = useState(""); // The input field for password
  const [error, setError] = useState(""); // Error state
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  // Navigate to the Admin dashboard if login is successful
  function dashboardNavigate(userData) {
    navigate("/Admin", { state: { userData } }); // Pass user data to Sidebar.jsx
  }

  // Login function using Firebase Authentication
  const handleLogin = async () => {
    try {
      // First, check if the input is a username or an email
      let userEmail = email;

      // Check if the input is a username (not an email format)
      if (!email.includes("@")) {
        // Fetch the user record from Firebase Realtime Database based on the username
        const usernameRef = ref(database, "users/");
        const snapshot = await get(usernameRef);
        let foundUser = null;

        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (userData.username === email) {
            foundUser = userData;
          }
        });

        if (!foundUser) {
          setError("Username not found. Please try again.");
          return;
        }

        userEmail = foundUser.email; // Set the userEmail from the found user data
      }

      // Sign in the user using Firebase Authentication (handles password hashing and comparison)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail, // Use the actual email associated with the username
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firebase Realtime Database
      const userRef = ref(database, "users/" + user.uid); // Reference to the user data in the database
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val(); // Get the user data from the database
        dashboardNavigate(userData); // Pass the user data to the dashboard
      } else {
        setError("No user data found in the database.");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left side (Login form) */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="flex justify-center items-center">
            <img src={logo} className="w-auto" alt="Logo" />
          </div>

          <div className="mt-12 flex flex-col items-center">
            <div className="w-full flex-1">
              <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                <div className="relative">
                  <input
                    className="w-full px-9.5 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    placeholder="Username or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute left-3 top-4">
                    <FaUserAlt className="text-[#724E2C] text-[18px]" />
                  </div>
                </div>

                <div className="relative mt-5">
                  <input
                    className="w-full px-9.5 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute left-2 top-3">
                    <img src={passwordIcon} alt="Password Icon" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-5 tracking-wide font-semibold bg-[#b18b68] cursor-pointer text-white-500 w-full py-4 rounded-lg hover:bg-[#724E2C] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <span className="ml-1 text-md text-white">Sign In</span>
                </button>
              </form>

              {error && <p className="text-red-500 mt-4">{error}</p>}

              <div className="mt-4 text-sm text-center">
                <a
                  href="#"
                  onClick={() => navigate("/LandingPage")}
                  className="text-[#b18b68] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right side (Persuasive Text) */}
        <div
          className="flex-1 bg-green-100 text-center hidden lg:flex relative"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-white px-8 py-6 flex flex-col justify-center items-center">
            <h2 className="text-4xl font-semibold mb-4">
              Welcome Back, Admin!
            </h2>
            <p className="text-lg">
              Log in to access the full control panel and manage all of your
              tasks with ease. Your business, your way—simplified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
