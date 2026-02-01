import React, { useState } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import "./Projects.css";

/* ---------- Action Menu ---------- */
const ActionMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="action_wrapper" ref={menuRef}>
      <span className="action" onClick={() => setOpen(!open)}>
        ⋮
      </span>

      {open && (
        <div className="action_dropdown">
          <div className="dropdown_item">
            <Eye size={16} />
            <span>View Details</span>
          </div>
          <div className="dropdown_item">
            <Pencil size={16} />
            <span>Edit</span>
          </div>
          <div className="dropdown_item delete">
            <Trash2 size={16} />
            <span>Delete</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Main Component ---------- */
const Projects = () => {
  const projectsData = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete redesign of company website",
      date: "15/01/2024",
      tasks: 23,
      status: "Active",
      statusClass: "active",
    },
    {
      id: 2,
      name: "Database Migration",
      description: "Migrate MongoDB to PostgreSQL",
      date: "10/12/2023",
      tasks: 18,
      status: "Completed",
      statusClass: "completed",
    },
  ];

  return (
    <>
      <Headerpart />

      <div className="project_content">
        <div className="project_header">
          <div>
            <h1>Projects</h1>
            <p>Manage your projects and teams</p>
          </div>

          <div className="new_project_button">
            <button>
              <Plus size={20} />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="project_details_container">
        <div className="project_container">
          {/* Header */}
          <div className="project_grid_header">
            <p>Project Name</p>
            <p>Created Date</p>
            <p>Tasks</p>
            <p>Status</p>
            <p>Actions</p>
          </div>

          {/* Rows */}
          {projectsData.map((project) => (
            <div key={project.id} className="project_row">
              <div className="project_info">
                <h4>{project.name}</h4>
                <span>{project.description}</span>
              </div>
              <p>{project.date}</p>
              <p>{project.tasks}</p>
              <span className={`status ${project.statusClass}`}>
                {project.status}
              </span>
              <ActionMenu />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Projects;
