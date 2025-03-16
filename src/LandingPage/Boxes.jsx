import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import supportIcon from "../assets/support.png"; // Corrected import for image
import salesIcon from "../assets/support.png"; // Add your other icons similarly
import processIcon from "../assets/support.png";
import productIcon from "../assets/product.png";
import qualityIcon from "../assets/quality.png";
import resultIcon from "../assets/result.png";

// Mapping of titles to corresponding images
const iconMap = {
  Support: supportIcon,
  Sales: salesIcon,
  Process: processIcon,
  Product: productIcon,
  Quality: qualityIcon,
  Result: resultIcon,
};

const boxes = [
  {
    title: "Support",
    description:
      "Need help? Our team is here for you! Whether it's order assistance or brewing tips, reach out via email, chat, or phone—we’ve got you covered.",
  },
  {
    title: "Sales",
    description:
      "Discover premium coffee blends at Bean&Co. Enjoy bold espressos and smooth brews, with exclusive deals available. Shop now for fresh, quality coffee delivered to you!",
  },
  {
    title: "Process",
    description:
      "From bean to cup, our process ensures every sip is perfect—carefully sourced, expertly brewed, and crafted with passion.",
  },
  {
    title: "Product",
    description:
      "Awaken your senses with our expertly brewed coffee, crafted from the finest beans—sip and savor the difference.",
  },
  {
    title: "Quality",
    description:
      "Enjoy premium quality in every cup—expertly brewed, made from the finest beans, and crafted to perfection.",
  },
  {
    title: "Result",
    description:
      "Experience the result of quality in every sip—premium coffee brewed to perfection, made from the finest beans.",
  },
];

export default function Boxes() {
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
      className="p-20"
    >
      {/* Main Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brown-600">
          Crafting the Perfect Cup, Every Step Focused on You
        </h1>
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mt-2">
          Every step designed for you, ensuring the perfect cup every time.
        </p>
      </div>

      {/* Boxes Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map((box, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col items-center justify-center p-6 
            ${index >= 3 ? "border-t border-gray-300" : ""} 
            ${index % 3 !== 0 ? "border-l border-gray-300" : ""}`}
          >
            {/* Dynamically Render Image Based on Title */}
            <img
              src={iconMap[box.title]}
              alt={`${box.title} icon`}
              className="w-10 h-10 mb-4"
            />
            <h2 className="text-lg font-semibold mt-2 mb-6">{box.title}</h2>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {box.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
