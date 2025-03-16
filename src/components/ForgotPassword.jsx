import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase"; // Firebase auth import
import { sendPasswordResetEmail } from "firebase/auth"; // Firebase function for resetting password

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/AdminLogin");
  };

  const handlePasswordReset = async () => {
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-lg text-[#b18b68] hover:underline"
        >
          &larr; Back
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6">
          Forgot Password?
        </h2>

        <div className="space-y-4">
          {/* Email input */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b18b68] focus:border-[#b18b68] text-sm"
              placeholder="Enter your email"
            />
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Success message */}
          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
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
