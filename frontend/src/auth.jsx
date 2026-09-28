import { createContext, useContext, useState } from "react";

const BASE_URL = "http://localhost:5001/api";

// common function to call the backend
// it adds the JWT token automatically
export async function apiRequest(url, method = "GET", body) {
  const user = JSON.parse(localStorage.getItem("user"));

  const headers = { "Content-Type": "application/json" };
  if (user) {
    headers.Authorization = "Bearer " + user.token;
  }

  const res = await fetch(BASE_URL + url, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// ---------- login state ----------
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", "POST", { email, password });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
