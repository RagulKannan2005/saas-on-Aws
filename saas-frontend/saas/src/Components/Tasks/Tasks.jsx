import React, { useState, useRef, useEffect } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Search, X, Calendar } from "lucide-react";
import "./Tasks.css";
import axios from "axios";

const Tasks = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const dateInputRef = useRef(null);

  useEffect(() => {
    if (openCreateModal || openDetailsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openCreateModal, openDetailsModal]);

  /* ---------- Projects Fetching ---------- */
  const [projects, setProjects] = useState([]);
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

  /* ---------- Employees Fetching ---------- */
  const [employees, setEmployees] = useState([]);
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      // Use the generic endpoint which relies on the token's tenantId
      // and returns employees for the current company
      const response = await axios.get("/api/employees/company", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  /* ---------- Tasks Fetching ---------- */
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (openCreateModal) {
      fetchProjects();
      fetchEmployees();
    }
  }, [openCreateModal]);

  const handlecreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const form = e.target;

      const assigneeId = form.assignee.value;

      const taskData = {
        title: form.title.value,
        projectId: form.project.value,
        type: form.type.value,
        status: form.status.value,
        priority: form.priority.value,
        assignees: assigneeId ? [assigneeId] : [], // Send as array
        estimatedHours: form.estimatedHours.value,
        dueDate: form.dueDate.value,
      };

      const response = await axios.post("/api/tasks", taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Task created:", response.data);
      setOpenCreateModal(false);
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  return (
    <>
      <Headerpart />

      <div className="tasks_page">
        {/* Header */}
        <div className="tasks_header">
          <div>
            <h1>Tasks</h1>
            <p>All tasks across projects</p>
          </div>

          <button
            className="new_task_btn"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={18} />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="tasks_filters">
          <div className="search_box">
            <Search size={18} />
            <input placeholder="Search tasks..." />
          </div>

          <select className="filter_select">
            <option>All Status</option>
            <option>TODO</option>
            <option>IN_PROGRESS</option>
            <option>DONE</option>
            <option>BLOCKED</option>
          </select>

          <select className="filter_select">
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button className="clear_btn">Clear Filters</button>
        </div>

        {/* Table */}
        <div className="tasks_table_container">
          <div className="tasks_table_header">
            <p>Title</p>
            <p>Project</p>
            <p>Type</p>
            <p>Status</p>
            <p>Priority</p>
            <p>Assignee</p>
            <p>Time</p>
          </div>

          <div className="tasks_list">
            {tasks.length === 0 ? (
              <p
                style={{ padding: "20px", textAlign: "center", color: "#888" }}
              >
                No tasks found. Create one to get started.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="tasks_row clickable"
                  onClick={() => {
                    setSelectedTask(task);
                    setOpenDetailsModal(true);
                  }}
                >
                  <p className="task_title">{task.title}</p>
                  <p>{task.Project ? task.Project.name : "Unknown Project"}</p>
                  <span className={`tag ${task.type.toLowerCase()}`}>
                    {task.type}
                  </span>
                  <span className={`status ${task.status.toLowerCase()}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span
                    className={`priority ${task.priority ? task.priority.toLowerCase() : "medium"}`}
                  >
                    {task.priority || "Medium"}
                  </span>
                  {/* Display first assignee name if available */}
                  <p>
                    {task.assignees && task.assignees.length > 0
                      ? task.assignees[0].name
                      : "Unassigned"}
                  </p>
                  <p>
                    {task.actualHours || 0}/{task.estimatedHours || 0}h
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= CREATE TASK MODAL ================= */}
      {openCreateModal && (
        <div className="modal_overlay">
          <div className="modal_container">
            <div className="modal_header">
              <div>
                <h2>Create New Task</h2>
                <p>Create a new task to organize your work</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setOpenCreateModal(false)}
              />
            </div>

            <form onSubmit={handlecreateTask}>
              <div className="modal_body">
                <label>Task Title *</label>
                <input name="title" placeholder="Enter task title" required />

                <div className="two_col">
                  <div>
                    <label>Project</label>
                    <select name="project" required>
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          style={{ backgroundColor: "black", color: "white" }}
                        >
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Type</label>
                    <select name="type">
                      <option value="TASK">Task</option>
                      <option value="BUG">Bug</option>
                      <option value="EPIC">Epic</option>
                    </select>
                  </div>
                </div>

                <div className="two_col">
                  <div>
                    <label>Status</label>
                    <select name="status">
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div>
                    <label>Priority</label>
                    <select name="priority">
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="two_col">
                  <div>
                    <label>Assignee</label>
                    <select name="assignee">
                      <option value="">Select assignee</option>
                      {employees.map((emp) => (
                        <option
                          key={emp.id}
                          value={emp.id}
                          style={{ backgroundColor: "black", color: "white" }}
                        >
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Due Date</label>
                    <div className="date_input">
                      <input type="date" name="dueDate" ref={dateInputRef} />
                      <Calendar
                        size={18}
                        onClick={() =>
                          dateInputRef.current &&
                          dateInputRef.current.showPicker()
                        }
                      />
                    </div>
                  </div>
                </div>

                <label>Estimated Hours</label>
                <input type="number" name="estimatedHours" defaultValue={0} />
              </div>

              <div className="modal_footer">
                <button
                  type="button"
                  className="cancel_btn"
                  onClick={() => setOpenCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="create_btn">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TASK DETAILS MODAL ================= */}
      {openDetailsModal && selectedTask && (
        <div className="modal_overlay">
          <div className="modal_container large">
            <div className="modal_header">
              <div>
                <h2>{selectedTask.title}</h2>
                <p>{selectedTask.Project?.name}</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setOpenDetailsModal(false)}
              />
            </div>

            <div className="details_grid">
              <div>
                <label>Status</label>
                <select
                  defaultValue={selectedTask.status}
                  style={{ backgroundColor: "#1e1e1e" }}
                >
                  <option>TODO</option>
                  <option>IN_PROGRESS</option>
                  <option>DONE</option>
                  <option>BLOCKED</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select
                  defaultValue={selectedTask.priority}
                  style={{ backgroundColor: "#1e1e1e" }}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label>Type</label>
                <span className={`tag ${selectedTask.type.toLowerCase()}`}>
                  {selectedTask.type}
                </span>
              </div>

              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  defaultValue={
                    selectedTask.dueDate
                      ? selectedTask.dueDate.split("T")[0]
                      : ""
                  }
                  style={{ backgroundColor: "#1e1e1e" }}
                />
              </div>
            </div>

            <div className="details_section">
              <label>Assigned To</label>
              <div className="assignee_box">
                <div className="avatar" />
                {/* Display first assignee name if available */}
                <span>
                  {selectedTask.assignees && selectedTask.assignees.length > 0
                    ? selectedTask.assignees[0].name
                    : "Unassigned"}
                </span>
              </div>
            </div>

            <div className="details_grid">
              <div>
                <label>Estimated Hours</label>
                <input
                  type="number"
                  defaultValue={selectedTask.estimatedHours}
                />
              </div>
              <div>
                <label>Actual Hours</label>
                <input type="number" defaultValue={selectedTask.actualHours} />
              </div>
            </div>

            <div className="details_section">
              <h4>Activity Log</h4>
              <ul className="activity_log">
                <li>Task created</li>
              </ul>
            </div>

            <div className="details_section">
              <h4>Comments</h4>
              <div className="comment">{/* Comments placeholder */}</div>
              <input
                type="text"
                name="comment"
                id="comment"
                placeholder="Add a comment"
              />
              <button className="add_comment_btn">Add Comment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
