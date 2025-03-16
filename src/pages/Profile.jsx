import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa"; // Edit Icon
import { ref, update } from "firebase/database"; // Import update from Firebase
import { database } from "../../config/firebase"; // Import Firebase database configuration
import coffeeGif from "../assets/coffee.gif"; // Import your loading gif

const LoadingModal = () => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-999">
    <div className="bg-white rounded-lg flex flex-col justify-center items-center">
      <img src={coffeeGif} className="w-60 h-60" alt="Loading..." />
      <p className="mt-4 text-[#724E2C] text-xl relative top-[-80px] font-semibold">
        Bean&Co....
      </p>
    </div>
  </div>
);

const Profile = () => {
  const location = useLocation();
  const userDataFromLocation = location.state?.userData;

  const [userData, setUserData] = useState(userDataFromLocation || {});
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state to handle loading
  const staticUid = "2V4sm171IeU4rb36SUoHkCLYSkG2";

  // Handle input change and immediately update userData state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      setEdited(true); // Mark as edited when there's any change
      return updatedData;
    });
  };

  // Save changes button (if you still want an explicit save)
  const handleSaveChanges = () => {
    setIsLoading(true); // Show loading modal

    // Create a copy of userData with only the keys present in the original userData
    const updatedData = Object.keys(userDataFromLocation).reduce((acc, key) => {
      if (userData[key] !== userDataFromLocation[key]) {
        acc[key] = userData[key]; // Only update the fields that have changed
      }
      return acc;
    }, {});

    // If there's any change to the data, update Firebase
    if (Object.keys(updatedData).length > 0) {
      const userRef = ref(database, "users/" + staticUid); // Update based on static UID
      update(userRef, updatedData)
        .then(() => {
          Swal.fire({
            title: "Success!",
            text: "Your profile has been updated.",
            icon: "success",
            confirmButtonText: "Okay",
          });
          setIsEditing(false);
          setEdited(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error); // Log error if update fails
          Swal.fire({
            title: "Error!",
            text: "There was an issue updating your profile.",
            icon: "error",
            confirmButtonText: "Try Again",
          });
        })
        .finally(() => {
          setIsLoading(false); // Hide loading modal after the operation is done
        });
    } else {
      Swal.fire({
        title: "No Changes!",
        text: "No changes were made to your profile.",
        icon: "info",
        confirmButtonText: "Okay",
      });
      setIsLoading(false);
    }
  };

  // Toggle edit mode
  const handleEditToggle = () => setIsEditing(true);

  // Render Input Field
  const renderInput = (label, name, type = "text") => (
    <div className="flex flex-col space-y-4">
      <label className="text-lg font-medium text-gray-800">{label}</label>
      <input
        type={type}
        name={name}
        value={userData[name] || ""}
        onChange={handleInputChange}
        disabled={!isEditing}
        className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center py-8">
      <div className="max-w-3xl w-full lg:ml-[-150px] bg-white shadow-lg rounded-xl p-10 space-y-8 relative">
        {/* Edit Icon */}
        {!isEditing && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleEditToggle}
              className="p-3 bg-[#724E2C] text-white rounded-full shadow-xl hover:bg-[#aa9988] focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
            >
              <FaEdit size={22} />
            </button>
          </div>
        )}

        {/* Profile Header */}
        <h2 className="text-3xl font-bold text-center text-[#724E2C]">
          Profile
        </h2>

        {/* Profile Details */}
        {userData ? (
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {renderInput("First Name", "firstName")}
              {renderInput("Last Name", "lastName")}
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {renderInput("Username", "username")}
              {renderInput("Email", "email", "email")}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {renderInput("Contact Number", "contactNumber")}
              {renderInput("Address", "address")}
            </div>

            {/* Save Button */}
            {isEditing && edited && (
              <div className="text-center">
                <button
                  onClick={handleSaveChanges}
                  className="px-8 py-3 bg-[#724E2C] text-white rounded-lg shadow-xl hover:bg-[#aa9988] focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No user data available
          </p>
        )}
      </div>

      {/* Show Loading Modal if data is being saved */}
      {isLoading && <LoadingModal />}
    </div>
  );
};

export default Profile;
