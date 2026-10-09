require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Task = require("./models/Task");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
const { generateAIResponse } = require("./services/ai");
const app = express();

console.log("Gemini API key loaded:", Boolean(process.env.GEMINI_API_KEY));
console.log("OpenRouter API key loaded:", !!process.env.OPENROUTER_API_KEY);
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

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

app.post("/ai/analyze", authMiddleware, async (req, res) => {
  try {
    // 1. Retrieve only this authenticated user's tasks
    const tasks = await Task.find({
      userId: req.user.userId,
    });

    if (tasks.length === 0) {
      return res.status(400).json({
        message: "No tasks found. Add a task before analyzing.",
      });
    }

    // 2. Construct context from actual database records
    const taskContext = tasks
      .map(
        (task, index) =>
          `${index + 1}. ID: ${task._id} | Title: ${task.title} | Status: ${
            task.completed ? "Completed" : "Pending"
          }`,
      )
      .join("\n");

    // 3. Construct the prompt
    const prompt = `
Analyze the following user's tasks and rank them by priority.

Consider task completion status. Focus recommendations on pending tasks.
Do not invent deadlines or personal context that was not provided.

Tasks:
${taskContext}

For each task, explain briefly why you gave it that priority.
`;

    // 4. Ask the LLM to analyze the context
    const result = await generateAIResponse(prompt);

    // 5. Validate the response structure
if (!result || !Array.isArray(result.tasks)) {
  return res.status(502).json({
    message: "AI returned an invalid response structure",
  });
}

const validPriorities = ["High", "Medium", "Low"];
const userTaskIds = new Set(tasks.map((task) => task._id.toString()));
const seenTaskIds = new Set();

for (const item of result.tasks) {
  if (
    !item ||
    typeof item.taskId !== "string" ||
    !validPriorities.includes(item.priority) ||
    typeof item.reason !== "string"
  ) {
    return res.status(502).json({
      message: "AI returned an invalid task analysis",
    });
  }

  if (!userTaskIds.has(item.taskId)) {
    return res.status(502).json({
      message: "AI returned an unknown task ID",
    });
  }

  if (seenTaskIds.has(item.taskId)) {
    return res.status(502).json({
      message: "AI returned a duplicate task ID",
    });
  }

  seenTaskIds.add(item.taskId);
}

    // 5. Return the result to the frontend
    res.json({ result });
  } catch (error) {
    console.error("AI request failed:", error);

    res.status(500).json({
      message: "Failed to analyze tasks",
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
      { new: true, runValidators: true },
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
