// About.jsx
import React from "react";

const About = () => {
  return (
    <div className="bg-[#F4F1EB] py-16 px-8 md:px-16">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-600 mb-4">
            About Us
          </h2>
          <p className="text-xl text-gray-700">
            Discover the story behind our passion for creating the best coffee
            experience.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between space-x-4 items-center">
          {/* Left Column - Story */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h3 className="text-2xl font-semibold text-brown-600 mb-4">
              Business Story
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Bean&Co. began as a simple passion for mixing brewed coffee,
              experimenting with flavors in a small kitchen. What started as a
              personal curiosity soon became a shared love, with friends and
              family enjoying every sip. Inspired by this, a cozy coffee and
              pastry shop was born, offering handcrafted brews and freshly baked
              treats. Today, Bean&Co. continues to bring people together, one
              warm cup and delicious bite at a time.
            </p>
          </div>

          {/* Right Column - Values */}
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-semibold text-brown-600 mb-4">
              Business Values
            </h3>
            <ul className="space-y-4 text-lg text-gray-600">
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Premium Quality – Finest beans, freshest pastries, perfection in
                every sip and bite.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Community & Comfort – A cozy space to connect, unwind, and feel
                at home.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Craft & Passion – Every brew and bake is made with heart and
                dedication.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Sustainability – Ethical sourcing, eco-friendly practices,
                better coffee for a better world.
              </li>
            </ul>
          </div>
        </div>

        {/* Our Vision Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-brown-600 mb-4">
            Our Vision
          </h3>
          <p className="text-lg text-gray-600">
            To create a warm and welcoming space where people can enjoy quality
            coffee, delicious pastries, and meaningful moments one cup at a
            time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
