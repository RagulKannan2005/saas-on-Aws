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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(30, 30, 40, 0.8)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          color: "white",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#e0e0e0",
          }}
        >
          {label}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#a5b4fc" }}>
          Tasks:{" "}
          <span style={{ fontWeight: "bold", color: "#fff" }}>
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const ActivityBarChart = ({ data }) => {
  return (
    <div
      style={{
        background: "#141414",
        borderRadius: "24px",
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <div style={{ marginBottom: "30px", paddingLeft: "10px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: "700",
            background: "linear-gradient(to right, #fff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Activity Overview
        </h3>
        <p
          style={{
            margin: "6px 0 0 0",
            color: "#64748b",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          Weekly task distribution
        </p>
      </div>

      <div style={{ flex: 1, width: "100%", minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            barSize={90}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
              opacity={0.3}
            />
            <XAxis
              dataKey="status"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              dx={-5}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 10 }}
            />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[10, 10, 10, 10]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityBarChart;
