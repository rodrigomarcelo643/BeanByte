import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTimesCircle } from "react-icons/fa";
import OnsiteOrdering from "./OnsiteOrdering";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("Pickup");
  const [viewPaymentProofUrl, setViewPaymentProofUrl] = useState("");
  const [showOnsiteOrdering, setShowOnsiteOrdering] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(firestore, "customerorders"),
        orderBy("timestamp", "desc"), // Sorting by timestamp (or other field you prefer)
        limit(ordersPerPage)
      );

      // If we have a lastVisible document, start after it
      const ordersQuery = lastVisible ? query(q, startAfter(lastVisible)) : q;

      const querySnapshot = await getDocs(ordersQuery);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update pagination state
      setOrders(ordersList);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (productName) => {
    try {
      const productRef = collection(firestore, "products");
      const q = query(productRef, where("productName", "==", productName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  // Accept order and update stock
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

  const declineOrder = async (orderId) => {
    try {
      const orderRef = doc(firestore, "customerorders", orderId);
      await updateDoc(orderRef, { status: "Declined" });
      fetchOrders();

      Swal.fire({
        icon: "warning",
        title: "Order Declined",
        text: "The order has been declined.",
      });
    } catch (error) {
      console.error("Error declining order:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to decline the order.",
      });
    }
  };

  const groupOrdersByReference = () => {
    return orders.reduce((acc, order) => {
      if (!acc[order.referenceNumber]) {
        acc[order.referenceNumber] = [];
      }
      acc[order.referenceNumber].push(order);
      return acc;
    }, {});
  };

  const handleViewOrder = (referenceNumber) => {
    const groupedOrders = groupOrdersByReference();
    setViewOrder(groupedOrders[referenceNumber]);
  };

  const handleCloseModal = () => {
    setViewOrder(null);
    setViewPaymentProofUrl("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewPaymentProof = (url) => {
    setViewPaymentProofUrl(url);
  };

  const handleOnsiteOrdering = () => {
    setShowOnsiteOrdering(true);
  };

  const handleBackToOrders = () => {
    setShowOnsiteOrdering(false);
  };

  const groupedOrders = groupOrdersByReference();

  // Pagination Control Functions
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen w-full lg:w-[85%]">
      {showOnsiteOrdering ? (
        <OnsiteOrdering onBack={handleBackToOrders} />
      ) : (
        <>
          <h1 className="text-3xl text-center font-bold text-[#724E2C] mb-6">
            Customer Orders
          </h1>
          <div className="flex justify-end mb-4">
            <button
              className="px-6 py-2 mx-2 text-lg font-semibold rounded-md bg-[#724E2C]  cursor-pointer text-white hover:bg-[#a08f7f] "
              onClick={handleOnsiteOrdering}
            >
              Onsite Ordering
            </button>
          </div>
          <div className="flex mb-4">
            {["Pickup", "Takeout"].map((tab) => (
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
                  {Object.keys(groupedOrders).map((referenceNumber) => {
                    const ordersForReference = groupedOrders[referenceNumber];
                    const totalPrice = ordersForReference.reduce(
                      (acc, order) => acc + order.price * order.quantity,
                      0
                    );

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
                            onClick={() => handleViewOrder(referenceNumber)}
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

          {/* Pagination Controls */}
          <div className="flex justify-center space-x-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded-md"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="self-center text-lg">{`Page ${currentPage}`}</span>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded-md"
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>

          {/* Modal for Payment Proof */}
          {viewPaymentProofUrl && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-1000">
              <div className="bg-white p-8 max-w-4xl w-full h-full rounded-lg shadow-lg overflow-auto">
                <button
                  onClick={() => setViewPaymentProofUrl("")}
                  className="text-xl text-gray-500 cursor-pointer float-right"
                >
                  <FaTimesCircle />
                </button>
                <h2 className="text-2xl font-bold mb-6">Payment Proof</h2>
                <div className="flex justify-center items-center">
                  <img
                    src={viewPaymentProofUrl}
                    alt="Payment Proof"
                    className="max-w-full h-150 "
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
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
              <div className="border-b border-dashed border-gray-300 pb-4 flex items-center space-x-4">
                <i className="fas fa-hashtag text-gray-600"></i>
              </div>
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
                    <div className="flex items-center space-x-3 mb-3">
                      <i className="fas fa-image text-gray-500"></i>
                      <p
                        className="text-sm text-blue-500 cursor-pointer"
                        onClick={() =>
                          handleViewPaymentProof(viewOrder[0].paymentProofUrl)
                        }
                      >
                        <strong>View Payment Proof</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
