import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setMsg("Please enter both username and password");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters long");
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMsg("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMsg(data.message || "Registration failed");
      }
    } catch (error) {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-container">
      <h2>Register</h2>
      <input
        placeholder="Username (small letters only)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
      />
      <button onClick={handleRegister} className="button" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
      {msg && (
        <div style={{
          marginTop: 16,
          color: msg === "Registration successful! Redirecting to login..." ? "green" : "red",
        }}>
          {msg}
        </div>
      )}
    </div>
  );
}