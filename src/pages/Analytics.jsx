import React, { useState } from "react";
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
  // Sample sales data for the coffee shop (in PHP)
  const salesDataAll = {
    day: [
      { date: "2023-01-01", sales: 200 },
      { date: "2023-01-02", sales: 250 },
      { date: "2023-01-03", sales: 300 },
      { date: "2023-01-04", sales: 220 },
      { date: "2023-01-05", sales: 270 },
      { date: "2023-01-06", sales: 280 },
      { date: "2023-01-07", sales: 350 },
    ],
    week: [
      { date: "Week 1", sales: 2000 },
      { date: "Week 2", sales: 2500 },
      { date: "Week 3", sales: 3000 },
      { date: "Week 4", sales: 2700 },
    ],
    month: [
      { date: "Jan", sales: 5000 },
      { date: "Feb", sales: 6000 },
      { date: "Mar", sales: 5500 },
      { date: "Apr", sales: 7000 },
      { date: "May", sales: 8000 },
      { date: "Jun", sales: 9000 },
      { date: "Jul", sales: 8500 },
      { date: "Aug", sales: 9500 },
      { date: "Sep", sales: 10000 },
      { date: "Oct", sales: 12000 },
      { date: "Nov", sales: 14000 },
      { date: "Dec", sales: 15000 },
    ],
    year: [
      { date: "2023", sales: 120000 },
      { date: "2024", sales: 9000 },
      { date: "2025", sales: 6000 },
    ],
  };

  // State to store selected filter
  const [filter, setFilter] = useState("month");

  // Function to format sales data based on selected filter
  const getDataForFilter = (filter) => {
    let filteredData = salesDataAll[filter];
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

  // Chart options to customize the chart behavior
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
            filter === "year" ? "Year" : filter === "month" ? "Month" : "Day",
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
          className="px-4 py-2  cursor-pointer bg-[#724E2C] hover:bg-[#a79482] text-white rounded mb-4 sm:mb-0"
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
          Year
        </button>
      </div>

      {/* Line Chart */}
      <div className="flex justify-center w-full sm:w-[80%] h-[400px] sm:h-[500px]">
        <Line data={getDataForFilter(filter)} options={options} />
      </div>
    </div>
  );
};

export default Analytics;
