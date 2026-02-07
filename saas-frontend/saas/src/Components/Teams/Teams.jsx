import React, { useState, useEffect } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Mail, Phone, X } from "lucide-react";
import axios from "axios";
import "./Teams.css";

const Teams = () => {
  const [openAddEmployeeModal, setOpenAddEmployeeModal] = useState(false);
  const [openAssignTeamModal, setOpenAssignTeamModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // Use the generic endpoint which relies on the token's tenantId
      const response = await axios.get("/api/employees/company", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const empList = response.data;
      setEmployees(empList);

      // Calculate Stats
      // Note: Endpoint currently returns ONLY non-deleted employees (is_deleted = FALSE)
      // So 'active' is essentially the total count returned.
      // To get 'inactive', we'd need an endpoint that returns deleted users or a different status field.
      // For now, we assume all returned are 'Active'.
      setStats({
        total: empList.length,
        active: empList.length,
        inactive: 0, // Placeholder until we have soft-deleted fetching
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Fallback for empty or error
      setEmployees([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (openAssignTeamModal) {
      fetchProjects();
    }
  }, [openAssignTeamModal]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const form = e.target;
    const token = localStorage.getItem("accessToken");

    const newEmployeeData = {
      name: form.name.value,
      email: form.email.value,
      role: form.role.value,
      password: form.password.value,
      // Note: 'status', 'joinDate', 'phone' are not in the create payload schema currently.
      // 'status' defaults to Active (is_deleted: false).
      // 'joinDate' defaults to current timestamp (created_at).
    };

    try {
      await axios.post("/api/createEmployee", newEmployeeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Employee created successfully");
      setOpenAddEmployeeModal(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
      alert(
        "Failed to create employee: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject || !selectedEmployee) {
      alert("Please select both a project and an employee.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `/api/projects/${selectedProject}/members`,
        {
          employeeId: selectedEmployee.id,
          role: selectedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert("Member added to project successfully");
      setOpenAssignTeamModal(false);
      // Reset selections
      setSelectedProject("");
      setSelectedEmployee(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Error adding member:", error);
      alert(
        "Failed to add member: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const employeesStatsData = [
    {
      title: "Total Employees",
      count: stats.total,
    },
    {
      title: "Active Employees",
      count: stats.active,
    },
    {
      title: "Inactive Employees",
      count: stats.inactive,
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
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label>Employee *</label>
              <select
                onChange={(e) =>
                  setSelectedEmployee(
                    employees.find((emp) => emp.id === e.target.value),
                  )
                }
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
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
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select Responsibility</option>
                <option value="Developer">Developer</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Project Lead">Project Lead</option>
                <option value="QA">QA</option>
              </select>
            </div>

            <div className="team_model_footer">
              <button
                className="cancel_btn"
                onClick={() => setOpenAssignTeamModal(false)}
              >
                Cancel
              </button>
              <button className="create_btn" onClick={handleAddMember}>
                Add to Project
              </button>
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

            <form onSubmit={handleCreateEmployee}>
              <div className="team_model_body">
                <label>Employee Name *</label>
                <input name="name" placeholder="Enter employee name" required />

                <label>Employee Email *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter employee email"
                  required
                />

                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter temporary password"
                  required
                />

                <label>Employee Role *</label>
                <select name="role">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                </select>

                {/* Status, Join Date, Phone are not persisted in createEmployee currently, so removing to avoid confusion */}
              </div>

              <div className="team_model_footer">
                <button
                  type="button"
                  className="cancel_btn"
                  onClick={() => setOpenAddEmployeeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save_btn">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE STATS ================= */}
      <div className="employees_active_details">
        <div className="employee_cards_container">
          {employeesStatsData.map((data, index) => (
            <React.Fragment key={index}>
              <div className="employee_card">
                <h2>{data.count}</h2>
                <p>{data.title}</p>
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
            <p>Action</p>
          </div>

          <div className="teams_list">
            {employees.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center" }}>
                No employees found.
              </p>
            ) : (
              employees.map((employee) => (
                <div className="employee_row" key={employee.id}>
                  <p>{employee.name}</p>
                  <p>
                    <Mail size={16} /> {employee.email}
                  </p>
                  <p>{employee.role}</p>

                  <p className={`employee_status active`}>Active</p>

                  <p>
                    {employee.created_at
                      ? new Date(employee.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>—</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Teams;
