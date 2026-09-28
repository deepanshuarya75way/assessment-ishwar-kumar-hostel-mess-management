const express = require("express");
const { User, Attendance } = require("../models");
const { protect, authorize } = require("../middleware");

const router = express.Router();

// only mess admin can use these routes
router.use(protect, authorize("messadmin"));

const meals = ["breakfast", "lunch", "dinner"];

// date as YYYY-MM-DD (local time)
const dateString = (date) => date.toLocaleDateString("en-CA");

// GET /api/mess/stats  (numbers + data for the charts)
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const today = dateString(new Date());

    // meals served today, meal wise
    const todayChart = [];
    let mealsToday = 0;
    for (const meal of meals) {
      const count = await Attendance.countDocuments({ date: today, meal: meal });
      mealsToday += count;
      todayChart.push({ meal: meal, count: count });
    }

    // total meals served in the last 7 days
    const weekChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = dateString(d);
      const count = await Attendance.countDocuments({ date: date });
      weekChart.push({ date: date, count: count });
    }

    res.json({ totalStudents, mealsToday, todayChart, weekChart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/mess/students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name rollNumber room")
      .populate("room", "roomNumber")
      .sort("name");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/mess/attendance?date=2026-09-28&meal=lunch
router.get("/attendance", async (req, res) => {
  try {
    const { date, meal } = req.query;
    const records = await Attendance.find({ date, meal });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/mess/attendance
// body: { date, meal, presentIds: [studentId, ...] }
router.post("/attendance", async (req, res) => {
  try {
    const { date, meal, presentIds } = req.body;

    if (!date || !meals.includes(meal) || !Array.isArray(presentIds)) {
      return res.status(400).json({ message: "Date, a valid meal and presentIds are required" });
    }

    // remove old records of this meal and save the new ones
    await Attendance.deleteMany({ date, meal });
    const records = presentIds.map((id) => ({ student: id, date, meal }));
    await Attendance.insertMany(records);

    res.json({ message: "Attendance saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
