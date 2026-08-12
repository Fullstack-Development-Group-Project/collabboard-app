import { useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";

const API_BASE = "http://localhost:5000/api/v1";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <img
          src={logo}
          alt="CollabBoard Logo"
          className="register-logo"
        />

        <h1>Create your account</h1>
        <p className="register-subtitle">
          Join CollabBoard and start collaborating.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <div className="register-form-group">
            <label htmlFor="register-name">Full Name</label>

            <div className="register-input-wrapper">
              <span>♙</span>
              <input
                id="register-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="register-email">Email Address</label>

            <div className="register-input-wrapper">
              <span>✉</span>
              <input
                id="register-email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="register-password">Password</label>

            <div className="register-input-wrapper">
              <span>♙</span>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="password-strength">
              <span className="weak"></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <small>Weak password</small>
          </div>

          <div className="register-form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div className="register-input-wrapper">
              <span>♙</span>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="create-account-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="signin-account-text">
            Already have an account?{" "}
            <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;