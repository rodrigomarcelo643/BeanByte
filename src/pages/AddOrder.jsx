import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  increment,
  getDoc,
  setDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState("Dine-in"); // Default to Dine-in
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Default to Cash

  // Cart state to hold the added items
  const [cart, setCart] = useState([]);

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

  // Handle quantity increase
  const increaseQuantity = () => {
    if (quantity < selectedProduct?.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Handle quantity decrease
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Order",
        text: "Please select a product and enter a valid quantity.",
      });
      return;
    }

    // Check if the quantity exceeds stock
    if (quantity > selectedProduct.stock) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: `Only ${selectedProduct.stock}  are available for this product.`,
      });
      return;
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.findIndex(
      (item) => item.productId === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // If the product is already in the cart, update the quantity and totalAmount
      const updatedCart = [...cart];
      const existingItem = updatedCart[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.totalAmount = existingItem.price * existingItem.quantity;

      // Check again for stock to make sure the updated quantity does not exceed available stock
      if (existingItem.quantity > selectedProduct.stock) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Stock",
          text: `Only ${selectedProduct.stock} units are available for this product.`,
        });
        return;
      }

      // Update the cart with the modified item
      setCart(updatedCart);
    } else {
      // If the product is not in the cart, add a new entry
      const cartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.productName,
        price: selectedProduct.price,
        quantity: quantity,
        totalAmount: selectedProduct.price * quantity,
      };

      // Check again if the quantity exceeds stock before adding the new item
      if (cartItem.quantity > selectedProduct.stock) {
        Swal.fire({
          icon: "warning",
          title: "Insufficient Stock",
          text: `Only ${selectedProduct.stock} units are available for this product.`,
        });
        return;
      }

      setCart([...cart, cartItem]);
    }

    // Reset the selected product and quantity after adding to cart
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Handle order type selection (Dine-in or Take-out)
  const handleOrderTypeChange = (event) => {
    setOrderType(event.target.value);
  };

  // Handle payment method selection (Cash or GCash)
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  // Handle finalizing the order and adding it to Firestore
  const handleFinalizeOrder = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No items in cart",
        text: "Please add some products to the cart before finalizing the order.",
      });
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.totalAmount, 0);
    const today = new Date();

    try {
      // Record the order in Firestore under "OnsiteOrdering" collection
      const orderRef = await addDoc(collection(firestore, "OnsiteOrdering"), {
        items: cart,
        totalAmount: totalAmount,
        status: "Pending",
        orderType: orderType, // Save order type (Dine-in or Take-out)
        paymentMethod: paymentMethod, // Save selected payment method (Cash or GCash)
        createdAt: new Date(),
      });

      // Update revenue records (Daily, Weekly, Monthly, and Yearly)
      await updateRevenue(totalAmount, today);

      // Deduct the stock of each product in the cart
      await updateProductStock();

      Swal.fire({
        icon: "success",
        title: "Order Placed",
        text: "Your order has been successfully placed.",
      });

      // Reset the cart after the order is placed
      setCart([]);
    } catch (error) {
      console.error("Error adding order: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to place order.",
      });
    }
  };

  // Function to update revenue (Daily, Weekly, Monthly, Yearly)
  const updateRevenue = async (totalAmount, today) => {
    // Daily Revenue
    const dailyRevenueRef = doc(
      firestore,
      "dailyRevenue",
      today.toISOString().split("T")[0]
    );
    const dailyRevenueSnapshot = await getDoc(dailyRevenueRef);
    if (!dailyRevenueSnapshot.exists()) {
      await setDoc(dailyRevenueRef, {
        totalRevenue: totalAmount,
        revenueDetails: [
          {
            date: today,
            orderAmount: totalAmount,
          },
        ],
      });
    } else {
      await updateDoc(dailyRevenueRef, {
        totalRevenue: increment(totalAmount),
        revenueDetails: arrayUnion({
          date: today,
          orderAmount: totalAmount,
        }),
      });
    }

    // Weekly, Monthly, Yearly Revenue (same logic as daily, adapted for different time periods)
    // You can implement similar logic for weekly, monthly, and yearly revenue.
  };

  // Function to update product stock
  const updateProductStock = async () => {
    for (const item of cart) {
      const productRef = doc(firestore, "products", item.productId);
      const productSnapshot = await getDoc(productRef);
      if (productSnapshot.exists()) {
        const product = productSnapshot.data();
        const updatedStock = product.stock - item.quantity;
        await updateDoc(productRef, {
          stock: updatedStock,
        });
      }
    }
  };

  return (
    <div className="p-2 sm:p-3 bg-white min-h-screen w-full lg:w-[85%] lg:ml-3">
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

              {/* Quantity Controls */}
              <div className="flex items-center mt-2">
                <label htmlFor="quantity" className="mr-2 text-gray-700">
                  Quantity:
                </label>
                <button
                  onClick={decreaseQuantity}
                  className="px-4 py-2 border border-gray-300 rounded-l-md bg-gray-200 hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 p-2 border-t border-b border-gray-300 text-center"
                  min="1"
                  max={selectedProduct.stock}
                />
                <button
                  onClick={increaseQuantity}
                  className="px-4 py-2 border border-gray-300 rounded-r-md bg-gray-200 hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="mt-4 px-6 py-3 bg-[#724E2C] text-white font-semibold rounded-md hover:bg-blue-[#724E2C]"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Order Type Selection */}
          <div>
            <label className="block text-lg font-semibold">Order Type:</label>
            <div>
              <label className="mr-4">
                <input
                  type="radio"
                  value="Dine In"
                  checked={orderType === "Dine In"}
                  onChange={handleOrderTypeChange}
                />{" "}
                Dine-in
              </label>
              <label>
                <input
                  type="radio"
                  value="Takeout"
                  checked={orderType === "Takeout"}
                  onChange={handleOrderTypeChange}
                />{" "}
                Take-out
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-lg font-semibold">
              Payment Method:
            </label>
            <select
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-100"
            >
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
            </select>
          </div>

          {/* Display Cart */}
          {cart.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold mb-4">Your Cart:</h4>
              <ul>
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between mb-3">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>₱ {parseFloat(item.totalAmount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <p className="font-semibold">
                Total: ₱{" "}
                {cart
                  .reduce((sum, item) => sum + item.totalAmount, 0)
                  .toFixed(2)}
              </p>

              {/* Finalize Order Button */}
              <button
                onClick={handleFinalizeOrder}
                className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
              >
                Finalize Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
