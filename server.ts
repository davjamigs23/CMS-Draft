import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { ShiftingApplication, ShiftingStatus, Course, Instructor } from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for applications
  let applications: ShiftingApplication[] = [];

  // CMS Data
  let courses: Course[] = [
    { id: "C1", code: "CS101", title: "Introduction to Computer Science", type: "Lecture", credits: 3, price: 1500, prerequisites: [], capacity: 40, instructorId: "I1" },
    { id: "C2", code: "CS102", title: "Data Structures & Algorithms", type: "Both", credits: 4, price: 2200, prerequisites: ["CS101"], capacity: 35, instructorId: "I2" },
    { id: "C3", code: "IT201", title: "Database Systems", type: "Lab", credits: 3, price: 1800, prerequisites: ["CS101"], capacity: 30 },
  ];

  let instructors: Instructor[] = [
    { id: "I1", name: "Dr. Alice Smith", department: "Computer Science" },
    { id: "I2", name: "Prof. Bob Johnson", department: "IT Department" },
    { id: "I3", name: "Dr. Charlie Brown", department: "Computer Science" },
  ];

  // API Routes
  
  // CMS Endpoints
  app.get("/api/courses", (req, res) => res.json(courses));
  app.get("/api/instructors", (req, res) => res.json(instructors));

  app.patch("/api/courses/:id", (req, res) => {
    const { id } = req.params;
    const { instructorId, capacity, price } = req.body;
    const courseIndex = courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return res.status(404).json({ error: "Course not found" });

    if (instructorId !== undefined) courses[courseIndex].instructorId = instructorId;
    if (capacity !== undefined) courses[courseIndex].capacity = capacity;
    if (price !== undefined) courses[courseIndex].price = price;

    res.json(courses[courseIndex]);
  });

  // Shifting Endpoints
  
  // GET /applications - Fetch all for admins, or scoped for students
  app.get("/api/applications", (req, res) => {
    // In a real app, we'd filter by user ID from token
    res.json(applications);
  });

  // POST /applications - Submit new shifting request
  app.post("/api/applications", (req, res) => {
    const { currentProgram, targetProgram, reason, studentName, studentId } = req.body;
    
    if (!currentProgram || !targetProgram || !reason) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    if (reason.length < 50) {
      return res.status(400).json({ error: "Reason must be at least 50 characters long" });
    }

    const newApp: ShiftingApplication = {
      id: `APP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      studentId: studentId || "STU-2021-08831",
      studentName: studentName || "Juan Dela Cruz",
      currentProgram,
      targetProgram,
      reason,
      status: "pending",
      submittedAt: new Date().toISOString()
    };

    applications.push(newApp);
    res.status(201).json(newApp);
  });

  // PATCH /applications/:id/status - Update application status (Admin only)
  app.patch("/api/applications/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const appIndex = applications.findIndex(a => a.id === id);
    if (appIndex === -1) return res.status(404).json({ error: "Application not found" });

    applications[appIndex].status = status;
    res.json(applications[appIndex]);
  });

  // DELETE /applications/:id - Cancel application
  app.delete("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const appIndex = applications.findIndex(a => a.id === id);
    if (appIndex === -1) return res.status(404).json({ error: "Application not found" });
    
    applications.splice(appIndex, 1);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Course Management Subsystem Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
