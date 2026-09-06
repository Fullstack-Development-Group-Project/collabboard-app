import { useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";
import heroImage from "../assets/hero.png";

import apiClient from "../API/client";
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <img src={logo} alt="CollabBoard Logo" />
        </div>

        <div className="login-hero-image">
          <img src={heroImage} alt="Collaboration workspace" />
        </div>

        <div className="login-message">
          <h1>
            Work.
            <br />
            Together.
            <br />
            Better.
          </h1>

          <p>
            The definitive workspace for high-performance teams to orchestrate
            tasks, streamline communication, and hit every deadline.
          </p>
        </div>

        <div className="trusted-section">
          <span>TRUSTED BY INDUSTRY LEADERS</span>
          <div className="trusted-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-container">
          <h2>Welcome back</h2>
          <p className="login-subtitle">
            Sign in to your CollabBoard workspace.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}

            <div className="auth-form-group">
              <label htmlFor="login-email">WORK EMAIL</label>

              <div className="auth-input-wrapper">
                <span>✉</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="password-label-row">
                <label htmlFor="login-password">PASSWORD</label>
                <button type="button">Forgot password?</button>
              </div>

              <div className="auth-input-wrapper">
                <span>♙</span>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="password-eye">◉</span>
              </div>
            </div>

            <label className="remember-row">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"} <span>→</span>
            </button>

            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-login-buttons">
              <button type="button">
                <span>G</span>
                Google
              </button>

              <button type="button">
                <span>M</span>
                Microsoft
              </button>
            </div>

            <p className="create-account-text">
              Don't have a workspace yet?{" "}
              <Link to="/register">Create an account</Link>
            </p>

            <div className="auth-footer">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;