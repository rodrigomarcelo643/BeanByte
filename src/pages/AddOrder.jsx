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
  const [orderType, setOrderType] = useState("Take-out"); // Default order type is Take-out
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Default payment method is Cash

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

  // Handle order type selection (Dine-in or Take-out)
  const handleOrderTypeChange = (event) => {
    setOrderType(event.target.value);
  };

  // Handle payment method selection (Cash or GCash)
  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
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

    const today = new Date();

    try {
      // Record the order in Firestore under "revenueorders" collection
      const orderRef = await addDoc(collection(firestore, "revenueorders"), {
        items: orderItems,
        totalAmount: totalAmount,
        status: "Pending",
        orderType: orderType, // Save order type (Dine-in or Take-out)
        paymentMethod: paymentMethod, // Save selected payment method (Cash or GCash)
        createdAt: new Date(),
      });

      // Update the revenue for daily, weekly, monthly, and yearly

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

      // Weekly Revenue (Start of the week is Sunday, End is Saturday)
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(today.setDate(weekStart.getDate() + 6));

      const weeklyRevenueRef = doc(
        firestore,
        "weeklyRevenue",
        `${weekStart.toISOString().split("T")[0]}_${
          weekEnd.toISOString().split("T")[0]
        }`
      );
      const weeklyRevenueSnapshot = await getDoc(weeklyRevenueRef);
      if (!weeklyRevenueSnapshot.exists()) {
        await setDoc(weeklyRevenueRef, {
          totalRevenue: totalAmount,
          revenueDetails: [
            {
              date: today,
              orderAmount: totalAmount,
            },
          ],
        });
      } else {
        await updateDoc(weeklyRevenueRef, {
          totalRevenue: increment(totalAmount),
          revenueDetails: arrayUnion({
            date: today,
            orderAmount: totalAmount,
          }),
        });
      }

      // Monthly Revenue (Format: YYYY-MM)
      const monthKey = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const monthlyRevenueRef = doc(firestore, "monthlyRevenue", monthKey);
      const monthlyRevenueSnapshot = await getDoc(monthlyRevenueRef);
      if (!monthlyRevenueSnapshot.exists()) {
        await setDoc(monthlyRevenueRef, {
          totalRevenue: totalAmount,
          revenueDetails: [
            {
              date: today,
              orderAmount: totalAmount,
            },
          ],
        });
      } else {
        await updateDoc(monthlyRevenueRef, {
          totalRevenue: increment(totalAmount),
          revenueDetails: arrayUnion({
            date: today,
            orderAmount: totalAmount,
          }),
        });
      }

      // Yearly Revenue (Format: YYYY)
      const yearKey = `${today.getFullYear()}`;
      const yearlyRevenueRef = doc(firestore, "yearlyRevenue", yearKey);
      const yearlyRevenueSnapshot = await getDoc(yearlyRevenueRef);
      if (!yearlyRevenueSnapshot.exists()) {
        await setDoc(yearlyRevenueRef, {
          totalRevenue: totalAmount,
          revenueDetails: [
            {
              date: today,
              orderAmount: totalAmount,
            },
          ],
        });
      } else {
        await updateDoc(yearlyRevenueRef, {
          totalRevenue: increment(totalAmount),
          revenueDetails: arrayUnion({
            date: today,
            orderAmount: totalAmount,
          }),
        });
      }

      // Overall Revenue (Total revenue)
      const revenueDocRef = doc(firestore, "revenue", "total");
      const revenueDocSnapshot = await getDoc(revenueDocRef);

      if (!revenueDocSnapshot.exists()) {
        await setDoc(revenueDocRef, {
          totalRevenue: totalAmount,
        });
      } else {
        await updateDoc(revenueDocRef, {
          totalRevenue: increment(totalAmount),
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
            </div>
          )}

          {/* Order Type Selection */}
          <div>
            <label className="block text-lg font-semibold">Order Type:</label>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  value="Dine-in"
                  checked={orderType === "Dine-in"}
                  onChange={handleOrderTypeChange}
                  className="mr-2"
                />
                Dine-in
              </label>
              <label>
                <input
                  type="radio"
                  value="Take-out"
                  checked={orderType === "Take-out"}
                  onChange={handleOrderTypeChange}
                  className="mr-2"
                />
                Take-out
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-lg font-semibold">
              Payment Method:
            </label>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={handlePaymentMethodChange}
                  className="mr-2"
                />
                Cash
              </label>
              <label>
                <input
                  type="radio"
                  value="GCash"
                  checked={paymentMethod === "GCash"}
                  onChange={handlePaymentMethodChange}
                  className="mr-2"
                />
                GCash
              </label>
            </div>
          </div>

          {/* Order Button */}
          <button
            onClick={handleAddOrder}
            className="flex items-center mt-6 px-6 py-3 bg-[#724E2C] text-white font-semibold rounded-md hover:bg-blue-[#724E2C]"
          >
            <FaShoppingCart className="mr-2" /> Add Order
          </button>
        </div>
      )}
    </div>
  );
}
