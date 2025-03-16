import { FaUserAlt } from "react-icons/fa";
import React, { useState } from "react";
import logo from "../assets/main_logo.png";
import passwordIcon from "../assets/passwordIcon.png";
import loginBg from "../assets/login_bg.png";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import coffeeGif from "../assets/coffee.gif";
const LoadingModal = () => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-999">
    <div className="bg-white rounded-lg flex flex-col justify-center items-center">
      <img src={coffeeGif} className="w-60 h-60" />
      <p className="mt-4 text-[#724E2C] text-xl  relative top-[-80px] tefont-semibold">
        Bean&Co....
      </p>{" "}
    </div>
  </div>
);

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notFoundError, setNotFoundError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  function dashboardNavigate(userData) {
    navigate("/Bean&Co.Admin", { state: { userData } });
  }
  const handleLogin = async () => {
    setUsernameError("");
    setPasswordError("");
    setNotFoundError("");
    setError("");
    setLoading(true);

    try {
      let userEmail = email;
      if (!email.includes("@")) {
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
          setUsernameError("Username not found. Please try again.");
          setLoading(false);
          return;
        }

        userEmail = foundUser.email;
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userEmail,
        password
      );
      const user = userCredential.user;

      const userRef = ref(database, "users/" + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        setTimeout(() => {
          setLoading(false);
          dashboardNavigate(userData);
        }, 4000);
      } else {
        setNotFoundError("No user data found in the database.");
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      if (err.code === "auth/wrong-password") {
        setPasswordError("Invalid password. Please try again.");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left side (Login form) */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="flex justify-center items-center">
            <img src={logo} className="w-26 h-26" alt="Logo" />
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
                  {/* Display username error message */}
                  {usernameError && (
                    <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                  )}
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
                  {/* Display password error message */}
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-5 tracking-wide font-semibold bg-[#b18b68] cursor-pointer text-white-500 w-full py-4 rounded-lg hover:bg-[#724E2C] transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <span className="ml-1 text-md text-white">Sign In</span>
                </button>

                {/* Show loading modal if loading is true */}
                {loading && <LoadingModal />}

                {error && <p className="text-red-500 mt-4">{error}</p>}
                {notFoundError && (
                  <p className="text-red-500 mt-4">{notFoundError}</p>
                )}
              </form>

              <div className="mt-4 text-sm text-center">
                <a
                  href="#"
                  onClick={() => navigate("/ForgotPassword")}
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
