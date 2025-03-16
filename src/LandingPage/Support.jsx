// Support.jsx
import React, { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

const Support = () => {
  const [isFAQOpen, setIsFAQOpen] = useState(null);

  const toggleFAQ = (index) => {
    setIsFAQOpen(isFAQOpen === index ? null : index);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh on form submit

    // Trigger SweetAlert
    Swal.fire({
      icon: "success",
      title: "Message Sent!",
      text: "Your message has been sent successfully. We will get back to you shortly.",
      confirmButtonText: "Okay",
      confirmButtonColor: "#6F4E37", // Match the color of your theme
    });
  };

  return (
    <div className="bg-[#F4F1EB] py-16 px-8 md:px-16">
      <div className="container mx-auto">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-600 mb-4">
            Support
          </h2>
          <p className="text-xl text-gray-700">
            We're here to help! Whether you need assistance or have a question,
            we're just a message away.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-brown-600 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:bg-gray-100">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleFAQ(1)}
              >
                <h4 className="text-lg font-semibold text-brown-600">
                  How can I track my order?
                </h4>
                <span
                  className={`transform ${
                    isFAQOpen === 1 ? "rotate-180" : "rotate-0"
                  } transition-all duration-300`}
                >
                  ↑ {/* Modern Chevron Up */}
                </span>
              </div>
              {isFAQOpen === 1 && (
                <p className="mt-2 text-gray-600">
                  You can track your order by contacting us at [store’s mobile
                  number]. Our team will provide updates on your delivery.
                </p>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:bg-gray-100">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleFAQ(2)}
              >
                <h4 className="text-lg font-semibold text-brown-600">
                  What should I do if my order arrives damaged?
                </h4>
                <span
                  className={`transform ${
                    isFAQOpen === 2 ? "rotate-180" : "rotate-0"
                  } transition-all duration-300`}
                >
                  ↑ {/* Modern Chevron Up */}
                </span>
              </div>
              {isFAQOpen === 2 && (
                <p className="mt-2 text-gray-600">
                  If your order is damaged, please contact us immediately with a
                  photo of the item, and we’ll make it right.
                </p>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:bg-gray-100">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleFAQ(3)}
              >
                <h4 className="text-lg font-semibold text-brown-600">
                  Can I change or cancel my order?
                </h4>
                <span
                  className={`transform ${
                    isFAQOpen === 3 ? "rotate-180" : "rotate-0"
                  } transition-all duration-300`}
                >
                  ↑ {/* Modern Chevron Up */}
                </span>
              </div>
              {isFAQOpen === 3 && (
                <p className="mt-2 text-gray-600">
                  Yes, but only before it’s prepared. Contact us as soon as
                  possible to request changes or cancellation.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h3 className="text-2xl font-semibold text-brown-600 mb-4">
            Contact Us
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] transition-all duration-200"
                />
              </div>
            </div>
            <textarea
              placeholder="Your Message"
              rows="4"
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F4E37] transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#6F4E37] text-white rounded-lg hover:bg-[#95735C] transition-all duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
