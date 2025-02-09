import { useState } from "react";
import {
  BarChart,
  Card,
  Divider,
  Switch,
  Metric,
  Text,
  Flex,
} from "@tremor/react";

// Your data stays the same
const data = [
  { date: "Jan 23", "This Year": 68560, "Last Year": 28560 },
  { date: "Feb 23", "This Year": 70320, "Last Year": 30320 },
  { date: "Mar 23", "This Year": 80233, "Last Year": 70233 },
  { date: "Apr 23", "This Year": 55123, "Last Year": 45123 },
  { date: "May 23", "This Year": 56000, "Last Year": 80600 },
  { date: "Jun 23", "This Year": 100000, "Last Year": 85390 },
  { date: "Jul 23", "This Year": 85390, "Last Year": 45340 },
  { date: "Aug 23", "This Year": 80100, "Last Year": 70120 },
  { date: "Sep 23", "This Year": 75090, "Last Year": 69450 },
  { date: "Oct 23", "This Year": 71080, "Last Year": 63345 },
  { date: "Nov 23", "This Year": 61210, "Last Year": 100330 },
  { date: "Dec 23", "This Year": 60143, "Last Year": 45321 },
];

function valueFormatter(number) {
  const formatter = new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "PHP",
  });

  return formatter.format(number);
}

export default function Example() {
  const [showComparison, setShowComparison] = useState(false);

  // Calculate total orders for the current and last year
  const totalOrdersThisYear = data.reduce(
    (acc, current) => acc + current["This Year"],
    0
  );
  const totalOrdersLastYear = data.reduce(
    (acc, current) => acc + current["Last Year"],
    0
  );

  return (
    <div className="bg-white p-6 w-[80%] ml-10">
      <Card className="sm:mx-auto sm:max-w-4xl">
        <h3 className="ml-1 mr-1 font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Sales Overview
        </h3>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          The following chart illustrates the sales comparison between this year
          and last year, showcasing total sales and growth trends.
        </p>

        <div className="flex flex-col sm:flex-row sm:space-x-8 mt-6">
          {/* Bar Chart for Sales Data (Left Side) */}
          <div className="sm:w-2/3">
            <BarChart
              data={data}
              index="date"
              categories={
                showComparison ? ["Last Year", "This Year"] : ["This Year"]
              }
              colors={showComparison ? ["#00B5D9", "#004C8C"] : ["#004C8C"]}
              valueFormatter={valueFormatter}
              yAxisWidth={50}
              className="h-60"
            />
            {/* Mobile Version of Bar Chart */}
            <BarChart
              data={data}
              index="date"
              categories={
                showComparison ? ["Last Year", "This Year"] : ["This Year"]
              }
              colors={showComparison ? ["#00B5D9", "#004C8C"] : ["#004C8C"]}
              valueFormatter={valueFormatter}
              showYAxis={false}
              className="h-56 sm:hidden"
            />
          </div>

          {/* Total Orders Box (Right Side) */}
          <div className="sm:w-1/3">
            <div className="mb-4">
              <Metric value={valueFormatter(totalOrdersThisYear)} />
              <Text>Total Orders This Year</Text>
            </div>
            <div>
              <Metric value={valueFormatter(totalOrdersLastYear)} />
              <Text>Total Orders Last Year</Text>
            </div>
          </div>
        </div>

        <Divider />

        {/* Toggle Comparison */}
        <div className="mb-2 flex items-center space-x-3">
          <Switch
            id="comparison"
            onChange={() => setShowComparison(!showComparison)}
          />
          <label
            htmlFor="comparison"
            className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
          >
            Show Same Period Last Year
          </label>
        </div>
      </Card>
    </div>
  );
}
