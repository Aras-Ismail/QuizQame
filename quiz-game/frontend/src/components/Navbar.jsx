import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ token, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="header" style={{ justifyContent: "space-around" }}>
      {token ? (
        <>
          <Link to="/quiz">Quiz</Link>
          <Link to="/history">History</Link>
          <Link to="/settings">Settings</Link>
          <button onClick={handleLogout} className="box-button button">Logout</button>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </div>
  );
}