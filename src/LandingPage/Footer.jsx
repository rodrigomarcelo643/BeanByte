import React from "react";
import main_logo from "../assets/main_logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#ad9685] via-[#8e6e58] to-[#7b5035] text-white shadow-lg py-12">
      <div className="container mx-auto px-8 flex flex-col sm:flex-row justify-between items-center">
        {/* Logo Section */}
        <div className="mb-6 sm:mb-0 flex items-center">
          <img
            src={main_logo}
            alt="Logo"
            className="w-32 h-auto transform transition-all duration-300 hover:scale-110"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row sm:space-x-12 mb-6 sm:mb-0 text-center sm:text-left">
          <a
            href="#home"
            className="text-lg font-semibold hover:text-gray-300 transition-colors duration-300 mb-3 sm:mb-0"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-lg font-semibold hover:text-gray-300 transition-colors duration-300 mb-3 sm:mb-0"
          >
            About
          </a>
          <a
            href="#products"
            className="text-lg font-semibold hover:text-gray-300 transition-colors duration-300 mb-3 sm:mb-0"
          >
            Products
          </a>
          <a
            href="#support"
            className="text-lg font-semibold hover:text-gray-300 transition-colors duration-300 mb-3 sm:mb-0"
          >
            Support
          </a>
        </div>

        {/* Divider Line */}
        <div className="w-full border-t-2 border-gray-300 my-4 sm:hidden"></div>

        {/* Copyright Section */}
        <div className="text-center sm:text-right mt-4 sm:mt-0">
          <p className="text-sm sm:text-base font-light opacity-80">
            &copy; 2025 Bean & Byte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
