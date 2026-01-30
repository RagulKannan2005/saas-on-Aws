import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00cc66", "#ff4d4d", "#ff7f0e", "#8884d8"]; // Green, Red, Orange, Purple

const TaskCompletionDonut = ({ data }) => {
  return (
    <div
      style={{
        background: "#141414",
        borderRadius: "16px",
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>
          Status Breakdown
        </h3>
        <p style={{ margin: "5px 0 0 0", color: "#888", fontSize: "0.9rem" }}>
          Percentage distribution
        </p>
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          minHeight: "250px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              cornerRadius={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f1f",
                borderColor: "#333",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskCompletionDonut;
