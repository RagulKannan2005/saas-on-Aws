import React from "react";
import "./RecentWork.css";

const RecentWork = () => {
  const activities = [
    {
      name: "John Smith",
      action: "completed task",
      title: "Update API documentation",
      time: "2 hours ago",
    },
    {
      name: "Emma Wilson",
      action: "created project",
      title: "Mobile App Redesign",
      time: "4 hours ago",
    },
    {
      name: "Mike Johnson",
      action: "assigned task",
      title: "Database optimization",
      time: "6 hours ago",
    },
    {
      name: "Sarah Johnson",
      action: "commented on",
      title: "Frontend refactor",
      time: "8 hours ago",
    },
  ];

  return (
    <>
      <div className="recent_activity_container">
        {/* Header */}
        <div className="recent_activity_header">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest updates from your team</p>
          </div>

          <button className="view_all_btn">
            View All <span>›</span>
          </button>
        </div>
        <div className="activity_list">
          {activities.map((activity, index) => (
            <div className="activity_item" key={index}>
              <div className="avatar"></div>
              <div className="activity_content" style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4>{activity.name}</h4>
                  <span>{activity.time}</span>
                </div>
                <p>
                  {activity.action} <strong>{activity.title}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RecentWork;
