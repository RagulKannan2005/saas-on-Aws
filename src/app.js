const express = require("express");
const app = express();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const employeeRoutes = require("./routes/Employee.routes");

app.use(express.json());
app.use("/api", authRoutes, projectRoutes, taskRoutes,employeeRoutes);

module.exports = app;
