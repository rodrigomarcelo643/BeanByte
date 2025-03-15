import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTimesCircle } from "react-icons/fa";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null); // To store selected order details for modal
  const [activeTab, setActiveTab] = useState("Pickup"); // Active tab (default is Pickup)

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = collection(firestore, "customerorders");
      const querySnapshot = await getDocs(q);

      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore unique hashed ID (not displayed in table)
        ...doc.data(),
      }));

      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch product details from the products collection based on productName
  const fetchProduct = async (productName) => {
    try {
      const productRef = collection(firestore, "products");
      const q = query(productRef, where("productName", "==", productName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        return productDoc;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product: ", error);
      return null;
    }
  };

  const acceptOrder = async (orderId, ordersForReference) => {
    try {
      const orderRef = doc(firestore, "customerorders", orderId);

      // Check product stock and update the stock
      for (let order of ordersForReference) {
        const product = await fetchProduct(order.product);
        if (product) {
          const productStock = parseInt(product.data().stock);
          const orderedQuantity = order.quantity;

          // Check if enough stock is available
          if (productStock < orderedQuantity) {
            Swal.fire({
              icon: "error",
              title: "Insufficient Stock",
              text: `Not enough stock for ${order.product}. Only ${productStock} available.`,
            });
            return;
          }

          // Reduce the stock and update the Firestore product document
          await updateDoc(doc(firestore, "products", product.id), {
            stock: productStock - orderedQuantity,
          });
        }
      }

      // Create a payment history document with all the products in one document
      const paymentHistoryRef = doc(
        collection(firestore, "paymentHistory"),
        orderId
      );

      const orderDetails = ordersForReference.map((order) => ({
        product: order.product,
        quantity: order.quantity,
        price: order.price,
        total: order.price * order.quantity,
      }));

      await setDoc(paymentHistoryRef, {
        customer: ordersForReference[0].fullName,
        address: ordersForReference[0].address,
        contactNumber: ordersForReference[0].contactNumber,
        paymentMode: ordersForReference[0].paymentMode,
        status: "Accepted",
        orderDetails: orderDetails,
        totalPrice: orderDetails.reduce((acc, item) => acc + item.total, 0),
        paymentProofUrl: ordersForReference[0].paymentProofUrl || "",
        timestamp: new Date(),
      });

      // Delete the accepted order from the "customerorders" collection
      await deleteDoc(orderRef);

      // Re-fetch orders to update UI
      fetchOrders();
      Swal.fire({
        icon: "success",
        title: "Order Accepted",
        text: "The order has been accepted and moved to payment history.",
      });
    } catch (error) {
      console.error("Error accepting order: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to accept the order.",
      });
    }
  };

  // Update order status to "Declined"
  const declineOrder = async (orderId) => {
    try {
      const orderRef = doc(firestore, "customerorders", orderId);
      await updateDoc(orderRef, { status: "Declined" });
      fetchOrders(); // Re-fetch orders to update UI
      Swal.fire({
        icon: "warning",
        title: "Order Declined",
        text: "The order has been declined.",
      });
    } catch (error) {
      console.error("Error declining order: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to decline the order.",
      });
    }
  };

  // Group orders by referenceNumber
  const groupOrdersByReference = () => {
    const grouped = orders.reduce((acc, order) => {
      if (!acc[order.referenceNumber]) {
        acc[order.referenceNumber] = [];
      }
      acc[order.referenceNumber].push(order);
      return acc;
    }, {});

    return grouped;
  };

  // Handle view order details in modal
  const handleViewOrder = (referenceNumber) => {
    const groupedOrders = groupOrdersByReference();
    setViewOrder(groupedOrders[referenceNumber]);
  };

  // Close the modal
  const handleCloseModal = () => {
    setViewOrder(null);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Get grouped orders
  const groupedOrders = groupOrdersByReference();

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen w-full lg:w-[85%] ">
      <h1 className="text-3xl text-center font-bold text-[#724E2C] mb-6">
        Customer Orders
      </h1>

      {/* Tabs for Pickup, Dine In, and Takeout */}
      <div className="flex justify-center mb-4">
        {["Pickup", "Dine In", "Takeout"].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 mx-2 text-lg font-semibold rounded-t-md transition-all ${
              activeTab === tab
                ? "text-white bg-[#724E2C] border-b-4 border-[#724E2C]"
                : "text-gray-600 bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center text-lg">
          Loading...
        </div>
      ) : Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-600">No orders found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full table-auto bg-white border-collapse">
            <thead>
              <tr className="text-white bg-[#724E2C]">
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Total Price</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedOrders).map((referenceNumber, index) => {
                const ordersForReference = groupedOrders[referenceNumber];
                const totalPrice = ordersForReference.reduce(
                  (acc, order) => acc + order.price * order.quantity,
                  0
                );

                // Filter orders by active tab
                if (ordersForReference[0].pickupOrTakeout !== activeTab)
                  return null;

                return (
                  <tr
                    key={referenceNumber}
                    className="border-b hover:bg-gray-100 transition duration-200"
                  >
                    <td className="py-3 px-4">
                      {ordersForReference[0].fullName}
                    </td>
                    <td className="py-3 px-4">₱ {totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`${
                          ordersForReference[0].status === "Pending"
                            ? "bg-yellow-500"
                            : ordersForReference[0].status === "Accepted"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } text-white py-1 px-3 rounded-full`}
                      >
                        {ordersForReference[0].status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition"
                        onClick={() => handleViewOrder(referenceNumber)} // View details modal
                      >
                        View
                      </button>
                      <button
                        className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition"
                        onClick={() => {
                          Swal.fire({
                            title: "Accept Order?",
                            text: "Are you sure you want to accept this order?",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#28a745",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, accept it!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              acceptOrder(
                                ordersForReference[0].id,
                                ordersForReference
                              );
                            }
                          });
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition"
                        onClick={() => {
                          Swal.fire({
                            title: "Decline Order?",
                            text: "Are you sure you want to decline this order?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#dc3545",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, decline it!",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              declineOrder(ordersForReference[0].id);
                            }
                          });
                        }}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Viewing Order Details */}
      {viewOrder && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-999">
          <div className="bg-white p-8 max-w-4xl w-full h-full rounded-lg shadow-lg overflow-auto">
            <button
              onClick={handleCloseModal}
              className="text-xl text-gray-500 cursor-pointer float-right"
            >
              <FaTimesCircle />
            </button>

            <h2 className="text-2xl font-bold mb-6">Order Details</h2>

            <div className="space-y-6">
              {/* Reference Number */}
              <div className="border-b border-dashed border-gray-300 pb-4 flex items-center space-x-4">
                <i className="fas fa-hashtag text-gray-600"></i>
              </div>

              {/* Product Details */}
              <div className="border-b border-dashed border-gray-300 pb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
                  <i className="fas fa-box-open text-gray-600"></i>
                  <span>Products</span>
                </h3>
                {viewOrder.map((order, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <i className="fas fa-cogs text-gray-500"></i>
                      <p className="text-sm">
                        <strong>Product:</strong> {order.product}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <i className="fas fa-sort-numeric-up text-gray-500"></i>
                      <p className="text-sm">
                        <strong>Quantity:</strong> {order.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-money-bill-wave text-gray-500"></i>
                      <p className="text-sm">
                        <strong>Total Price:</strong> ₱{" "}
                        {parseFloat(order.price * order.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Information */}
              <div className="flex space-x-8">
                <div className="flex-1 border-b border-dashed border-gray-300 pb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
                    <i className="fas fa-user text-gray-600"></i>
                    <span>Customer Information</span>
                  </h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fas fa-user-tag text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Customer Name:</strong> {viewOrder[0].fullName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fas fa-info-circle text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Status:</strong> {viewOrder[0].status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fas fa-map-marker-alt text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Address:</strong> {viewOrder[0].address}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-phone-alt text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Contact:</strong> {viewOrder[0].contactNumber}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="flex-1 border-b border-dashed border-gray-300 pb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
                    <i className="fas fa-credit-card text-gray-600"></i>
                    <span>Payment Information</span>
                  </h3>
                  <div className="flex items-center space-x-3 mb-3">
                    <i className="fas fa-credit-card text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Payment Mode:</strong> {viewOrder[0].paymentMode}
                    </p>
                  </div>
                  {viewOrder[0].paymentProofUrl && (
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-image text-gray-500"></i>
                      <a
                        href={viewOrder[0].paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View Payment Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="text-center mt-6">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
