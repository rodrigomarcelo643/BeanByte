import React, { useState, useEffect } from "react";
import { firestore } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTimesCircle } from "react-icons/fa";
import OnsitePaymentHistory from "./OnsitePaymentHistory";

export default function PaymentHistory() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentProofModal, setShowPaymentProofModal] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState(null);
  const [showOnsitePaymentHistory, setShowOnsitePaymentHistory] =
    useState(false);

  // Fetch payment history from Firestore
  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const q = collection(firestore, "paymentHistory");
      const querySnapshot = await getDocs(q);
      const paymentHistoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPaymentHistory(paymentHistoryList);
    } catch (error) {
      console.error("Error fetching payment history: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch payment history.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleViewPaymentProof = (proofUrl) => {
    setPaymentProofUrl(proofUrl);
    setShowPaymentProofModal(true);
  };
  const closePaymentProofModal = () => {
    setShowPaymentProofModal(false);
    setPaymentProofUrl(null);
  };

  // Switch to the OnsitePaymentHistory view
  const handleShowOnsitePaymentHistory = () => {
    setShowOnsitePaymentHistory(true);
  };

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen w-full lg:w-[85%]">
      {/* If showing OnsitePaymentHistory, render it, otherwise render PaymentHistory */}
      {showOnsitePaymentHistory ? (
        <OnsitePaymentHistory
          onBack={() => setShowOnsitePaymentHistory(false)}
        />
      ) : (
        <>
          {/* Payment History Title */}
          <h1 className="text-3xl text-center font-bold text-[#724E2C] mb-6">
            Payment History
          </h1>

          {/* Button to switch to OnsitePaymentHistory */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleShowOnsitePaymentHistory}
              className="bg-[#724E2C] text-white py-2 px-4 rounded-md hover:bg-[#4E3225] transition-all"
            >
              View Onsite Payment History
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center text-lg my-6">
              Loading...
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center text-gray-600 my-6">
              No payment history found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg mt-6">
              {/* Table displaying payment history */}
              <table className="min-w-full table-auto bg-white border-collapse">
                <thead>
                  <tr className="text-white bg-[#724E2C]">
                    <th className="py-3 px-6 text-left">Customer</th>
                    <th className="py-3 px-6 text-left">Total</th>
                    <th className="py-3 px-6 text-left">Payment Mode</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-100">
                      <td className="py-3 px-6">{payment.customer}</td>
                      <td className="py-3 px-6">
                        ₱ {payment.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-6">{payment.paymentMode}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`${
                            payment.status === "Accepted"
                              ? "bg-green-500"
                              : payment.status === "Declined"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          } text-white py-1 px-3 rounded-full`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-500 hover:text-blue-700 transition-all"
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
        </>
      )}

      {/* Display Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 flex justify-center items-center bg-[rgba(0,0,0,0.3)] z-999">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#724E2C]">
                Payment Details
              </h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 text-2xl hover:text-red-700"
              >
                <FaTimesCircle />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <strong>Customer:</strong> {selectedPayment.customer}
              </div>
              <div>
                <strong>Address:</strong> {selectedPayment.address}
              </div>
              <div>
                <strong>Contact Number:</strong> {selectedPayment.contactNumber}
              </div>
              <div>
                <strong>Payment Mode:</strong> {selectedPayment.paymentMode}
              </div>
              <div>
                <strong>Status:</strong> {selectedPayment.status}
              </div>
              <div>
                <strong>Total Price:</strong> ₱{" "}
                {selectedPayment.totalPrice.toFixed(2)}
              </div>
            </div>

            <div className="my-4 border-t-2 border-dashed border-gray-300"></div>

            <div className="space-y-2">
              <strong>Order Details:</strong>
              <ul className="list-disc pl-5">
                {selectedPayment.orderDetails.map((order, index) => (
                  <li key={index}>
                    {order.product} - ₱ {order.price} x {order.quantity} = ₱{" "}
                    {order.total}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <strong>Payment Proof:</strong>
              {selectedPayment.paymentProofUrl && (
                <button
                  onClick={() =>
                    handleViewPaymentProof(selectedPayment.paymentProofUrl)
                  }
                  className="text-blue-500 ml-3 hover:underline cursor-pointer hover:text-blue-700"
                >
                  View Payment Proof
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Display Payment Proof Modal */}
      {showPaymentProofModal && paymentProofUrl && (
        <div className="fixed inset-0 flex justify-center items-center bg-[rgba(0,0,0,0.1)] z-1000">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Payment Proof</h2>
              <button
                onClick={closePaymentProofModal}
                className="text-red-500 text-2xl"
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <img
                src={paymentProofUrl}
                alt="Payment Proof"
                className="max-w-full h-140 max-h-[800px] object-cover rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
