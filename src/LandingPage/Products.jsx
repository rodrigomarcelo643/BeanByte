import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  query,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // To generate reference number

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]); // Cart state
  const [showCartModal, setShowCartModal] = useState(false); // Show cart modal
  const [step, setStep] = useState(1); // Modal step (1 for order details, 2 for checkout form)
  const [checkoutDetails, setCheckoutDetails] = useState({
    fullName: "",
    contactNumber: "",
    address: "",
    paymentMode: "",
    paymentReference: "", // Store the payment reference input
  });
  const [orderReference, setOrderReference] = useState(null); // Store reference number

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

  const addToCart = async (product) => {
    const quantity = quantities[product.id] || 1;
    const existingProductIndex = cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      const cartItem = { ...product, quantity };
      setCart([...cart, cartItem]);
    }

    // Add the cart item to Firestore 'carts' collection
    try {
      await addDoc(collection(firestore, "carts"), {
        productId: product.id,
        productName: product.productName,
        price: product.price,
        quantity,
        timestamp: new Date(),
      });

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: `${product.productName} has been added to your cart.`,
      });

      // Reset quantity to 1 after adding to the cart
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [product.id]: 1,
      }));
    } catch (error) {
      console.error("Error adding item to cart in Firestore: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an issue adding the item to your cart. Please try again.",
      });
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cart Empty",
        text: "Please add products to your cart before proceeding to checkout.",
      });
      return;
    }
    setOrderReference(uuidv4()); // Generate unique order reference
    setStep(1); // Set the modal to the first step (order details)
    setShowCartModal(true); // Open the modal for checkout
  };

  const handleFinalizeOrder = async () => {
    const { fullName, contactNumber, address, paymentMode, paymentReference } =
      checkoutDetails;

    if (
      !fullName ||
      !contactNumber ||
      !address ||
      !paymentMode ||
      !paymentReference
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill out all the fields.",
      });
      return;
    }

    const orderDetails = cart.map((product) => ({
      product: product.productName,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      status: "Pending",
      timestamp: new Date(),
      referenceNumber: orderReference,
      paymentReference, // Add payment reference ID to the order
      fullName,
      contactNumber,
      address,
      paymentMode,
    }));

    // Add orders to Firestore
    try {
      await Promise.all(
        orderDetails.map((order) =>
          addDoc(collection(firestore, "customerorders"), order)
        )
      );

      // Remove cart items from Firestore after successful order placement
      const cartsSnapshot = await getDocs(collection(firestore, "carts"));
      const cartDocs = cartsSnapshot.docs.filter((doc) =>
        cart.some((item) => item.id === doc.data().productId)
      );

      await Promise.all(
        cartDocs.map((doc) => deleteDoc(doc.ref)) // Delete cart documents
      );

      Swal.fire({
        icon: "success",
        title: "Order Placed",
        text: `Your order has been placed successfully! Reference Number: ${orderReference} Payment Reference: ${paymentReference}`,
      });

      // Clear the cart after the order is placed
      setCart([]);
      setShowCartModal(false); // Close the modal
    } catch (error) {
      console.error("Error placing order: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an issue placing your order. Please try again.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowCartModal(false);
    setStep(1); // Reset to the first step when the modal is closed
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

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(product)}
                className="mt-4 w-full py-2 bg-[#724E2C] text-white font-bold rounded-md hover:bg-[#6a3a22] transition-all"
              >
                <FaShoppingCart className="inline mr-2" />
                Add To Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cart Button */}
      <div
        className="fixed bottom-8 right-8 bg-[#724E2C] text-white p-4 w-[80px] h-[80px] rounded-full shadow-lg cursor-pointer flex items-center justify-center flex-col"
        onClick={handleCheckout}
      >
        <span className="text-sm">{cart.length}</span> {/* Bigger number */}
        <FaShoppingCart size={40} /> {/* Bigger cart icon */}
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex justify-center items-center z-10">
          <div className="bg-white p-6 w-[100%] md:w-[100%] h-full ">
            {/* Close Modal Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-xl text-gray-500"
            >
              X
            </button>

            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.productName}</span>
                      <span>₱ {parseFloat(item.price).toFixed(2)}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold mt-4">
                  <span>Total</span>
                  <span>
                    ₱{" "}
                    {cart
                      .reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setStep(2)} // Go to checkout step
                  className="mt-4 w-full py-2 bg-[#724E2C] text-white font-bold rounded-md hover:bg-[#6a3a22]"
                >
                  Checkout
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Checkout</h2>

                {/* Checkout Form */}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={checkoutDetails.fullName}
                    onChange={(e) =>
                      setCheckoutDetails({
                        ...checkoutDetails,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={checkoutDetails.contactNumber}
                    onChange={(e) =>
                      setCheckoutDetails({
                        ...checkoutDetails,
                        contactNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={checkoutDetails.address}
                    onChange={(e) =>
                      setCheckoutDetails({
                        ...checkoutDetails,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={checkoutDetails.paymentMode}
                    onChange={(e) =>
                      setCheckoutDetails({
                        ...checkoutDetails,
                        paymentMode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Gcash">Gcash</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>

                  {/* Payment Reference Input */}
                  <input
                    type="text"
                    placeholder="Payment Reference Number"
                    value={checkoutDetails.paymentReference}
                    onChange={(e) =>
                      setCheckoutDetails({
                        ...checkoutDetails,
                        paymentReference: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={handleFinalizeOrder}
                  className="mt-4 w-full py-2 bg-[#724E2C] text-white font-bold rounded-md hover:bg-[#6a3a22]"
                >
                  Finalize Order
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
