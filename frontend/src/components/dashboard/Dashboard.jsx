import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Navbar from "../Navbar";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import config from "../../config";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({ username: "User" });
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!userId) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get(
          `${config.apiUrl}/userProfile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserDetails(userResponse.data);

        // Fetch user's repositories
        const userReposResponse = await axios.get(
          `${config.apiUrl}/repo/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const userRepos = userReposResponse.data.repositories || [];
        setRepositories(userRepos);
        setSearchResults(userRepos);

        // Fetch all public repositories for suggestions
        const allReposResponse = await axios.get(
          `${config.apiUrl}/repo/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Filter out user's own repositories from suggestions
        const otherRepos = (allReposResponse.data.data || []).filter(
          repo => repo.owner?._id !== userId && repo.visibility === 'public'
        );
        
        setSuggestedRepositories(otherRepos.slice(0, 6)); // Show only 6 suggestions
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Enhanced search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(repositories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = repositories.filter(repo => {
      const nameMatch = repo.name?.toLowerCase().includes(query);
      const descMatch = repo.description?.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });

    setSearchResults(filtered);
  }, [searchQuery, repositories]);

  const handleDeleteRepo = async (repoId) => {
    if (!window.confirm("Are you sure you want to delete this repository?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.apiUrl}/repo/delete/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from local state
      setRepositories(prev => prev.filter(repo => repo._id !== repoId));
      setSearchResults(prev => prev.filter(repo => repo._id !== repoId));
    } catch (error) {
      console.error("Error deleting repository:", error);
      alert("Failed to delete repository");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <div className="hero-content">
            <img src={logo} alt="RepoX" className="hero-logo" />
            <h1>Welcome back, {userDetails.username}!</h1>
            <p>Build amazing projects and collaborate with developers worldwide</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{repositories.length}</span>
                <span className="stat-label">Repositories</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{repositories.filter(r => r.visibility === 'public').length}</span>
                <span className="stat-label">Public</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{repositories.filter(r => r.visibility === 'private').length}</span>
                <span className="stat-label">Private</span>
              </div>
            </div>
            <button 
              className="hero-cta-btn"
              onClick={() => navigate("/create")}
            >
              <span>+</span> Create New Repository
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-grid">
            
            {/* Repositories Section */}
            <div className="repositories-section">
              <div className="section-header">
                <h2>Your Repositories</h2>
                <div className="search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="🔍 Find a repository..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="repositories-grid">
                {searchResults.length === 0 ? (
                  <div className="empty-state">
                    {searchQuery ? (
                      <div className="no-results">
                        <h3>No repositories found</h3>
                        <p>No repositories match "{searchQuery}"</p>
                      </div>
                    ) : (
                      <div className="no-repos">
                        <h3>Start your first repository</h3>
                        <p>Create a repository to start building amazing projects</p>
                        <button 
                          className="create-first-repo-btn"
                          onClick={() => navigate("/create")}
                        >
                          Create Repository
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  searchResults.map((repo) => (
                    <div key={repo._id} className="repo-card">
                      <div className="repo-card-header">
                        <h3>
                          <Link to={`/repo/${repo._id}`}>{repo.name}</Link>
                        </h3>
                        <div className="repo-badges">
                          <span className={`visibility-badge ${repo.visibility}`}>
                            {repo.visibility}
                          </span>
                        </div>
                      </div>
                      
                      <p className="repo-description">
                        {repo.description || "No description provided"}
                      </p>
                      
                      <div className="repo-stats">
                        <div className="stat">
                          <span className="stat-icon">📄</span>
                          <span>{repo.content?.length || 0} files</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">🐛</span>
                          <span>{repo.issues?.length || 0} issues</span>
                        </div>
                      </div>

                      <div className="repo-actions">
                        <Link to={`/repo/${repo._id}`} className="view-btn">
                          View Repository
                        </Link>
                        {repo.owner?._id === localStorage.getItem("userId") && (
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteRepo(repo._id);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="dashboard-sidebar">
              
              {/* Quick Actions */}
              <div className="sidebar-section quick-actions-section">
                <div className="section-header-with-icon">
                  <span className="section-icon">⚡</span>
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <Link to="/create" className="action-item">
                    <div className="action-icon-container">
                      <span className="action-icon">📁</span>
                    </div>
                    <div className="action-content">
                      <span className="action-title">New Repository</span>
                      <span className="action-description">Create a new project repository</span>
                    </div>
                  </Link>
                  <Link to="/profile" className="action-item">
                    <div className="action-icon-container">
                      <span className="action-icon">👤</span>
                    </div>
                    <div className="action-content">
                      <span className="action-title">View Profile</span>
                      <span className="action-description">Manage your profile and settings</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Suggested Repositories */}
              <div className="sidebar-section explore-section">
                <div className="section-header-with-icon">
                  <span className="section-icon">🌟</span>
                  <h3>Trending Repositories</h3>
                </div>
                <div className="suggested-repos">
                  {suggestedRepositories.length > 0 ? (
                    suggestedRepositories.map((repo) => (
                      <div key={repo._id} className="suggested-repo-card">
                        <div className="repo-card-content">
                          <div className="repo-header">
                            <h4>
                              <Link to={`/repo/${repo._id}`}>{repo.name}</Link>
                            </h4>
                            <span className={`visibility ${repo.visibility}`}>
                              {repo.visibility}
                            </span>
                          </div>
                          <p className="repo-desc">{repo.description?.substring(0, 80) + "..." || "No description"}</p>
                          <div className="repo-meta">
                            <div className="owner-info">
                              <span className="owner-icon">👤</span>
                              <span className="owner-name">{repo.owner?.username || "Unknown"}</span>
                            </div>
                            <div className="repo-stats">
                              <span className="stat">
                                <span className="stat-icon">📄</span>
                                {repo.content?.length || 0}
                              </span>
                              <span className="stat">
                                <span className="stat-icon">🐛</span>
                                {repo.issues?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/repo/${repo._id}`} className="view-repo-btn">
                          View Repository
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">
                      <span className="empty-icon">🔍</span>
                      <p>No public repositories to explore yet.</p>
                      <Link to="/create" className="create-first-btn">
                        Create the First Repository
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="sidebar-section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {repositories.slice(0, 3).map((repo) => (
                    <div key={repo._id} className="activity-item">
                      <span className="activity-icon">🔄</span>
                      <div className="activity-content">
                        <span>Updated repository</span>
                        <Link to={`/repo/${repo._id}`} className="activity-link">
                          {repo.name}
                        </Link>
                      </div>
                    </div>
                  ))}
                  {repositories.length === 0 && (
                    <p className="no-activity">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;