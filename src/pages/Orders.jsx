import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null); // To store selected order details for modal

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

  // Update order status to "Accepted"
  const acceptOrder = async (orderId) => {
    try {
      const orderRef = doc(firestore, "customerorders", orderId);
      await updateDoc(orderRef, { status: "Accepted" });
      fetchOrders(); // Re-fetch orders to update UI
      Swal.fire({
        icon: "success",
        title: "Order Accepted",
        text: "The order has been accepted successfully.",
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
                <th className="py-3 px-4 text-left">Order ID</th>

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

                return (
                  <tr
                    key={referenceNumber}
                    className="border-b hover:bg-gray-100 transition duration-200"
                  >
                    <td className="py-3 px-4">{referenceNumber}</td>

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
                              acceptOrder(ordersForReference[0].id);
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
              className="text-xl text-gray-500 float-right"
            >
              X
            </button>

            <h2 className="text-2xl font-bold mb-6">Order Details</h2>

            <div className="space-y-6">
              {/* Reference Number */}
              <div className="border-b border-dashed border-gray-300 pb-4 flex items-center space-x-4">
                <i className="fas fa-hashtag text-gray-600"></i>
                <p className="text-lg">
                  <strong>Order Id:</strong> {viewOrder[0].referenceNumber}
                </p>
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

              {/* Total Order Price */}
              <div className="border-b border-dashed border-gray-300 pb-4 flex items-center space-x-4">
                <i className="fas fa-credit-card text-gray-600"></i>
                <p className="text-lg">
                  <strong>Total Order Price:</strong> ₱{" "}
                  {viewOrder
                    .reduce(
                      (acc, order) => acc + order.price * order.quantity,
                      0
                    )
                    .toFixed(2)}
                </p>
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
                    <i className="fas fa-credit-card-front text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Payment Mode:</strong> {viewOrder[0].paymentMode}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file-invoice text-gray-500"></i>
                    <p className="text-sm">
                      <strong>Payment Reference:</strong>{" "}
                      {viewOrder[0].paymentReference}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-b border-dashed border-gray-300 pb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-3">
                  <i className="fas fa-info-circle text-gray-600"></i>
                  <span>Additional Information</span>
                </h3>
                <div className="flex items-center space-x-3 mb-3">
                  <i className="fas fa-align-left text-gray-500"></i>
                  <p className="text-sm">
                    <strong>Description:</strong> {viewOrder[0].description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-clock text-gray-500"></i>
                  <p className="text-sm">
                    <strong>Order Timestamp:</strong>{" "}
                    {new Date(
                      viewOrder[0].timestamp.seconds * 1000
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
