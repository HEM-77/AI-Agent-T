const express = require("express");
const cors = require("cors");
const Task = require("./models/Task");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");

const app = express();
require("dotenv").config();

const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());
const tasks = [
  {
    id: 1,
    title: "Learn Node.js",
    completed: false,
  },
  {
    id: 2,
    title: "Learn Express",
    completed: false,
  },
  {
    id: 3,
    title: "Build API",
    completed: true,
  },
];

app.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.userId,
    });

    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

app.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    res.status(500).json({
      message: "Failed to fetch task",
    });
  }
});

app.post("/tasks", authMiddleware, async (req, res) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const newTask = await Task.create({
      title,
      userId: req.user.userId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Failed to create task:", error);
    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

app.patch("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const completed = req.body.completed;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "Completed must be a boolean",
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { title, completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Failed to update task:", error);
    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete task:", error);
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      passwordHash,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({
      message: "Failed to register user",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({
      message: "Failed to login",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
