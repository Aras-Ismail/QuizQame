import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuizPage from "./pages/QuizPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token available");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.expired || errorData.msg === "Token has expired") {
          try {
            const refreshResponse = await fetch("http://localhost:5000/refresh-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem("token", refreshData.access_token);
              setToken(refreshData.access_token);

              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${refreshData.access_token}`,
              };
              return fetch(url, { ...options, headers: retryHeaders });
            } else {
              throw new Error("Refresh failed");
            }
          } catch (refreshError) {
            handleLogout();
            throw new Error("Session expired");
          }
        } else {
          handleLogout();
          throw new Error("Unauthorized - please log in again");
        }
      }

      return response;
    } catch (error) {
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        throw new Error("Network error - please check your connection");
      }
      throw error;
    }
  };

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/quiz"
          element={token ? <QuizPage apiCall={apiCall} /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={token ? <History apiCall={apiCall} /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={token ? <Settings apiCall={apiCall} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/quiz" />} />
      </Routes>
    </BrowserRouter>
  );
}