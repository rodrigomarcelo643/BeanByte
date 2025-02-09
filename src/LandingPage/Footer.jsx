import React from "react";
import main_logo from "../assets/main_logo.png";
const Footer = () => {
  return (
    <footer className="bg-[#ad9685] text-black shadow-md  py-6">
      <div className="container mx-auto px-8 flex justify-between items-center">
        <div>
          <img src={main_logo} alt="Logo" className="w-24" />
        </div>
        <div className="flex space-x-10">
          <a href="#home" className="hover:text-gray-300">
            Home
          </a>
          <a href="#about" className="hover:text-gray-300">
            About
          </a>
          <a href="#products" className="hover:text-gray-300">
            Products
          </a>
          <a href="#support" className="hover:text-gray-300">
            Support
          </a>
        </div>
        <div>
          <p>&copy; 2025 Bean & Byte. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
