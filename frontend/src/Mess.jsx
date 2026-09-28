import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { apiRequest } from "./auth";

// ================= Dashboard page =================
export function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiRequest("/mess/stats")
      .then((data) => setStats(data))
      .catch((err) => alert(err.message));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1>Mess Admin Dashboard</h1>

      <div className="cards">
        <div className="card">
          <p>Total Students</p>
          <h2>{stats.totalStudents}</h2>
        </div>
        <div className="card">
          <p>Meals Served Today</p>
          <h2>{stats.mealsToday}</h2>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Today's Meals</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.todayChart}>
              <XAxis dataKey="meal" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2f6647" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Meals Served (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.weekChart}>
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#e0a438" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ================= Menu page =================
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Menu() {
  // menu of every day is stored like { Monday: { breakfast, lunch, dinner }, ... }
  const [menu, setMenu] = useState(() => {
    const obj = {};
    days.forEach((day) => {
      obj[day] = { breakfast: "", lunch: "", dinner: "" };
    });
    return obj;
  });

  useEffect(() => {
    apiRequest("/menu")
      .then((data) => {
        const updated = { ...menu };
        data.forEach((m) => {
          updated[m.day] = { breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner };
        });
        setMenu(updated);
      })
      .catch((err) => alert(err.message));
    // eslint-disable-next-line
  }, []);

  const handleChange = (day, meal, value) => {
    setMenu({ ...menu, [day]: { ...menu[day], [meal]: value } });
  };

  const saveDay = async (day) => {
    try {
      await apiRequest("/menu", "POST", { day, ...menu[day] });
      alert(day + " menu saved");
    } catch (error) {
      alert(error.message);
    }
  };

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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td>{day}</td>
                <td>
                  <input value={menu[day].breakfast} onChange={(e) => handleChange(day, "breakfast", e.target.value)} />
                </td>
                <td>
                  <input value={menu[day].lunch} onChange={(e) => handleChange(day, "lunch", e.target.value)} />
                </td>
                <td>
                  <input value={menu[day].dinner} onChange={(e) => handleChange(day, "dinner", e.target.value)} />
                </td>
                <td>
                  <button onClick={() => saveDay(day)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= Attendance page =================
export function Attendance() {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  const [date, setDate] = useState(today);
  const [meal, setMeal] = useState("lunch");
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState([]); // ids of students who ate

  // load all students once
  useEffect(() => {
    apiRequest("/mess/students")
      .then((data) => setStudents(data))
      .catch((err) => alert(err.message));
  }, []);

  // load saved attendance whenever date or meal changes
  useEffect(() => {
    apiRequest(`/mess/attendance?date=${date}&meal=${meal}`)
      .then((records) => setPresent(records.map((r) => r.student)))
      .catch((err) => alert(err.message));
  }, [date, meal]);

  const toggleStudent = (id) => {
    if (present.includes(id)) {
      setPresent(present.filter((p) => p !== id));
    } else {
      setPresent([...present, id]);
    }
  };

  const handleSave = async () => {
    try {
      await apiRequest("/mess/attendance", "POST", { date, meal, presentIds: present });
      alert("Attendance saved");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Meal Attendance</h1>

      <div className="form-box">
        <div className="form-grid">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <p>
          {present.length} of {students.length} students marked present
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Present</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td>
                  <input type="checkbox" checked={present.includes(s._id)} onChange={() => toggleStudent(s._id)} />
                </td>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td>{s.room ? s.room.roomNumber : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="empty">No students found.</p>}
      </div>

      <button onClick={handleSave}>Save Attendance</button>
    </div>
  );
}
