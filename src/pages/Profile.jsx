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
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center py-8">
      <div className="max-w-3xl w-full lg:ml-[-150px] bg-white shadow-lg rounded-xl p-10 space-y-8 relative">
        {/* Edit Icon positioned at the top right */}
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

        {userData ? (
          <>
            <h2 className="text-3xl font-bold text-center text-[#724E2C]">
              Profile
            </h2>

            <div className="space-y-8">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>
              </div>

              {/* Username and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>
              </div>

              {/* Contact Number and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={userData.contactNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <label className="text-lg font-medium text-gray-800">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#724E2C] transition-all"
                  />
                </div>
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
