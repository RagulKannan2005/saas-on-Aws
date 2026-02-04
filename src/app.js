const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const employeeRoutes = require("./routes/Employee.routes");
const projectMemberRoutes = require("./routes/projectMember.routes");

app.use(express.json());
app.use(cors());
app.use(
  "/api",
  authRoutes,
  projectRoutes,
  taskRoutes,
  employeeRoutes,
  projectMemberRoutes
);

module.exports = app;
