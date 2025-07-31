import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMsg("Please enter both username and password");
      return;
    }

    setMsg("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.access_token); 
        nav("/quiz");
      } else {
        setMsg(data.message || "Login failed");
      }
    } catch (error) {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
      />
      <button onClick={handleLogin} className="button" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {msg && (
        <div style={{ marginTop: 16, color: msg.includes("error") || msg.includes("failed") ? "green" : "red" }}>
          {msg}
        </div>
      )}
    </div>
  );
}