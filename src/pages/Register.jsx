import { useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";

import apiClient from "../API/client";

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
      const res = await apiClient.post("/auth/register", { name, email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score >= 4) return { label: 'Strong', count: 4, class: 'strong' };
    if (score >= 3) return { label: 'Good', count: 3, class: 'good' };
    if (score >= 2) return { label: 'Fair', count: 2, class: 'fair' };
    if (score >= 1) return { label: 'Weak', count: 1, class: 'weak' };
    return { label: 'Very Weak', count: 0, class: 'weak' };
  };
  const strength = calculateStrength(password);

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
              {[1, 2, 3, 4].map(num => (
                <span key={num} className={num <= strength.count ? strength.class : ""}></span>
              ))}
            </div>

            <small>{password ? strength.label + ' password' : 'Enter a password'}</small>
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