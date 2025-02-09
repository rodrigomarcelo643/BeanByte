import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa"; // Importing the edit icon from react-icons

const Profile = () => {
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setEdited(true); // Set to true when any changes are made
  };

  const handleSaveChanges = () => {
    Swal.fire({
      title: "Success!",
      text: "Your profile has been updated.",
      icon: "success",
      confirmButtonText: "Okay",
    });
    setIsEditing(false); // Exit edit mode after saving
    setEdited(false); // Reset edited flag
  };

  const handleEditToggle = () => {
    setIsEditing(true); // Enable edit mode
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center ">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8 space-y-6 relative">
        {/* Edit Icon positioned at the top left */}
        {!isEditing && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleEditToggle}
              className="p-2 bg-[#724E2C] text-white rounded-full shadow-md hover:bg-[#aa9988] focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
            >
              <FaEdit size={20} />
            </button>
          </div>
        )}

        {userData ? (
          <>
            <h2 className="text-3xl font-bold text-center text-[#724E2C]"></h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Username */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Contact Number */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={userData.contactNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col space-y-3">
                  <label className="text-lg font-semibold text-gray-800">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing} // Disable input when not editing
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && edited && (
                <div className="text-center">
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-[#724E2C] text-white rounded-lg shadow-md hover:bg-[#aa9988] focus:outline-none focus:ring-2 focus:ring-[#724E2C]"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No user data available
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
