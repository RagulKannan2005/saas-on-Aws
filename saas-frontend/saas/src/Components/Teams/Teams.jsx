import React from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Mail, Phone } from "lucide-react";
import "./Teams.css";
const Teams = () => {
  const empouyeesData = [
    {
      totalempoyee: 120,
      active: 32,
      inactive: 3,
    },
  ];

  const employeeData = [
    {
      name: "John Doe",
      email: "john.doe@gmail.com",
      role: "Software Engineer",
      status: "Active",
      joinDate: "2022-01-01",
      phone: "1234567890",
    },
    {
      name: "Ragulkannan",
      email: "ragulkannan@gmail.com",
      role: "Software Engineer",
      status: "Inactive",
      joinDate: "2022-01-01",
      phone: "1234567890",
      
    },
    {
      name: "Ragulkannan",
      email: "ragulkannan@gmail.com",
      role: "Software Engineer",
      status: "On Leave",
      joinDate: "2022-01-01",
      phone: "1234567890",
    },
  ];
  return (
    <>
      <Headerpart />
      <div className="Team_container" style={{ padding: "20px" }}>
        <div className="Team_header">
          <div>
            <h1>Teams</h1>
            <p>All tasks across projects</p>
          </div>

          <div className="new_team_btn">
            <button>
              <Plus size={16} />
              Add Employee
            </button>
            <button className="add_team_btn" >
              <Plus size={16} />
              Set Project Team
            </button>
          </div>
        </div>
      </div>

      <div className="employees_active_details">
        <div className="employee_cards_container">
          {empouyeesData.map((data, index) => (
            <React.Fragment key={index}>
              <div className="employee_card">
                <h2>{data.totalempoyee}</h2>
                <p>Total Employees</p>
              </div>
              <div className="employee_card">
                <h2>{data.active}</h2>
                <p>Active Employees</p>
              </div>
              <div className="employee_card">
                <h2>{data.inactive}</h2>
                <p>Inactive Employees</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="employee_table_info">
        <div className="employee_table_header">
          <h2>Employee List</h2>
          <p>Title </p>
          <p>Email </p>
          <p>Role </p>
          <p>Status </p>
          <p>Join Date</p>
          <p>Phone </p>
          <p>Action </p>
        </div>
        <div className="teams_list">
          {employeeData.map((employee, index) => (
            <div className="employee_row" key={index}>
              <p>{employee.name}</p>
              <p>
                <Mail size={16} />
                {employee.email}
              </p>
              <p>{employee.role}</p>

              <p
                className={`employee_status ${employee.status
                  .toLowerCase()
                  .replace(" ", "_")}`}
              >
                {employee.status}
              </p>

              <p>{employee.joinDate}</p>
              <p>
                <Phone size={16} /> {employee.phone}
              </p>
              <p>{employee.action}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Teams;
