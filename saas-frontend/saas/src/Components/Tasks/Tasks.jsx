import React, { useState, useRef, useEffect } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Search, X, Calendar } from "lucide-react";
import "./Tasks.css";

const tasksData = [
  {
    id: 1,
    title: "Update API documentation",
    project: "API Integration",
    type: "TASK",
    status: "IN_PROGRESS",
    priority: "High",
    assignee: "John Smith",
    time: "5/8h",
    estimatedHours: 8,
    actualHours: 5,
    dueDate: "2024-02-15",
  },
  {
    id: 2,
    title: "Fix database query performance",
    project: "Database Migration",
    type: "BUG",
    status: "BLOCKED",
    priority: "High",
    assignee: "Mike Johnson",
    time: "3/6h",
    estimatedHours: 6,
    actualHours: 3,
    dueDate: "2024-02-20",
  },
  {
    id: 3,
    title: "Design mobile UI mockups",
    project: "Mobile App Development",
    type: "TASK",
    status: "DONE",
    priority: "High",
    assignee: "Sarah Johnson",
    time: "14/12h",
    estimatedHours: 12,
    actualHours: 14,
    dueDate: "2024-02-10",
  },
  {
    id: 4,
    title: "Q1 Project Planning",
    project: "Website Redesign",
    type: "EPIC",
    status: "TODO",
    priority: "Medium",
    assignee: "Emma Wilson",
    time: "0/20h",
    estimatedHours: 20,
    actualHours: 0,
    dueDate: "2024-03-01",
  },
];

const Tasks = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
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
            {tasksData.map((task) => (
              <div
                key={task.id}
                className="tasks_row clickable"
                onClick={() => {
                  setSelectedTask(task);
                  setOpenDetailsModal(true);
                }}
              >
                <p className="task_title">{task.title}</p>
                <p>{task.project}</p>
                <span className={`tag ${task.type.toLowerCase()}`}>
                  {task.type}
                </span>
                <span className={`status ${task.status.toLowerCase()}`}>
                  {task.status.replace("_", " ")}
                </span>
                <span className={`priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
                <p>{task.assignee}</p>
                <p>{task.time}</p>
              </div>
            ))}
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

            <div className="modal_body">
              <label>Task Title *</label>
              <input placeholder="Enter task title" />

              <div className="two_col">
                <div>
                  <label>Project</label>
                  <select>
                    <option>Select project</option>
                  </select>
                </div>

                <div>
                  <label>Type</label>
                  <select>
                    <option>Task</option>
                    <option>Bug</option>
                    <option>Epic</option>
                  </select>
                </div>
              </div>

              <div className="two_col">
                <div>
                  <label>Status</label>
                  <select>
                    <option>TODO</option>
                    <option>IN_PROGRESS</option>
                    <option>DONE</option>
                  </select>
                </div>

                <div>
                  <label>Priority</label>
                  <select>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="two_col">
                <div>
                  <label>Assignee</label>
                  <select>
                    <option>Select assignee</option>
                  </select>
                </div>

                <div>
                  <label>Due Date</label>
                  <div className="date_input">
                    <input type="date" ref={dateInputRef} />
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
              <input type="number" defaultValue={0} />
            </div>

            <div className="modal_footer">
              <button
                className="cancel_btn"
                onClick={() => setOpenCreateModal(false)}
              >
                Cancel
              </button>
              <button className="create_btn">Create Task</button>
            </div>
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
                <p>{selectedTask.project}</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setOpenDetailsModal(false)}
              />
            </div>

            <div className="details_grid">
              <div>
                <label>Status</label>
                <select defaultValue={selectedTask.status} style={{backgroundColor:"#1e1e1e"}}>
                  <option>TODO</option>
                  <option>IN_PROGRESS</option>
                  <option>DONE</option>
                  <option>BLOCKED</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select defaultValue={selectedTask.priority} style={{backgroundColor:"#1e1e1e"}}>
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
                <input type="date" defaultValue={selectedTask.dueDate} style={{backgroundColor:"#1e1e1e"}} />
              </div>
            </div>

            <div className="details_section">
              <label>Assigned To</label>
              <div className="assignee_box">
                <div className="avatar" />
                <span>{selectedTask.assignee}</span>
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
                <li>Sarah Johnson created task · 2024-02-01</li>
                <li>John Smith changed status to IN_PROGRESS</li>
                <li>John Smith logged 5 hours</li>
              </ul>
            </div>

            <div className="details_section">
              <h4>Comments</h4>
              <div className="comment">
                <strong>John Smith</strong>
                <p>Started working on this task. Will have an update by EOD.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
