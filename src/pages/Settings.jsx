import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../API/client";

function Settings() {
  const user = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setJobTitle(user.jobTitle || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  const handleSave = async () => {
    setMessage(null);
    setIsError(false);
    try {
      const res = await apiClient.put("/users/me", { name: fullName, jobTitle, bio });
      const updatedUser = res.data.user || res.data;
      
      // Update local storage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...updatedUser }));
      
      setMessage("Profile updated successfully.");
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Failed to update profile.");
    }
  };

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
              {message && (
                <div style={{ marginBottom: '15px', color: isError ? '#dc2626' : '#10b981', fontSize: '14px', fontWeight: '500' }}>
                  {message}
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Job Title / Role</label>
                <input
                  id="role"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Software Developer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows="5"
                  maxLength="200"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Building seamless collaborative experiences for teams."
                />

                <div className="bio-counter">{bio.length} / 200</div>
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
                  onClick={handleSave}
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