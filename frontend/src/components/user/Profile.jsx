import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "./profile.css";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../../authContext.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username", email: "" });
  const [repositories, setRepositories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (userId) {
        try {
          // Fetch user details
          const userResponse = await axios.get(
            `${config.apiUrl}/userProfile/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setUserDetails(userResponse.data);
          setEditData({ 
            email: userResponse.data.email,
            password: ""
          });

          // Fetch user repositories
          const repoResponse = await axios.get(
            `${config.apiUrl}/repo/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setRepositories(repoResponse.data.repositories || []);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const updateData = {};
      if (editData.email !== userDetails.email) {
        updateData.email = editData.email;
      }
      if (editData.password.trim()) {
        updateData.password = editData.password;
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes to save");
        return;
      }

      const response = await axios.put(
        `${config.apiUrl}/updateProfile/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUserDetails(response.data.user);
      setIsEditing(false);
      setEditData({ ...editData, password: "" });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `${config.apiUrl}/deleteProfile/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setCurrentUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading">Loading profile...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="user-profile-section">
            <div className="profile-image"></div>
            <div className="name">
              <h3>{userDetails.username}</h3>
              <p className="email">{userDetails.email}</p>
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{repositories.length}</span>
                <span className="stat-label">Repositories</span>
              </div>
              <div className="stat">
                <span className="stat-number">10</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="btn-outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button className="btn-danger" onClick={handleDeleteAccount}>
                Delete Account
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="profile-main">
          {isEditing && (
            <div className="edit-profile-form">
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="Your email"
                />
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editData.password}
                  onChange={(e) => setEditData({...editData, password: e.target.value})}
                  placeholder="New password"
                />
              </div>
              <div className="form-actions">
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleUpdateProfile} className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          <div className="repositories-section">
            <div className="section-header">
              <h3>Repositories ({repositories.length})</h3>
              <Link to="/create" className="btn-primary">
                New Repository
              </Link>
            </div>
            
            {repositories.length > 0 ? (
              <div className="repositories-grid">
                {repositories.map((repo) => (
                  <div key={repo._id} className="repo-card">
                    <div className="repo-header">
                      <h4>
                        <Link to={`/repo/${repo._id}`}>{repo.name}</Link>
                      </h4>
                      <span className={`visibility-badge ${repo.visibility}`}>
                        {repo.visibility}
                      </span>
                    </div>
                    <p className="repo-description">
                      {repo.description || "No description provided"}
                    </p>
                    <div className="repo-meta">
                      <span>{repo.issues?.length || 0} issues</span>
                      <span>{repo.content?.length || 0} files</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You don't have any repositories yet.</p>
                <Link to="/create" className="btn-primary">
                  Create your first repository
                </Link>
              </div>
            )}
          </div>

          <div className="activity-section">
            <h3>Contribution Activity</h3>
            <HeatMapProfile />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;