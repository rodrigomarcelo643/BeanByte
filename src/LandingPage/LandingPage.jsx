import React, { useState, useEffect } from "react";
import { FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import rightDesign from "../assets/rightDesign.png";
import img1 from "../assets/bean1.png";
import img2 from "../assets/bean2.png";
import img3 from "../assets/bean3.png";
import leftChevron from "../assets/leftChevron.png";
import rightChevron from "../assets/rightChevron.png";
import logo from "../assets/main_logo.png";
import About from "./About";
import Products from "./Products";
import Support from "./Support";
import Boxes from "./Boxes";
import { motion } from "framer-motion"; // Import Framer Motion
import CustomerReview from "./CustomerReview";
import Footer from "./Footer";

const LandingPage = () => {
  const [currentTab, setCurrentTab] = useState("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [animationClass, setAnimationClass] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true); // Track autoplay status
  const images = [img1, img2, img3];

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const nextImage = () => {
    setDirection("next");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setIsAutoPlay(false); // Stop autoplay when interacting
  };

  const prevImage = () => {
    setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsAutoPlay(false); // Stop autoplay when interacting
  };

  // Auto-play effect
  useEffect(() => {
    const autoPlayInterval = setInterval(() => {
      if (isAutoPlay) {
        nextImage();
      }
    }, 5000); // Auto-play every 5 seconds

    return () => clearInterval(autoPlayInterval); // Clear interval on component unmount
  }, [isAutoPlay, currentIndex]);

  useEffect(() => {
    setAnimationClass("");
    const timeoutId = setTimeout(() => {
      setAnimationClass(
        direction === "next" ? "animate-slide-left" : "animate-slide-right"
      );
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [currentIndex, direction]);

  useEffect(() => {
    // Start the autoplay after stopping it manually
    if (!isAutoPlay) {
      const timeoutId = setTimeout(() => {
        setIsAutoPlay(true); // Resume autoplay after a brief pause
      }, 4000); // Wait for 5 seconds before restarting autoplay

      return () => clearTimeout(timeoutId);
    }
  }, [isAutoPlay]);

  return (
    <div style={{ fontFamily: "Poppins" }} className="overflow-x-hidden">
      {/* Top Navbar */}
      <div className="bg-white bg-opacity-50 py-4 px-8 flex justify-between items-center fixed w-full top-0 left-0 z-10">
        <div className="text-2xl font-bold text-brown-600">
          <img src={logo} className="w-23 h-20" alt="Logo" />
        </div>

        {/* Centered Navbar Links (Visible on larger screens) */}
        <div className="hidden md:flex flex-grow justify-center ml-30 space-x-10">
          <a
            href="#home"
            onClick={() => handleTabChange("home")}
            className={`text-[17px] text-brown-600 relative transition-all duration-300 ease-in-out ${
              currentTab === "home" ? "text-[#6F4E37] font-bold" : ""
            }`}
          >
            Home
            {currentTab === "home" && (
              <div className="circle-animation absolute bottom-[-10px] left-1/2 transform -translate-x-1/2"></div>
            )}
          </a>
          <a
            href="#about"
            onClick={() => handleTabChange("about")}
            className={`text-[17px] text-brown-600 relative transition-all duration-300 ease-in-out ${
              currentTab === "about" ? "text-[#6F4E37] font-bold" : ""
            }`}
          >
            About
            {currentTab === "about" && (
              <div className="circle-animation absolute bottom-[-10px] left-1/2 transform -translate-x-1/2"></div>
            )}
          </a>
          <a
            href="#products"
            onClick={() => handleTabChange("products")}
            className={`text-[17px] text-brown-600 relative transition-all duration-300 ease-in-out ${
              currentTab === "products" ? "text-[#6F4E37] font-bold" : ""
            }`}
          >
            Products
            {currentTab === "products" && (
              <div className="circle-animation absolute bottom-[-10px] left-1/2 transform -translate-x-1/2"></div>
            )}
          </a>
          <a
            href="#support"
            onClick={() => handleTabChange("support")}
            className={`text-[17px] text-brown-600 relative transition-all duration-300 ease-in-out ${
              currentTab === "support" ? "text-[#6F4E37] font-bold" : ""
            }`}
          >
            Support
            {currentTab === "support" && (
              <div className="circle-animation absolute bottom-[-10px] left-1/2 transform -translate-x-1/2"></div>
            )}
          </a>
        </div>

        {/* Login and Sign Up on the Right (Visible on larger screens) */}
        <div className="hidden md:flex items-center space-x-6">
          <a
            href="#Order"
            onClick={() => handleTabChange("products")}
            className="text-[15px] shadow-lg border-2 bg-[#6F4E37] text-white border-[#6F4E37] py-1 px-7 hover:bg-[#e0bba1e1] hover:text-[#36322fe1] rounded-[10px] text-brown-600 hover:bg-brown-100"
          >
            Order Now!
          </a>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden text-2xl text-[#6F4E37]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FaTimes className="w-10 h-10" />
          ) : (
            <FaBars className="w-10 h-10" />
          )}
        </button>
      </div>
      {/* Mobile Navbar (Visible when menu is open) */}
      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } md:hidden bg-white py-4 px-8 mt-7 fixed flex flex-col items-start space-y-4 absolute top-16 left-0 w-full z-10`}
      >
        <a
          href="#home"
          onClick={() => handleTabChange("home")}
          className="text-lg text-brown-600 hover:text-gray-800"
        >
          Home
        </a>
        <a
          href="#about"
          onClick={() => handleTabChange("about")}
          className="text-lg text-brown-600 hover:text-gray-800"
        >
          About
        </a>
        <a
          href="#products"
          onClick={() => handleTabChange("products")}
          className="text-lg text-brown-600 hover:text-gray-800"
        >
          Products
        </a>
        <a
          href="#support"
          onClick={() => handleTabChange("support")}
          className="text-lg text-brown-600 hover:text-gray-800"
        >
          Support
        </a>

        <a
          href="#Order"
          className="text-[17px] border-2 border-[#6F4E37] py-1 px-7 hover:bg-[#6F4E37] hover:text-white rounded-[10px] text-brown-600 hover:bg-brown-100"
        >
          Order Now!
        </a>
      </div>
      {/* Main Content */}
      {currentTab === "home" && (
        <>
          <section
            className="flex flex-col md:flex-row items-center justify-between px-8 mt-18 bg-cover bg-center"
            style={{ backgroundImage: `url(${rightDesign})` }}
          >
            <div className="w-full md:w-1/2 space-y-8 p-10">
              <motion.h1
                className="text-4xl md:text-[40px] font-bold text-brown-600"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Make every day meaningful, one cup <br></br> at a time.
              </motion.h1>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="relative bg-gray-300 p-1 rounded-full w-16 h-16 flex items-center justify-center">
                    <img
                      src={img1}
                      alt="Profile 1"
                      className="rounded-full w-20 h-20 object-cover"
                    />
                  </div>
                  <div className="relative bg-gray-300 left-[-17px] p-1 rounded-full w-16 h-16 flex items-center justify-center">
                    <img
                      src={img2}
                      alt="Profile 2"
                      className="rounded-full w-25 h-25 object-cover"
                    />
                  </div>
                  <div className="relative bg-gray-300 p-1 left-[-34px] rounded-full w-16 h-16 flex items-center justify-center">
                    <img
                      src={img3}
                      alt="Profile 3"
                      className="rounded-full w-25 h-25 object-cover"
                    />
                  </div>
                </div>

                <motion.p
                  className="text-[18px] font-bold relative left-[-25px] text-[#977B60]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Sip into serenity—where every cup is brewed to perfection, and
                  every moment feels like home.
                </motion.p>
              </div>
              <button
                onClick={() => handleTabChange("products")}
                className="px-8 py-3 bg-[#6F4E37] hover:bg-[#95735C] cursor-pointer mt-5 text-white text-[18px] rounded-[10px] hover:bg-brown-700 flex items-center space-x-2"
              >
                <span>Explore</span>
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full md:w-1/2 bg-transparent p-7 py-10 rounded-md">
              <div className="relative">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={prevImage}
                    className="absolute left-0 cursor-pointer hover:bg-[#B4ADAD] transform -translate-x-8 bg-[#D9D9D9] text-white rounded-full p-4"
                  >
                    <img
                      src={leftChevron}
                      className="w-10 h-10"
                      alt="Left Chevron"
                    />
                  </button>
                  <div className="w-full max-w-xl mx-auto">
                    <img
                      src={images[currentIndex]}
                      alt={`Carousel Image ${currentIndex + 1}`}
                      className={`w-[280px] h-[450px] object-cover rounded-md mx-auto transition-all duration-500 ease-in-out ${animationClass}`}
                    />
                    <div className="flex justify-center space-x-2 mt-10">
                      {images.map((_, index) => (
                        <span
                          key={index}
                          className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
                            index === currentIndex
                              ? "bg-[#6F4E37] border border-[#6F4E37] bg-opacity-100"
                              : "border border-[#6F4E37] bg-transparent"
                          }`}
                          onClick={() => setCurrentIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 transform cursor-pointer hover:bg-[#B4ADAD] translate-x-8 bg-[#D9D9D9] text-white rounded-full p-3"
                  >
                    <img
                      src={rightChevron}
                      className="w-10.5 h-10.5"
                      alt="Right Chevron"
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Add spacing between section and Boxes */}
          <div className="mt-10">
            <Boxes />
          </div>
        </>
      )}
      {/* Render Section based on the active tab */}
      <div className="mt-16 transition-all duration-500">
        {currentTab === "about" && <About />}
        {currentTab === "products" && <Products />}
        {currentTab === "support" && <Support />}
      </div>
      <Footer /> {/* Footer Component */}
      <style jsx>{`
        .animate-slide-left {
          animation: slide-left 0.5s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.5s ease-out;
        }

        @keyframes slide-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .circle-animation {
          width: 30px;
          height: 2px;
          background-color: #6f4e37;
          border-radius: 2%;

          animation: circleGrow 0.3s ease-in-out;
        }

        @keyframes circleGrow {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
