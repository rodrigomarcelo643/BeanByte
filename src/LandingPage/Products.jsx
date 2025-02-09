import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import { collection, getDocs, query, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(firestore, "products"));
      const querySnapshot = await getDocs(q);

      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productsList);
      setFilteredProducts(productsList);

      const uniqueCategories = [
        ...new Set(productsList.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch products.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    if (search) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleQuantityChange = (productId, action) => {
    setQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[productId] || 1;
      const newQuantity =
        action === "increase" ? currentQuantity + 1 : currentQuantity - 1;
      return {
        ...prevQuantities,
        [productId]: Math.max(1, newQuantity),
      };
    });
  };

  const handleOrder = (product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Error",
        text: "Please select a quantity before ordering.",
      });
    } else {
      Swal.fire({
        title: `Order ${product.productName}`,
        html: `
          <div class="space-y-4 p-4 text-left">
            <p><strong>Product:</strong> ${product.productName}</p>
            <p><strong>Price:</strong> ₱${parseFloat(product.price).toFixed(
              2
            )}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <input id="firstName" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your first name" required />
            <input id="lastName" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your last name" required />
            <input id="address" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your delivery address" required />
            <input id="contact" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Enter your contact number" required />
          </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const firstName = document.getElementById("firstName").value;
          const lastName = document.getElementById("lastName").value;
          const address = document.getElementById("address").value;
          const contact = document.getElementById("contact").value;

          if (!firstName || !lastName || !address || !contact) {
            Swal.showValidationMessage(
              "Please provide first name, last name, address, and contact number."
            );
            return false;
          }

          return { firstName, lastName, address, contact };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const { firstName, lastName, address, contact } = result.value;

          // Save the order in Firestore under "customerorders" collection
          const orderDetails = {
            product: product.productName,
            price: product.price,
            quantity,
            description: product.description,
            customer: {
              firstName,
              lastName,
              address,
              contact,
            },
            status: "Pending", // Order status (default to 'Pending')
            timestamp: new Date(),
          };

          // Add the order to Firestore
          addDoc(collection(firestore, "customerorders"), orderDetails)
            .then(() => {
              // Add a notification after successful order
              const notification = {
                message: `${firstName} ${lastName} ordered ${quantity} ${product.productName}(s)`,
                type: "order",
                timestamp: new Date(),
                status: "unread", // Notification status
              };

              addDoc(collection(firestore, "notifications"), notification)
                .then(() => {
                  Swal.fire({
                    icon: "success",
                    title: "Order Placed",
                    text: `You have successfully placed an order for ${quantity} ${product.productName}(s). The product will be delivered to: ${address}.`,
                    html: `
                      <p><strong>Name:</strong> ${firstName} </p><br>
                      <p><strong>Name:</strong> ${lastName} </p>
                      <p><strong>Contact:</strong> ${contact}</p>
                      <p><strong>Delivery Address:</strong> ${address}</p>
                    `,
                  });
                })
                .catch((error) => {
                  console.error(
                    "Error adding notification to Firestore: ",
                    error
                  );
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to send notification for the order.",
                  });
                });
            })
            .catch((error) => {
              console.error("Error adding order to Firestore: ", error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "There was an issue placing your order. Please try again.",
              });
            });
        }
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search, category]);

  return (
    <div className="p-6 sm:p-8 mt-20 bg-gray-50 min-h-screen">
      <h1 className="text-3xl text-center font-bold text-[#724E2C] mb-6">
        Our Products
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#724E2C] focus:outline-none"
          />
        </div>

        <div className="w-1/4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-[#724E2C] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center text-lg">
          Loading...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-600">No products found.</div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow-lg w-full sm:w-[280px] md:w-[300px] lg:w-[320px] xl:w-[350px] relative"
            >
              {/* Product Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-30 h-50 object-cover rounded-md"
                />
              </div>

              {/* Product Name */}
              <h3 className="text-2xl text-center font-semibold text-[#724E2C] truncate">
                {product.productName}
              </h3>

              {/* Product Price */}
              <p className="text-[#724E2C] text-center mt-2">
                ₱ {parseFloat(product.price).toFixed(2)}
              </p>

              {/* Product Description */}
              <p className="text-gray-600 mt-1 text-center">
                {product.description}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center mt-4 justify-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(product.id, "decrease")}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  -
                </button>
                <span>{quantities[product.id] || 1}</span>
                <button
                  onClick={() => handleQuantityChange(product.id, "increase")}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* Order Button */}
              <button
                onClick={() => handleOrder(product)}
                className="mt-4 w-full py-2 bg-[#724E2C] text-white font-bold rounded-md hover:bg-[#6a3a22] transition-all"
              >
                <FaShoppingCart className="inline mr-2" />
                Order Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
