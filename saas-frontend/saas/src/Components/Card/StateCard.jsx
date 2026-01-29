import React from "react";
import "./StateCard.css";

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="stats_card">
      <div className="stats_card_left">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>

      <div className="stats_card_icon">{icon}</div>
    </div>
  );
};

export default StatsCard;
