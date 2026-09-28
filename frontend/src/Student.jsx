import { useEffect, useState } from "react";
import { apiRequest } from "./auth";

// ================= Dashboard page =================
export function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [mealsTaken, setMealsTaken] = useState(0);

  useEffect(() => {
    apiRequest("/student/profile")
      .then((data) => setProfile(data))
      .catch((err) => alert(err.message));

    apiRequest("/student/attendance")
      .then((data) => setMealsTaken(data.length))
      .catch((err) => alert(err.message));
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>

      <div className="cards">
        <div className="card">
          <p>Roll Number</p>
          <h2>{profile.rollNumber}</h2>
        </div>
        <div className="card">
          <p>Course</p>
          <h2>{profile.course || "-"}</h2>
        </div>
        <div className="card">
          <p>Room</p>
          <h2>{profile.room ? profile.room.roomNumber : "Not allocated"}</h2>
        </div>
        <div className="card">
          <p>Meals Taken</p>
          <h2>{mealsTaken}</h2>
        </div>
      </div>
    </div>
  );
}

// ================= Menu page =================
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Menu() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    apiRequest("/menu")
      .then((data) => {
        // keep the days in week order
        data.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
        setMenu(data);
      })
      .catch((err) => alert(err.message));
  }, []);

  return (
    <div>
      <h1>Mess Menu</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Dinner</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((m) => (
              <tr key={m._id}>
                <td>{m.day}</td>
                <td>{m.breakfast || "-"}</td>
                <td>{m.lunch || "-"}</td>
                <td>{m.dinner || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {menu.length === 0 && <p className="empty">Menu is not added yet.</p>}
      </div>
    </div>
  );
}

// ================= Attendance page =================
export function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    apiRequest("/student/attendance")
      .then((data) => setRecords(data))
      .catch((err) => alert(err.message));
  }, []);

  return (
    <div>
      <h1>My Attendance</h1>
      <p>Total meals taken: {records.length}</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Meal</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td className="capitalize">{r.meal}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p className="empty">No meals recorded yet.</p>}
      </div>
    </div>
  );
}

// ================= Complaints page =================
export function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/complaints", "POST", { title, description });
      alert("Complaint submitted");
      setTitle("");
      setDescription("");
      loadComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>My Complaints</h1>

      <form className="form-box" onSubmit={handleSubmit}>
        <h3>New Complaint</h3>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Describe your problem" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        <button type="submit">Submit</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.description}</td>
                <td>
                  <span className={"status " + c.status}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {complaints.length === 0 && <p className="empty">You have not raised any complaint.</p>}
      </div>
    </div>
  );
}
