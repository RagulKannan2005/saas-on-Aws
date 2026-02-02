import React, { useState } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Mail, Phone, X } from "lucide-react";
import "./Teams.css";

const Teams = () => {
  const [openAddEmployeeModal, setOpenAddEmployeeModal] = useState(false);
  const [openAssignTeamModal, setOpenAssignTeamModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employeesData = [
    {
      totalempoyee: 120,
      active: 32,
      inactive: 3,
    },
  ];

  const employeeData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      role: "Software Engineer",
      status: "Active",
      joinDate: "2022-01-01",
      phone: "1234567890",
    },
    {
      id: 2,
      name: "Ragulkannan",
      email: "ragulkannan@gmail.com",
      role: "Software Engineer",
      status: "Inactive",
      joinDate: "2022-01-01",
      phone: "1234567890",
    },
    {
      id: 3,
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

      {/* Header */}
      <div className="Team_container" style={{ padding: "20px" }}>
        <div className="Team_header">
          <div>
            <h1>Teams</h1>
            <p>Manage employees and project teams</p>
          </div>

          <div className="new_team_btn">
            <button onClick={() => setOpenAddEmployeeModal(true)}>
              <Plus size={16} />
              Add Employee
            </button>

            <button
              className="add_team_btn"
              onClick={() => setOpenAssignTeamModal(true)}
            >
              <Plus size={16} />
              Add Team Member
            </button>
          </div>
        </div>
      </div>

      {/* ================= ASSIGN TEAM TO PROJECT ================= */}
      {openAssignTeamModal && (
        <div className="team_model_overlay">
          <div className="team_model_container">
            <div className="team_model_header">
              <div>
                <h2>Add Team Member</h2>
                <p>Assign an existing employee to this project</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setOpenAssignTeamModal(false)}
              />
            </div>

            <div className="team_model_body">
              <label>Project *</label>
              <select>
                <option value="">Select Project</option>
                <option>Project 1</option>
                <option>Project 2</option>
                <option>Project 3</option>
              </select>

              <label>Employee *</label>
              <select
                onChange={(e) =>
                  setSelectedEmployee(
                    employeeData.find(
                      (emp) => emp.id === Number(e.target.value),
                    ),
                  )
                }
              >
                <option value="">Select Employee</option>
                {employeeData.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>

              <label>Role</label>
              <input
                type="text"
                value={selectedEmployee?.role || ""}
                disabled
              />

              <label>Project Responsibility</label>
              <select>
                <option value="">Select Responsibility</option>
                <option>Developer</option>
                <option>Reviewer</option>
                <option>Project Lead</option>
                <option>QA</option>
              </select>
            </div>

            <div className="team_model_footer">
              <button
                className="cancel_btn"
                onClick={() => setOpenAssignTeamModal(false)}
              >
                Cancel
              </button>
              <button className="create_btn">Add to Project</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD NEW EMPLOYEE ================= */}
      {openAddEmployeeModal && (
        <div className="team_model_overlay">
          <div className="team_model_container">
            <div className="team_model_header">
              <div>
                <h2>Add Employee</h2>
                <p>Create a new employee profile</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setOpenAddEmployeeModal(false)}
              />
            </div>

            <div className="team_model_body">
              <label>Employee Name *</label>
              <input placeholder="Enter employee name" />

              <label>Employee Email *</label>
              <input placeholder="Enter employee email" />

              <label>Employee Role *</label>
              <input placeholder="Enter employee role" />

              <label>Employee Status *</label>
              <select>
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>

              <label>Join Date *</label>
              <input type="date" />

              <label>Phone *</label>
              <input placeholder="Enter phone number" />
            </div>

            <div className="team_model_footer">
              <button
                className="cancel_btn"
                onClick={() => setOpenAddEmployeeModal(false)}
              >
                Cancel
              </button>
              <button className="save_btn">Save Employee</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE STATS ================= */}
      <div className="employees_active_details">
        <div className="employee_cards_container">
          {employeesData.map((data, index) => (
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

      {/* ================= EMPLOYEE TABLE ================= */}
      <div className="employee_table_info">
        <div className="table_scroll_container">
          <div className="employee_table_header">
            <h2>Employee List</h2>
            <p>Name</p>
            <p>Email</p>
            <p>Role</p>
            <p>Status</p>
            <p>Join Date</p>
            <p>Phone</p>
            <p>Action</p>
          </div>

          <div className="teams_list">
            {employeeData.map((employee) => (
              <div className="employee_row" key={employee.id}>
                <p>{employee.name}</p>
                <p>
                  <Mail size={16} /> {employee.email}
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
                <p>—</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Teams;
