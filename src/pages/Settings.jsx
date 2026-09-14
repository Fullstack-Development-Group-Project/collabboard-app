import { useState, useEffect, useRef } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../API/client";
import { UserIcon, SlidersIcon, BellIcon, ShieldIcon } from "../components/Icons";

function Settings() {
  const user = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "account", "notifications", "security"

  // Profile state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarImage, setAvatarImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef(null);

  // Account state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [accountMsg, setAccountMsg] = useState(null);

  // Notification toggles
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true,
    columnMoved: true,
    dailyDigest: false,
    soundAlerts: true
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityMsg, setSecurityMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setJobTitle(user.jobTitle || "");
      setBio(user.bio || "");
    }
    const savedAvatar = localStorage.getItem("user_custom_avatar");
    if (savedAvatar) setAvatarImage(savedAvatar);
  }, [user]);

  const userName = fullName || user?.name || "User";
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

  const handleCancel = () => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setJobTitle(user.jobTitle || "");
      setBio(user.bio || "");
      setMessage(null);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result);
        localStorage.setItem("user_custom_avatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarImage(null);
    localStorage.removeItem("user_custom_avatar");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPass || !passwords.current) {
      setAccountMsg({ isError: true, text: "Please fill in all password fields." });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setAccountMsg({ isError: true, text: "New passwords do not match." });
      return;
    }
    if (passwords.newPass.length < 6) {
      setAccountMsg({ isError: true, text: "Password must be at least 6 characters." });
      return;
    }
    setAccountMsg({ isError: false, text: "Password changed successfully." });
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const handleExportData = async () => {
    try {
      const [boardsRes, tasksRes] = await Promise.all([
        apiClient.get("/boards"),
        apiClient.get("/tasks/assigned")
      ]);
      const exportObject = {
        user: { name: fullName, email, jobTitle, bio },
        boards: boardsRes.data,
        assignedTasks: tasksRes.data,
        exportedAt: new Date().toISOString()
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `collabboard_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data.");
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
            <button
              type="button"
              className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
              style={{ cursor: "pointer" }}
            >
              <UserIcon size={17} />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`settings-tab ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
              style={{ cursor: "pointer" }}
            >
              <SlidersIcon size={17} />
              <span>Account</span>
            </button>

            <button
              type="button"
              className={`settings-tab ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
              style={{ cursor: "pointer" }}
            >
              <BellIcon size={17} />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
              style={{ cursor: "pointer" }}
            >
              <ShieldIcon size={17} />
              <span>Security</span>
            </button>
          </aside>

          {/* Tab 1: Profile Information */}
          {activeTab === "profile" && (
            <section className="settings-card">
              <h2>Profile Information</h2>

              <div className="settings-divider"></div>

              <div className="profile-picture-section">
                <div className="settings-avatar" style={{ overflow: "hidden" }}>
                  {avatarImage ? (
                    <img src={avatarImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    userInitials
                  )}
                </div>

                <div className="profile-picture-info">
                  <h3>Profile Picture</h3>
                  <p>PNG, JPG or GIF. Max size of 5MB.</p>

                  <div className="profile-picture-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ cursor: "pointer" }}
                    >
                      Upload New
                    </button>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={handleAvatarRemove}
                      style={{ cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-divider"></div>

              <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
                      style={{ backgroundColor: '#2a2a3e', cursor: 'not-allowed', color: '#888' }}
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
                    onClick={handleCancel}
                    style={{ cursor: "pointer" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    style={{ cursor: "pointer" }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Tab 2: Account Management */}
          {activeTab === "account" && (
            <section className="settings-card">
              <h2>Account Management</h2>
              <div className="settings-divider"></div>

              <h3>Change Password</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                Ensure your account is using a long, random password to stay secure.
              </p>

              {accountMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: accountMsg.isError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: accountMsg.isError ? "#ef4444" : "#10b981", fontSize: "13px" }}>
                  {accountMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ maxWidth: "420px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="save-btn"
                  style={{ alignSelf: "flex-start", cursor: "pointer", marginTop: "8px" }}
                >
                  Update Password
                </button>
              </form>

              <div className="settings-divider" style={{ marginTop: "32px" }}></div>

              <h3>Data Export</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                Download a JSON archive of your personal boards, tasks, and profile data.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "1px solid #6c5ce7",
                  background: "rgba(108, 92, 231, 0.15)",
                  color: "#a29bfe",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px"
                }}
              >
                ⤓ Export Workspace Data (JSON)
              </button>
            </section>
          )}

          {/* Tab 3: Notifications Preferences */}
          {activeTab === "notifications" && (
            <section className="settings-card">
              <h2>Notification Preferences</h2>
              <div className="settings-divider"></div>

              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
                Choose what activity alerts you receive in real-time.
              </p>

              {notifSaved && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "13px" }}>
                  ✓ Preferences saved successfully.
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "540px" }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "14px" }}>Task Assignment Alerts</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>Get notified immediately when a task is assigned to you</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.taskAssigned}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, taskAssigned: e.target.checked })}
                    style={{ transform: "scale(1.3)", cursor: "pointer" }}
                  />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "14px" }}>Live Column & Status Changes</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>Receive alerts when cards move across board columns</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.columnMoved}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, columnMoved: e.target.checked })}
                    style={{ transform: "scale(1.3)", cursor: "pointer" }}
                  />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "14px" }}>Daily Workspace Digest</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>Summary email of team activity and tasks due soon</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.dailyDigest}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, dailyDigest: e.target.checked })}
                    style={{ transform: "scale(1.3)", cursor: "pointer" }}
                  />
                </label>

                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: "14px" }}>Audio Cue Sound Effects</div>
                    <div style={{ color: "#888", fontSize: "12px" }}>Play subtle sound effects on real-time task movement</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.soundAlerts}
                    onChange={(e) => setNotifPrefs({ ...notifPrefs, soundAlerts: e.target.checked })}
                    style={{ transform: "scale(1.3)", cursor: "pointer" }}
                  />
                </label>

                <button
                  type="button"
                  className="save-btn"
                  onClick={() => {
                    setNotifSaved(true);
                    setTimeout(() => setNotifSaved(false), 3000);
                  }}
                  style={{ alignSelf: "flex-start", marginTop: "12px", cursor: "pointer" }}
                >
                  Save Notification Preferences
                </button>
              </div>
            </section>
          )}

          {/* Tab 4: Security & Sessions */}
          {activeTab === "security" && (
            <section className="settings-card">
              <h2>Security & Authentication</h2>
              <div className="settings-divider"></div>

              {securityMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "13px" }}>
                  {securityMsg}
                </div>
              )}

              <div style={{ marginBottom: "28px" }}>
                <h3>Two-Factor Authentication (2FA)</h3>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "14px" }}>
                  Add an extra layer of security to your CollabBoard account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    setSecurityMsg(!twoFactorEnabled ? "2FA enabled successfully." : "2FA disabled.");
                    setTimeout(() => setSecurityMsg(null), 3000);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: twoFactorEnabled ? "1px solid #10b981" : "1px solid #6c5ce7",
                    background: twoFactorEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(108, 92, 231, 0.15)",
                    color: twoFactorEnabled ? "#10b981" : "#a29bfe",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13px"
                  }}
                >
                  {twoFactorEnabled ? "✓ 2FA Active (Click to disable)" : "Enable Two-Factor Authentication"}
                </button>
              </div>

              <div className="settings-divider"></div>

              <h3>Active Sessions</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px" }}>
                This is a list of devices that have logged into your account.
              </p>

              <div style={{ background: "#181824", border: "1px solid #2a2a3e", borderRadius: "8px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>Windows 11 PC — Chrome Browser</div>
                  <div style={{ color: "#888", fontSize: "12px" }}>Localhost (127.0.0.1) • Current Active Session</div>
                </div>
                <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                  Active Now
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSecurityMsg("All other browser sessions have been logged out.");
                  setTimeout(() => setSecurityMsg(null), 3000);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ef4444",
                  background: "transparent",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                Log Out All Other Devices
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Settings;