import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa"; // Edit Icon

const Profile = () => {
  const location = useLocation();
  const initialUserData = location.state?.userData;
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setEdited(true); // Set edited flag when data changes
  };

  // Save changes and exit edit mode
  const handleSaveChanges = () => {
    Swal.fire({
      title: "Success!",
      text: "Your profile has been updated.",
      icon: "success",
      confirmButtonText: "Okay",
    });
    setIsEditing(false);
    setEdited(false);
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
    </div>
  );
};

export default Profile;
