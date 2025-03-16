import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert2

const OnsiteOrdering = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("Dine-in");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order for viewing all items

  // Fetch orders from Firestore based on the active tab (Dine In or Takeout)
  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Query Firestore for orders based on the active tab (Dine In or Takeout)
      const q = query(
        collection(firestore, "OnsiteOrdering"),
        where("orderType", "==", activeTab)
      );
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          items: data.items,
          orderType: data.orderType,
          paymentMethod: data.paymentMethod,
          status: data.status,
          totalAmount: data.totalAmount,
          createdAt: data.createdAt,
        };
      });

      // Calculate total pages
      const totalOrders = ordersList.length;
      setTotalPages(Math.ceil(totalOrders / ordersPerPage));

      // Slice the orders to match the current page
      const startIndex = (currentPage - 1) * ordersPerPage;
      const endIndex = startIndex + ordersPerPage;
      setOrders(ordersList.slice(startIndex, endIndex));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to the first page when changing tabs
  };

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

  // Pagination logic
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewItems = (order) => {
    setSelectedOrder(order); // Set the selected order to view its items
  };

  const handleCloseModal = () => {
    setSelectedOrder(null); // Close the modal
  };

  return (
    <div className=" bg-gray-50 min-h-screen w-full">
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
      ) : orders.length === 0 ? (
        <div className="text-center text-lg text-gray-600">No orders yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-[#724E2C] text-white">
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-6 py-2">Price Amount </th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Payment Method</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">
                    <div className="font-semibold">
                      {order.items[0].productName} ...
                    </div>
                  </td>
                  <td className="px-4 py-2">{order.items[0].quantity}</td>
                  <td className="px-9 py-2  ">
                    ₱ {parseFloat(order.items[0].price).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    ₱ {order.totalAmount.toFixed(2)}
                  </td>
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
                  <td className="px-4 py-2 flex space-x-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleConfirm(order)}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => handleViewItems(order)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-2 ${
              currentPage === index + 1
                ? "bg-[#724E2C] text-white"
                : "bg-gray-200 text-gray-600"
            } rounded-md hover:bg-gray-300`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Modal for Viewing All Items */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-999">
          <div className="bg-white p-6 rounded-md w-126">
            <h2 className="text-2xl font-semibold mb-4">Items in Order</h2>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between py-2 border-b border-dashed border-gray-400"
                >
                  <span>{item.productName}</span>
                  <span>
                    <span className="w-24 text-right">
                      ₱ {parseFloat(item.price).toFixed(2)} X {item.quantity}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {/* Display total amount of the order with dashed border */}
            <div className="flex justify-between mt-4 font-semibold border-t border-dashed border-gray-400 pt-4">
              <span>Total Amount</span>
              <span>₱ {selectedOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnsiteOrdering;
