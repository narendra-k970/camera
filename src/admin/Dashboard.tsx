import React, { useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("password", password);

    try {
      const response = await axios.post(
        "http://52.66.236.1:8000/login",
        formData
      );

      const successMessage = response.data.message
        ?.toLowerCase()
        .includes("login successful");

      if (response.status === 200 && successMessage) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      } else {
        alert("Login failed: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        "Something went wrong: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <div className="dashboard-container">
      {!isLoggedIn ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <div className="dashboard-content">
          <h1>Welcome to the Dashboard</h1>
          <p>This is your main content area.</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
