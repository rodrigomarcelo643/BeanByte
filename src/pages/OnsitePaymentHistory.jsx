import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaTimesCircle, FaArrowLeft } from "react-icons/fa"; // Added back arrow icon

const OnsitePaymentHistory = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders from the OnsiteHistory collection
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = collection(firestore, "OnsiteHistory");
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error", "Failed to fetch orders from OnsiteHistory.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle "View" button click to show full details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Close the order details modal
  const closeOrderDetailsModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen w-full">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack} // Call the onBack function passed from parent component to go back
          className="text-xl text-gray-500 mr-4"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl text-center font-bold text-[#724E2C]">
          Onsite History
        </h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full table-auto bg-white border-collapse">
            <thead>
              <tr className="text-white bg-[#724E2C]">
                <th className="py-3 px-4 text-left">Total Amount</th>
                <th className="py-3 px-4 text-left">Payment Method</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">
                    ₱ {order.totalAmount.toFixed(2)}
                  </td>

                  <td className="py-3 px-4">{order.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`${
                        order.status === "Paid" ? "bg-green-500" : "bg-red-500"
                      } text-white py-1 px-3 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(order.createdAt.seconds * 1000).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex justify-center items-center bg-[rgba(0,0,0,0.3)] z-999">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#724E2C]">
                Order Details
              </h2>
              <button
                onClick={closeOrderDetailsModal}
                className="text-gray-500 text-2xl cursor-pointer hover:text-red-700"
              >
                <FaTimesCircle />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </div>
              <div>
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>Total Amount:</strong> ₱{" "}
                {selectedOrder.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="my-4 border-t-2 border-dashed border-gray-300"></div>

            {/* Display Products */}
            <div className="space-y-2">
              <strong>Items:</strong>
              {selectedOrder.items.map((item, index) => (
                <div key={index}>
                  <p>
                    {item.productName} x{item.quantity}
                  </p>
                  <p>₱ {item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="my-4 border-t-2 border-dashed border-gray-300"></div>

            <div className="space-y-2">
              <strong>Date:</strong>{" "}
              {new Date(
                selectedOrder.createdAt.seconds * 1000
              ).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnsitePaymentHistory;
