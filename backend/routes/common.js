// routes used by more than one role: login, menu and complaints
const express = require("express");
const jwt = require("jsonwebtoken");
const { User, Menu, Complaint } = require("../models");
const { protect, authorize } = require("../middleware");

const router = express.Router();

// ---------- AUTH ----------

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- MENU ----------

// GET /api/menu  (everyone who is logged in)
router.get("/menu", protect, async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/menu  (mess admin - add or update the menu of one day)
router.post("/menu", protect, authorize("messadmin"), async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;

    const menu = await Menu.findOneAndUpdate(
      { day },
      { day, breakfast, lunch, dinner },
      { new: true, upsert: true }
    );
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------- COMPLAINTS ----------

// POST /api/complaints  (student)
router.post("/complaints", protect, authorize("student"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const complaint = await Complaint.create({ student: req.user._id, title, description });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/complaints  (student gets own, warden gets all)
router.get("/complaints", protect, authorize("student", "warden"), async (req, res) => {
  try {
    let complaints;

    if (req.user.role === "student") {
      complaints = await Complaint.find({ student: req.user._id }).sort("-createdAt");
    } else {
      complaints = await Complaint.find().populate("student", "name rollNumber").sort("-createdAt");
    }

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/complaints/:id  (warden - change status)
router.put("/complaints/:id", protect, authorize("warden"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
