const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ---------- User (one model for warden, messadmin and student) ----------
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["warden", "messadmin", "student"], required: true },
    mobile: { type: String },

    // only for students
    rollNumber: { type: String },
    course: { type: String },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
  },
  { timestamps: true }
);

// hash the password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// check password at login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---------- Room ----------
const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, default: 2 },
  },
  { timestamps: true }
);

// ---------- Menu (one document per day of the week) ----------
const menuSchema = new mongoose.Schema({
  day: { type: String, required: true, unique: true },
  breakfast: { type: String, default: "" },
  lunch: { type: String, default: "" },
  dinner: { type: String, default: "" },
});

// ---------- Attendance (a record means the student ATE that meal) ----------
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // format YYYY-MM-DD
  meal: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
});
attendanceSchema.index({ student: 1, date: 1, meal: 1 }, { unique: true });

// ---------- Complaint ----------
const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "in-progress", "resolved"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Room: mongoose.model("Room", roomSchema),
  Menu: mongoose.model("Menu", menuSchema),
  Attendance: mongoose.model("Attendance", attendanceSchema),
  Complaint: mongoose.model("Complaint", complaintSchema),
};
