import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { firestore } from "../../config/firebase"; // Ensure correct Firebase setup
import { collection, getDocs } from "firebase/firestore";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  // State to store sales data
  const [salesData, setSalesData] = useState({
    day: [],
    week: [],
    month: [],
    year: [],
  });
  const [filter, setFilter] = useState("day");
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const onsiteHistoryRef = collection(firestore, "OnsiteHistory");
        const paymentHistoryRef = collection(firestore, "paymentHistory");

        // Fetch Onsite History and Payment History
        const onsiteSnapshot = await getDocs(onsiteHistoryRef);
        const paymentSnapshot = await getDocs(paymentHistoryRef);

        // Process Onsite History Data (to calculate daily, weekly, monthly, yearly)
        const onsiteData = onsiteSnapshot.docs.map((doc) => doc.data());
        const paymentData = paymentSnapshot.docs.map((doc) => doc.data());

        // Combine both Onsite and Payment History data
        const combinedData = [...onsiteData, ...paymentData];

        // Calculate the sales data based on timestamps
        const dayData = processSalesData(combinedData, "day");
        const weekData = processSalesData(combinedData, "week");
        const monthData = processSalesData(combinedData, "month");
        const yearData = processSalesData(combinedData, "year");

        setSalesData({
          day: dayData,
          week: weekData,
          month: monthData,
          year: yearData,
        });
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  // Process Sales Data for different periods (day, week, month, year)
  const processSalesData = (data, period) => {
    const salesByPeriod = {};

    data.forEach((item) => {
      // Determine timestamp and calculate sales
      const timestamp = item.createdAt?.seconds * 1000 || Date.now();
      const date = new Date(timestamp);
      let periodLabel;

      // Handle both Onsite and Payment History data
      let totalSales = 0;
      if (item.totalAmount) {
        totalSales += item.totalAmount; // Onsite sales
      }
      if (item.totalPrice) {
        totalSales += item.totalPrice; // Payment history sales
      }

      // Add sales from orderDetails in payment history
      if (item.orderDetails) {
        item.orderDetails.forEach((order) => {
          totalSales += order.total || 0; // Add each item's total to the sales
        });
      }

      // Group by period (day, week, month, year)
      switch (period) {
        case "day":
          periodLabel = date.toLocaleDateString();
          break;
        case "week":
          const weekNumber = Math.ceil(date.getDate() / 7);
          periodLabel = `Week ${weekNumber}`;
          break;
        case "month":
          periodLabel = date.toLocaleString("default", { month: "short" });
          break;
        case "year":
          periodLabel = date.getFullYear().toString();
          break;
        default:
          periodLabel = date.toLocaleDateString();
      }

      // Aggregate sales by period
      if (!salesByPeriod[periodLabel]) {
        salesByPeriod[periodLabel] = 0;
      }
      salesByPeriod[periodLabel] += totalSales;
    });

    // Convert to an array of data points sorted by the period label
    return Object.keys(salesByPeriod)
      .sort()
      .map((label) => ({ date: label, sales: salesByPeriod[label] }));
  };

  const getDataForFilter = (filter) => {
    let filteredData = salesData[filter];
    const labels = filteredData.map((data) => data.date);
    const data = filteredData.map((data) => data.sales);

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data,
          borderColor: "#724E2C", // Line color
          backgroundColor: "#724E2C", // Line fill color
          fill: true,
          tension: 0.4, // Smoothing the line
          pointRadius: 5, // Circle size for data points
          pointBackgroundColor: "green",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Bean & Byte Sales Overview",
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `₱ ${tooltipItem.raw.toLocaleString()}`; // Formatting the tooltip to show currency
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text:
            filter === "year"
              ? "Year"
              : filter === "month"
              ? "Month"
              : filter === "week"
              ? "Week"
              : "Day",
        },
      },
      y: {
        title: {
          display: true,
          text: "Sales (PHP)",
        },
        ticks: {
          beginAtZero: true,
          callback: function (value) {
            return `₱ ${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="p-8">
      {/* Filter Buttons */}
      <div className="flex flex-wrap space-x-4 mb-8">
        <button
          className="px-4 py-2 cursor-pointer bg-[#724E2C] hover:bg-[#a79482] text-white rounded mb-4 sm:mb-0"
          onClick={() => setFilter("day")}
        >
          Day
        </button>
        <button
          className="px-4 py-2 bg-[#724E2C] hover:bg-[#a79482] text-white rounded mb-4 sm:mb-0"
          onClick={() => setFilter("week")}
        >
          Week
        </button>
        <button
          className="px-4 py-2 bg-[#724E2C] hover:bg-[#a79482] text-white rounded mb-4 sm:mb-0"
          onClick={() => setFilter("month")}
        >
          Month
        </button>
        <button
          className="px-4 py-2 bg-[#724E2C] hover:bg-[#a79482] text-white rounded mb-4 sm:mb-0"
          onClick={() => setFilter("year")}
        >
          Annual
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="flex justify-center w-full sm:w-[80%] h-[400px] sm:h-[500px]">
          <Line data={getDataForFilter(filter)} options={options} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
