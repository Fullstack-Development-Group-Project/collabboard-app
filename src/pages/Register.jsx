import { Link } from "react-router";
import logo from "../assets/collabboard-logo.jpeg";

function Register() {
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

        <form className="register-form">
          <div className="register-form-group">
            <label htmlFor="register-name">Full Name</label>

            <div className="register-input-wrapper">
              <span>♙</span>
              <input
                id="register-name"
                type="text"
                placeholder="Jane Doe"
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
              />
            </div>
          </div>

          <button type="submit" className="create-account-btn">
            Create Account
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