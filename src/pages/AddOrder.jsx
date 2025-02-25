import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa"; // Shopping cart icon for the order button

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // Default quantity set to 1
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch all products and categories from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);

      // Extract unique categories for the dropdown filter
      const uniqueCategories = [
        "All",
        ...new Set(productsList.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);

      // Initialize filtered products with all products
      setFilteredProducts(productsList);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle category change
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    // Filter products based on category selection
    const filtered =
      category === "All"
        ? products
        : products.filter((product) => product.category === category);
    setFilteredProducts(filtered);

    // Reset product selection and quantity when the category changes
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Handle product selection from dropdown
  const handleProductChange = (event) => {
    const productId = event.target.value;
    const selectedProduct = products.find(
      (product) => product.id === productId
    );
    setSelectedProduct(selectedProduct);
    setQuantity(1); // Reset quantity to 1 when a new product is selected
  };

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value) || 1); // Default quantity is 1
  };

  // Handle adding the order to Firestore
  const handleAddOrder = async () => {
    if (!selectedProduct || quantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Order",
        text: "Please select a product and enter a valid quantity.",
      });
      return;
    }

    if (quantity > selectedProduct.stock) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Stock",
        text: `Only ${selectedProduct.stock} units are available for this product.`,
      });
      return;
    }

    const totalAmount = selectedProduct.price * quantity;
    const orderItems = [
      {
        productId: selectedProduct.id,
        productName: selectedProduct.productName,
        price: selectedProduct.price,
        quantity: quantity,
        totalAmount: totalAmount,
      },
    ];

    try {
      // Record the order in Firestore under "revenueorders" collection
      const orderRef = await addDoc(collection(firestore, "revenueorders"), {
        items: orderItems,
        totalAmount: totalAmount,
        status: "Pending",
        createdAt: new Date(),
      });

      // Check if the revenue document exists
      const revenueDocRef = doc(firestore, "revenue", "total");
      const revenueDocSnapshot = await getDoc(revenueDocRef);

      if (!revenueDocSnapshot.exists()) {
        // If the document doesn't exist, create it
        await setDoc(revenueDocRef, {
          totalRevenue: totalAmount,
        });
      } else {
        // If the document exists, increment the totalRevenue
        await updateDoc(revenueDocRef, {
          totalRevenue: increment(totalAmount), // Correct usage of increment
        });
      }

      Swal.fire({
        icon: "success",
        title: "Order Placed",
        text: "Your order has been successfully placed.",
      });

      // Reset the form after order is placed
      setSelectedProduct(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding order: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to place order.",
      });
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-white min-h-screen w-full lg:w-[85%] lg:ml-3">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">
        Add New Order
      </h3>

      {loading ? (
        <div className="flex justify-center items-center text-lg">
          Loading products...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="categorySelect"
              className="block text-lg font-semibold"
            >
              Select Category:
            </label>
            <select
              id="categorySelect"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection Dropdown */}
          <div>
            <label
              htmlFor="productSelect"
              className="block text-lg font-semibold"
            >
              Select Product:
            </label>
            <select
              id="productSelect"
              value={selectedProduct ? selectedProduct.id : ""}
              onChange={handleProductChange}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-100"
            >
              <option value="">-- Select a product --</option>
              {filteredProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Display selected product details */}
          {selectedProduct && (
            <div className="mt-4">
              <div className="flex items-center mb-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.productName}
                  className="w-24 h-40 object-cover rounded-md mr-4"
                />
                <div>
                  <p className="text-lg font-semibold">
                    {selectedProduct.productName}
                  </p>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₱ {parseFloat(selectedProduct.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center mt-2">
                <label htmlFor="quantity" className="mr-2 text-gray-700">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max={selectedProduct.stock}
                />
              </div>
            </div>
          )}

          {/* Display message if no product is selected */}
          {!selectedProduct && (
            <div className="text-center text-gray-600">
              Please select a product to place an order.
            </div>
          )}
        </div>
      )}

      {/* Button to place the order */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleAddOrder}
          className="flex items-center justify-center px-6 py-3 bg-[#724E2C] text-white rounded-lg cursor-pointer hover:bg-[#ac927a] transition-all duration-200"
        >
          <FaShoppingCart className="mr-2" />
          Place Order
        </button>
      </div>
    </div>
  );
}
