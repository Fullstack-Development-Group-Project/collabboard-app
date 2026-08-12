const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./authRoutes");
const boardRoutes = require("./boardRoutes");
const columnRoutes = require("./columnRoutes");
const taskRoutes = require("./taskRoutes");
const { authMiddleware } = require("./authMiddleware");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/boards", authMiddleware, boardRoutes);
app.use("/api/columns", authMiddleware, columnRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CollabBoard API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});