import { useState } from "react";
import { Routes, Route, Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import * as Warden from "./Warden";
import * as Mess from "./Mess";
import * as Student from "./Student";

// ---------- Login page ----------
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      navigate("/" + data.role);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>HostelMess</h1>
        <p>Smart Hostel & Mess Management</p>

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// ---------- Layout (sidebar + page) ----------

// sidebar links for each role
const links = {
  warden: [
    { to: "/warden", label: "Dashboard", end: true },
    { to: "/warden/students", label: "Students" },
    { to: "/warden/rooms", label: "Rooms" },
    { to: "/warden/complaints", label: "Complaints" },
  ],
  messadmin: [
    { to: "/messadmin", label: "Dashboard", end: true },
    { to: "/messadmin/menu", label: "Menu" },
    { to: "/messadmin/attendance", label: "Attendance" },
  ],
  student: [
    { to: "/student", label: "Dashboard", end: true },
    { to: "/student/menu", label: "Mess Menu" },
    { to: "/student/attendance", label: "My Attendance" },
    { to: "/student/complaints", label: "Complaints" },
  ],
};

const roleNames = { warden: "Warden", messadmin: "Mess Admin", student: "Student" };

// only lets the user in if he is logged in with the correct role
function ProtectedRoute({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== role) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>HostelMess</h2>
        <p className="user-info">
          {user.name}
          <br />
          <small>{roleNames[user.role]}</small>
        </p>

        <nav>
          {links[user.role].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

// ---------- Routes ----------
function App() {
  const { user } = useAuth();

  // home page of each role is "/" + role  (/warden, /messadmin, /student)
  const home = user ? "/" + user.role : "/login";

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} /> : <Login />} />
      <Route path="/" element={<Navigate to={home} />} />

      <Route element={<ProtectedRoute role="warden" />}>
        <Route path="/warden" element={<Warden.Dashboard />} />
        <Route path="/warden/students" element={<Warden.Students />} />
        <Route path="/warden/rooms" element={<Warden.Rooms />} />
        <Route path="/warden/complaints" element={<Warden.Complaints />} />
      </Route>

      <Route element={<ProtectedRoute role="messadmin" />}>
        <Route path="/messadmin" element={<Mess.Dashboard />} />
        <Route path="/messadmin/menu" element={<Mess.Menu />} />
        <Route path="/messadmin/attendance" element={<Mess.Attendance />} />
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<Student.Dashboard />} />
        <Route path="/student/menu" element={<Student.Menu />} />
        <Route path="/student/attendance" element={<Student.Attendance />} />
        <Route path="/student/complaints" element={<Student.Complaints />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
