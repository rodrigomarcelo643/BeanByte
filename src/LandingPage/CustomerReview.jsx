import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import customer1 from "../assets/profile.jpg";
import customer2 from "../assets/christian.jpg";
import customer3 from "../assets/lynx.jpg";

const reviewMap = {
  "Neil Delante": customer1,
  "Christian Bantoc": customer2,
  "Lynx Bernales": customer3,
};

const reviews = [
  {
    name: "Neil Delante",
    text: "The best coffee I’ve ever had! Every cup is a delight and the service is amazing!",
    stars: 4,
  },
  {
    name: "Christian Bantoc",
    text: "A wonderful experience every time. Their coffee is brewed to perfection and the ambiance is so cozy.",
    stars: 5,
  },
  {
    name: "Lynx Bernales",
    text: "Absolutely love it! The quality is unmatched, and I can’t get enough of their specialty brews.",
    stars: 5,
  },
];

export default function CustomerReview() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
      }
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-20 bg-white"
    >
      {/* Gray Line Above Title */}
      <div className="w-20 h-1 rounded-[10px] bg-[#8d6f53] mx-auto mb-8"></div>

      {/* Main Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#724E2C]">
          What Our Customers Are Saying
        </h1>
        <p className="text-lg text-gray-600 mt-3">
          Hear from our happy customers who can't get enough of our coffee.
        </p>
      </div>

      {/* Reviews Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            {/* Customer Image with Text Overlay */}
            <div className="relative group w-full mb-6">
              <img
                src={reviewMap[review.name]}
                alt={`${review.name}'s profile`}
                className="w-full h-[350px] object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-all duration-300 flex items-center justify-center rounded-lg">
                <p className="text-white text-center px-6 font-semibold">
                  {review.text}
                </p>
              </div>
            </div>

            {/* Customer Name */}
            <h2 className="text-lg font-semibold mt-4 text-[#724E2C]">
              {review.name}
            </h2>

            {/* Star Ratings */}
            <div className="mt-2 flex justify-center items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < review.stars ? "text-[#6F4E37]" : "text-gray-300"
                  }
                >
                  ⭐
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
