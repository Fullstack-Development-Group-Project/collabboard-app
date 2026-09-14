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

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleDemoLogin = (demoEmail = "danindu@example.com") => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotMsg(`Password reset link sent to ${forgotEmail}. (Demo mode: Use password123)`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotMsg("");
    }, 2500);
  };

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
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ cursor: "pointer", background: "none", border: "none", color: "#6c5ce7", fontSize: "12px", textDecoration: "underline" }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="auth-input-wrapper">
                <span>♙</span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁" : "◉"}
                </span>
              </div>
            </div>

            <label className="remember-row" style={{ cursor: "pointer" }}>
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in</span>
            </label>

            <button type="submit" className="signin-btn" disabled={loading} style={{ cursor: "pointer" }}>
              {loading ? "Signing in..." : "Sign In"} <span>→</span>
            </button>

            <div className="auth-divider">
              <span>OR DEMO SIGN-IN</span>
            </div>

            <div className="social-login-buttons">
              <button
                type="button"
                onClick={() => handleDemoLogin("danindu@example.com")}
                title="Fill Danindu demo credentials"
                style={{ cursor: "pointer" }}
              >
                <span>D</span>
                Danindu (Lead)
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("uditha@example.com")}
                title="Fill Uditha demo credentials"
                style={{ cursor: "pointer" }}
              >
                <span>U</span>
                Uditha (Dev)
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

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <form onSubmit={handleForgotSubmit} style={{ background: "#1e1e2e", border: "1px solid #3b3b4f", padding: "28px", borderRadius: "12px", width: "100%", maxWidth: "380px" }}>
                <h3 style={{ color: "#fff", marginBottom: "8px" }}>Reset Password</h3>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                  Enter your email address to receive password reset instructions.
                </p>

                {forgotMsg && (
                  <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: "6px", fontSize: "12px", marginBottom: "14px" }}>
                    {forgotMsg}
                  </div>
                )}

                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #3b3b4f", background: "#2a2a3e", color: "#fff", marginBottom: "16px" }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={{ padding: "8px 14px", border: "1px solid #475569", background: "none", color: "#aaa", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ padding: "8px 16px", border: "none", background: "#6c5ce7", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Send Link</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Login;