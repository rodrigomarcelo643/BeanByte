import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminIcon from "../assets/adminIcon.png";
import customerIcon from "../assets/customerIcon.png";
import logo from "../assets/main_logo.png";
import coffeeGif from "../assets/coffee.gif";

const LoadingModal = () => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-50">
    <div className="bg-white rounded-lg flex flex-col justify-center items-center">
      <img src={coffeeGif} className="w-60 h-60" alt="Loading" />
      <p className="mt-4 text-[#724E2C] text-xl relative top-[-80px] font-semibold">
        Bean&Co....
      </p>
    </div>
  </div>
);

const DefaultPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setLoading(true);
    setTimeout(() => {
      if (role === "admin") {
        navigate("/Bean&Co.Login");
      } else {
        navigate("/Bean&Co.");
      }
    }, 4000); // Wait 4 seconds before navigating
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      {/* Show loading modal if loading is true */}
      {loading && <LoadingModal />}

      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg space-y-6">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48"
            alt="Logo"
          />
        </div>

        <div className="flex justify-center space-x-6 flex-wrap sm:space-x-10">
          {/* Admin Box */}
          <div
            className="flex flex-col items-center justify-center bg-[#f3f3f3] p-6 rounded-sm shadow-md cursor-pointer hover:bg-[#e0e0e0] transition-all duration-300 ease-in-out w-32 sm:w-48 md:w-56 border-2 border-[#bd9d7f]"
            onClick={() => handleSelect("admin")}
          >
            <img
              src={adminIcon}
              alt="Admin Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4"
            />
            <p className="text-xl sm:text-2xl text-gray-600 font-medium">
              Admin
            </p>
          </div>

          {/* Customer Box */}
          <div
            className="flex flex-col items-center justify-center bg-[#f3f3f3] p-6 rounded-sm shadow-md cursor-pointer hover:bg-[#e0e0e0] transition-all duration-300 ease-in-out w-32 sm:w-48 md:w-56 border-2 border-[#bd9d7f]"
            onClick={() => handleSelect("customer")}
          >
            <img
              src={customerIcon}
              alt="Customer Icon"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4"
            />
            <p className="text-xl sm:text-2xl text-gray-600 font-medium">
              Customer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultPage;
