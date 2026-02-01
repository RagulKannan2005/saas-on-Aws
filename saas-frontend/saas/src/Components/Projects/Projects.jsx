import React from "react";
import Headerpart from "../Dashboard/Headerpart";
// import { Plane } from "lucide-react";
import { Plus } from "lucide-react";
import "./Projects.css";

const Projects = () => {
  return (
    <>
      <Headerpart />
      <div className="project_content" style={{ padding: "20px" }}>
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
    </>
  );
};

export default Projects;
