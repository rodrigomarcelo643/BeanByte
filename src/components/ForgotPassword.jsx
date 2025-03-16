import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { auth, sendPasswordResetEmail } from "firebase/auth"; // Assuming the correct imports
import coffeeGif from "../assets/coffee.gif";

const LoadingModal = () => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-50">
    <div className="bg-white rounded-lg flex flex-col justify-center items-center p-4">
      <img src={coffeeGif} className="w-60 h-60" alt="Loading..." />
      <p className="mt-4 relative top-[-70px] text-[#724E2C] text-xl font-semibold">
        Bean&Co....
      </p>
    </div>
  </div>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // State for showing the loading modal
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/Bean&Co.Login");
  };

  const handlePasswordReset = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true); // Show loading modal

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false); // Hide loading modal
      return;
    }

    try {
      // Check if email exists in Firebase Authentication
      const methods = await auth.fetchSignInMethodsForEmail(email);

      if (methods.length === 0) {
        // Email does not exist in Firebase Authentication
        setError("Email not found. Please check the email address.");
        setLoading(false); // Hide loading modal
        return;
      }

      // Proceed with password reset if email exists in Firebase
      await sendPasswordResetEmail(auth, email);
      setTimeout(() => {
        setSuccessMessage("Password reset email sent! Check your inbox.");
        setLoading(false); // Hide loading modal after 2 seconds
      }, 2000); // Wait for 2 seconds before showing the success message
    } catch (err) {
      setTimeout(() => {
        setError("Error resetting password. Please try again.");
        setLoading(false); // Hide loading modal after 2 seconds
      }, 2000); // Wait for 2 seconds before showing the error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4 relative">
      {/* Show Loading Modal if loading state is true */}
      {loading && <LoadingModal />}

      <div className="relative max-w-md w-full bg-white p-8 rounded-lg shadow-lg space-y-6">
        {/* Back button with icon, fixed to top-left of the screen */}
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 cursor-pointer text-[#b18b68] text-2xl hover:text-[#724E2C] transition-all duration-200 z-50"
        >
          <FaArrowLeft />
        </button>

        <h2 className="text-2xl font-semibold text-center text-[#724E2C]">
          Forgot Password?
        </h2>

        <div className="space-y-1">
          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b18b68] focus:border-[#b18b68] text-sm"
            placeholder="Enter your email"
          />

          {/* Error message */}
          {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

          {/* Success message */}
          {successMessage && (
            <p className="text-green-500 text-sm mb-2">{successMessage}</p>
          )}

          {/* Reset password button */}
          <button
            onClick={handlePasswordReset}
            className="w-full py-3 bg-[#b18b68] text-white rounded-lg hover:bg-[#724E2C] transition-all duration-300"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
