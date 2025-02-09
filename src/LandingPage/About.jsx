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

        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Column - Story */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h3 className="text-2xl font-semibold text-brown-600 mb-4">
              Our Story
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              It all started with a love for premium, handpicked coffee beans
              and a vision to create a place where people could come together to
              enjoy expertly brewed coffee, in a relaxing environment. Our
              journey has taken us across the globe, and we’re proud to bring
              the world’s best coffee directly to you. Each cup we serve is a
              reflection of our commitment to quality, sustainability, and
              community.
            </p>
          </div>

          {/* Right Column - Values */}
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-semibold text-brown-600 mb-4">
              Our Values
            </h3>
            <ul className="space-y-4 text-lg text-gray-600">
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Quality: We source only the finest coffee beans, carefully
                selected to ensure the highest standards of flavor and
                freshness.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Sustainability: Our commitment to the environment is reflected
                in every part of our business, from sourcing to packaging.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Community: We believe in creating an inclusive environment where
                people can connect, share, and enjoy coffee together.
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-[#6F4E37] mr-3"></span>
                Innovation: We're constantly exploring new ways to enhance the
                coffee experience, from brewing techniques to the latest trends
                in the coffee industry.
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
            Our vision is to become the go-to destination for coffee lovers, a
            place where every cup is a journey, every sip is a moment of bliss,
            and every experience leaves you feeling connected and refreshed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
