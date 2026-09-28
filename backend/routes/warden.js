const express = require("express");
const { User, Room, Complaint } = require("../models");
const { protect, authorize } = require("../middleware");

const router = express.Router();

// only warden can use these routes
router.use(protect, authorize("warden"));

// GET /api/warden/stats  (numbers + data for the charts)
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const rooms = await Room.find();

    let totalBeds = 0;
    let occupiedBeds = 0;
    const roomChart = [];

    for (const room of rooms) {
      const occupied = await User.countDocuments({ room: room._id });
      totalBeds += room.capacity;
      occupiedBeds += occupied;
      roomChart.push({ room: room.roomNumber, occupied: occupied, capacity: room.capacity });
    }

    const complaintChart = [];
    for (const status of ["pending", "in-progress", "resolved"]) {
      const count = await Complaint.countDocuments({ status: status });
      complaintChart.push({ name: status, value: count });
    }

    res.json({
      totalStudents,
      totalRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      roomChart,
      complaintChart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/warden/students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate("room", "roomNumber").sort("name");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/warden/students
router.post("/students", async (req, res) => {
  try {
    const { name, email, password, mobile, rollNumber, course } = req.body;

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ message: "Name, email, password and roll number are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = await User.create({
      name,
      email,
      password,
      mobile,
      rollNumber,
      course,
      role: "student",
    });

    res.status(201).json({ _id: student._id, name: student.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/warden/rooms  (each room with its students)
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().sort("roomNumber");
    const result = [];

    for (const room of rooms) {
      const students = await User.find({ room: room._id }).select("name rollNumber");
      result.push({
        _id: room._id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        students: students,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/warden/rooms
router.post("/rooms", async (req, res) => {
  try {
    const { roomNumber, capacity } = req.body;

    if (!roomNumber || !capacity) {
      return res.status(400).json({ message: "Room number and capacity are required" });
    }

    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: "Room already exists" });
    }

    const room = await Room.create({ roomNumber, capacity });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/warden/rooms/:id/allocate
router.put("/rooms/:id/allocate", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const student = await User.findById(req.body.studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    // check if there is space in the room
    const occupied = await User.countDocuments({ room: room._id });
    const alreadyInRoom = String(student.room) === String(room._id);
    if (occupied >= room.capacity && !alreadyInRoom) {
      return res.status(400).json({ message: "Room is full" });
    }

    await User.findByIdAndUpdate(student._id, { room: room._id });
    res.json({ message: "Room allocated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
