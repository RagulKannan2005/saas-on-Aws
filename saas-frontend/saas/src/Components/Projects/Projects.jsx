import React, { useState } from "react";
import Headerpart from "../Dashboard/Headerpart";
import { Plus, Eye, Pencil, Trash2, X } from "lucide-react";
import "./Projects.css";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";

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
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);

  const { user } = useAuth();

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

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handlecreateproject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "/api/projects",
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(response.data);
      setShowModal(false);
      setName("");
      setDescription("");
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    }
  };

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
            <button onClick={() => setShowModal(true)}>
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
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div
                key={project.id}
                className="project_row"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="project_info">
                  <h4>{project.name}</h4>
                  <span>{project.description}</span>
                </div>
                <p>{new Date(project.created_at).toLocaleDateString()}</p>
                <p>
                  {project.tasks && Array.isArray(project.tasks)
                    ? project.tasks.filter((task) => !task.is_deleted).length
                    : 0}
                </p>
                <span className={`status active`}>Active</span>
                <ActionMenu />
              </div>
            ))
          ) : (
            <div className="no-projects">
              <p>No projects found. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Create Project Modal ---------- */}
      {showModal && (
        <div className="modal_overlay">
          <div className="modal_container">
            <div className="modal_header">
              <div>
                <h2>Create New Project</h2>
                <p>Create a new project to organize your work</p>
              </div>
              <X
                className="close_icon"
                onClick={() => setShowModal(false)}
                size={20}
              />
            </div>

            <div className="modal_body">
              <label>Project Name</label>
              <input
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Description</label>
              <textarea
                placeholder="Enter project description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="modal_footer">
              <button
                className="cancel_btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="create_btn" onClick={handlecreateproject}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
