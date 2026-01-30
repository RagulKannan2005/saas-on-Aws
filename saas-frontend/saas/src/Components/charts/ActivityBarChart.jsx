import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ActivityBarChart = ({ data }) => {
  return (
    <div
      style={{
        background: "#141414",
        borderRadius: "16px",
        padding: "20px",
        color: "white",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>
          Task Status Distribution
        </h3>
        <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "0.9rem" }}>
          Overview of all tasks by status
        </p>
      </div>

      <div style={{ flex: 1, width: "100%", minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a2a"
              vertical={false}
            />
            <XAxis
              dataKey="status"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "#1f1f1f",
                borderColor: "#333",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Bar
              dataKey="value"
              fill="#6c7cff"
              radius={[4, 4, 0, 0]}
              barSize={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityBarChart;
