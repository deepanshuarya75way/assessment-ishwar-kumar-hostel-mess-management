import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { apiRequest } from "./auth";

// ================= Dashboard page =================
const COLORS = ["#e0a438", "#3b82f6", "#2f6647"];

export function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiRequest("/warden/stats")
      .then((data) => setStats(data))
      .catch((err) => alert(err.message));
  }, []);

  if (!stats) return <p>Loading...</p>;

  // pie chart cannot show zero values
  const complaintData = stats.complaintChart.filter((c) => c.value > 0);

  return (
    <div>
      <h1>Warden Dashboard</h1>

      <div className="cards">
        <div className="card">
          <p>Total Students</p>
          <h2>{stats.totalStudents}</h2>
        </div>
        <div className="card">
          <p>Total Rooms</p>
          <h2>{stats.totalRooms}</h2>
        </div>
        <div className="card">
          <p>Beds Occupied</p>
          <h2>{stats.occupiedBeds} / {stats.totalBeds}</h2>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Room Occupancy</h3>
          {stats.roomChart.length === 0 ? (
            <p>No rooms added yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.roomChart}>
                <XAxis dataKey="room" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#2f6647" />
                <Bar dataKey="capacity" fill="#e0a438" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-box">
          <h3>Complaints by Status</h3>
          {complaintData.length === 0 ? (
            <p>No complaints yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={complaintData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {complaintData.map((item, index) => (
                    <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= Students page =================
const emptyForm = { name: "", email: "", password: "", mobile: "", rollNumber: "", course: "" };

export function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadStudents = async () => {
    try {
      const data = await apiRequest("/warden/students");
      setStudents(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/warden/students", "POST", form);
      alert("Student added");
      setForm(emptyForm);
      loadStudents();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Students</h1>

      <form className="form-box" onSubmit={handleSubmit}>
        <h3>Add New Student</h3>
        <div className="form-grid">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} minLength={6} required />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} />
          <input name="rollNumber" placeholder="Roll number" value={form.rollNumber} onChange={handleChange} required />
          <input name="course" placeholder="Course (e.g. MCA)" value={form.course} onChange={handleChange} />
        </div>
        <button type="submit">Add Student</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Course</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td>{s.course || "-"}</td>
                <td>{s.email}</td>
                <td>{s.mobile || "-"}</td>
                <td>{s.room ? s.room.roomNumber : "Not allocated"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="empty">No students added yet.</p>}
      </div>
    </div>
  );
}

// ================= Rooms page =================
export function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState(2);

  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");

  const loadData = async () => {
    try {
      const roomsData = await apiRequest("/warden/rooms");
      const studentsData = await apiRequest("/warden/students");
      setRooms(roomsData);
      setStudents(studentsData);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/warden/rooms", "POST", { roomNumber, capacity: Number(capacity) });
      setRoomNumber("");
      setCapacity(2);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/warden/rooms/${roomId}/allocate`, "PUT", { studentId });
      alert("Room allocated");
      setStudentId("");
      setRoomId("");
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Rooms</h1>

      <form className="form-box" onSubmit={handleAddRoom}>
        <h3>Add Room</h3>
        <div className="form-grid">
          <input placeholder="Room number (e.g. A-101)" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required />
          <input type="number" min="1" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
        </div>
        <button type="submit">Add Room</button>
      </form>

      <form className="form-box" onSubmit={handleAllocate}>
        <h3>Allocate Room to Student</h3>
        <div className="form-grid">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.rollNumber})
              </option>
            ))}
          </select>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.roomNumber} ({r.students.length}/{r.capacity})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Allocate</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Room No</th>
              <th>Capacity</th>
              <th>Occupied</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r._id}>
                <td>{r.roomNumber}</td>
                <td>{r.capacity}</td>
                <td>{r.students.length}</td>
                <td>{r.students.length === 0 ? "Empty" : r.students.map((s) => s.name).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && <p className="empty">No rooms added yet.</p>}
      </div>
    </div>
  );
}

// ================= Complaints page =================
export function Complaints() {
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = async () => {
    try {
      const data = await apiRequest("/complaints");
      setComplaints(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await apiRequest("/complaints/" + id, "PUT", { status });
      loadComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Complaints</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.student ? c.student.name : "-"}</td>
                <td>{c.title}</td>
                <td>{c.description}</td>
                <td>
                  <select value={c.status} onChange={(e) => changeStatus(c._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {complaints.length === 0 && <p className="empty">No complaints yet.</p>}
      </div>
    </div>
  );
}
