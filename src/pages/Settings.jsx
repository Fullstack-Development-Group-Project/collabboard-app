import { useMemo } from "react";
import Topbar from "../components/Topbar";

function Settings() {
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const userName = user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  return (
    <div className="page-wrapper">
      <Topbar title="Settings" />

      <main className="settings-page">
        <div className="settings-heading">
          <h1>Account Settings</h1>
          <p>
            Manage your personal information, security preferences, and
            workspace notifications.
          </p>
        </div>

        <div className="settings-layout">
          <aside className="settings-menu">
            <button className="settings-tab active">
              <span>♙</span>
              Profile
            </button>

            <button className="settings-tab">
              <span>♧</span>
              Account
            </button>

            <button className="settings-tab">
              <span>♢</span>
              Notifications
            </button>

            <button className="settings-tab">
              <span>◈</span>
              Security
            </button>
          </aside>

          <section className="settings-card">
            <h2>Profile Information</h2>

            <div className="settings-divider"></div>

            <div className="profile-picture-section">
              <div className="settings-avatar">{userInitials}</div>

              <div className="profile-picture-info">
                <h3>Profile Picture</h3>
                <p>PNG, JPG or GIF. Max size of 5MB.</p>

                <div className="profile-picture-actions">
                  <button className="upload-btn">Upload New</button>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
            </div>

            <div className="settings-divider"></div>

            <form className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    defaultValue={userName}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={userEmail}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Job Title / Role</label>
                <input
                  id="role"
                  type="text"
                  defaultValue="Software Developer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows="5"
                  maxLength="200"
                  defaultValue="Building seamless collaborative experiences for teams."
                />

                <div className="bio-counter">0 / 200</div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;