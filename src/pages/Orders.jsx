import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 sm:p-8  bg-gray-50 min-h-screen w-full lg:w-[85%] ">
      <h1 className="text-3xl text-center font-bold text-[#724E2C] mb-6">
        Customer Orders
      </h1>

      {loading ? (
        <div className="flex justify-center items-center text-lg">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-600">No orders found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full table-auto bg-white border-collapse">
            <thead>
              <tr className="text-white bg-[#724E2C]">
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Quantity</th>
                <th className="py-3 px-4 text-left">Total Price</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-100 transition duration-200"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{order.product}</td>
                  <td className="py-3 px-4">
                    {order.customer.firstName} {order.customer.lastName}
                  </td>
                  <td className="py-3 px-4">{order.quantity}</td>
                  <td className="py-3 px-4">
                    ₱ {parseFloat(order.price * order.quantity).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`${
                        order.status === "Pending"
                          ? "bg-yellow-500"
                          : order.status === "Accepted"
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white py-1 px-3 rounded-full`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
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
                            acceptOrder(order.id);
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
                            declineOrder(order.id);
                          }
                        });
                      }}
                    >
                      Decline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
