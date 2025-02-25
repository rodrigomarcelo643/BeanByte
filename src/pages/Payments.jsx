import React from "react";

const paymentsData = [
  {
    id: 1,
    customer: "John Doe",
    amount: 1500.5,
    date: "2025-02-20",
    status: "Completed",
  },
  {
    id: 2,
    customer: "Jane Smith",
    amount: 2500.0,
    date: "2025-02-18",
    status: "Pending",
  },
  {
    id: 3,
    customer: "Alice Brown",
    amount: 1200.0,
    date: "2025-02-16",
    status: "Completed",
  },
  {
    id: 4,
    customer: "Bob Johnson",
    amount: 300.75,
    date: "2025-02-14",
    status: "Failed",
  },
  {
    id: 5,
    customer: "Charlie Lee",
    amount: 950.0,
    date: "2025-02-12",
    status: "Completed",
  },
];

export default function Payments() {
  // Calculate total payments
  const totalPayments = paymentsData.reduce(
    (acc, payment) => acc + payment.amount,
    0
  );

  return (
    <div className="bg-gray-50  p-8 w-[85%] min-h-screen">
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          Payments Overview
        </h3>
        <p className="text-gray-600 mb-6">
          Below is a list of all recent payments made by your customers. You can
          track the status of each transaction and view detailed information.
        </p>

        {/* Total Payments Summary */}
        <div className="flex justify-between items-center bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg text-white mb-6">
          <div className="text-lg font-bold">Total Payments</div>
          <div className="text-xl">{`₱ ${totalPayments.toLocaleString()}`}</div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700">ID</th>
                <th className="py-3 px-4 text-left text-gray-700">Customer</th>
                <th className="py-3 px-4 text-left text-gray-700">Amount</th>
                <th className="py-3 px-4 text-left text-gray-700">Date</th>
                <th className="py-3 px-4 text-left text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentsData.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-200">
                  <td className="py-3 px-4 text-gray-700">{payment.id}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {payment.customer}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{`₱ ${payment.amount.toLocaleString()}`}</td>
                  <td className="py-3 px-4 text-gray-700">{payment.date}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status === "Completed"
                          ? "bg-green-500 text-white"
                          : payment.status === "Pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
