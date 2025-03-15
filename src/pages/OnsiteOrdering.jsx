import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert2

const OnsiteOrdering = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("Dine In");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Firestore based on the active tab (Dine In or Takeout)
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Query Firestore for orders based on the active tab (Dine In or Takeout)
      const q = query(
        collection(firestore, "OnsiteOrdering"),
        where("orderType", "==", activeTab)
      );
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle the confirmation action with SweetAlert2, record to OnsiteHistory and delete the order
  const handleConfirm = async (order) => {
    // Show SweetAlert confirmation
    const result = await Swal.fire({
      title: "Confirm this order?",
      text: "Once confirmed, the order will be recorded in the onsite history and removed from the onsite ordering list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm it!",
    });

    if (result.isConfirmed) {
      try {
        // Record the order details, including items, in the OnsiteHistory collection
        await addDoc(collection(firestore, "OnsiteHistory"), {
          orderId: order.id,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          status: "Paid", // You can modify this as per your requirement
          createdAt: new Date(), // Set current timestamp for when the order is confirmed
          items: order.items, // Record the items array
          orderType: order.orderType, // Store the type (Dine In or Takeout)
        });

        // Delete the order from the OnsiteOrdering collection
        const orderRef = doc(firestore, "OnsiteOrdering", order.id);
        await deleteDoc(orderRef);

        // Re-fetch the orders after confirming
        fetchOrders();

        // Show success message
        Swal.fire(
          "Confirmed!",
          "The order has been confirmed and added to onsite history.",
          "success"
        );
      } catch (error) {
        console.error("Error confirming order:", error);
        Swal.fire(
          "Error!",
          "There was an issue confirming the order.",
          "error"
        );
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen w-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-xl text-gray-500 mr-4">
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl text-center font-bold text-[#724E2C]">
          Onsite Ordering
        </h1>
      </div>

      {/* Tabs for Dine In and Takeout */}
      <div className="flex justify-center mb-4">
        {["Dine In", "Takeout"].map((tab) => (
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

      {/* Loading State */}
      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-[#724E2C] text-white">
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Payment Method</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{order.items[0].productName}</td>
                  <td className="px-4 py-2">{order.items[0].quantity}</td>
                  <td className="px-4 py-2">₱ {order.items[0].price}</td>
                  <td className="px-4 py-2">₱ {order.totalAmount}</td>
                  <td className="px-4 py-2">{order.paymentMethod}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        order.status === "Pending"
                          ? "bg-yellow-500"
                          : order.status === "Accepted"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(order.createdAt.seconds * 1000).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleConfirm(order)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OnsiteOrdering;
