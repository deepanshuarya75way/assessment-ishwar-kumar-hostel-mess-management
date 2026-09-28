const express = require("express");
const { User, Attendance } = require("../models");
const { protect, authorize } = require("../middleware");

const router = express.Router();

// only students can use these routes
router.use(protect, authorize("student"));

// GET /api/student/profile
router.get("/profile", async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate("room", "roomNumber");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/student/attendance
router.get("/attendance", async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user._id }).sort("-date");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
