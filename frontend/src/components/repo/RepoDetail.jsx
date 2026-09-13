import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Navbar from "../Navbar";
import FileTree from "./FileTree";
import CodeEditor from "./CodeEditor";
import "./RepoDetail.css";
import logo from "../../assets/logo.png";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("code");
  
  // Edit description state
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  
  // Add content state
  // Removed unused content state to satisfy linter
  
  // Issues state
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({ title: "", description: "" });
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);

  // File management state
  const [selectedFile, setSelectedFile] = useState(null);
  // const [fileRefreshKey, setFileRefreshKey] = useState(0);

  // Fetch repository data
  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiUrl}/repo/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRepo(response.data);
        setNewDescription(response.data.description || "");
      } catch (error) {
        console.error("Error fetching repository:", error);
        setError("Failed to load repository. It might not exist or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, [id]);

  // Fetch issues for this repository
  useEffect(() => {
    const fetchIssues = async () => {
      if (!repo) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiUrl}/issue/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Filter issues for this repository
        const repoIssues = response.data.filter(issue => 
          issue.repository && issue.repository._id === id
        );
        
        setIssues(repoIssues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    if (repo) {
      fetchIssues();
    }
  }, [repo, id]);

  // Handle repository description update
  const handleUpdateDescription = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.apiUrl}/repo/update/${id}`,
        { description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setRepo(prev => ({
        ...prev,
        description: newDescription
      }));
      
      setIsEditingDesc(false);
    } catch (error) {
      console.error("Error updating repository:", error);
      alert("Failed to update repository description");
    }
  };

  // Removed unused handleAddContent to satisfy linter

  // Handle repository visibility toggle
  const handleToggleVisibility = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${config.apiUrl}/repo/update/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setRepo(response.data.repository);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to toggle repository visibility");
    }
  };

  // Handle repository deletion
  const handleDeleteRepo = async () => {
    if (!window.confirm("Are you sure you want to delete this repository? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.apiUrl}/repo/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting repository:", error);
      alert("Failed to delete repository");
    }
  };

  // Handle creating a new issue
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    
    if (!newIssue.title.trim() || !newIssue.description.trim()) {
      alert("Title and description are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${config.apiUrl}/issue/create`,
        {
          title: newIssue.title,
          description: newIssue.description,
          repository: id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add the new issue to the list
      setIssues(prev => [...prev, response.data.issue]);
      
      // Reset form
      setNewIssue({ title: "", description: "" });
      setShowNewIssueForm(false);
    } catch (error) {
      console.error("Error creating issue:", error);
      alert("Failed to create issue");
    }
  };

  // Handle file refresh after save
  const handleFileRefresh = () => {
    // no-op; refresh key removed
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="repo-container">
          <div className="loading">Loading repository...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="repo-container">
          <div className="error-message">{error}</div>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Go back to dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="repo-container">
        <div className="repo-header">
          <div className="repo-title">
            <img src={logo} alt="RepoX Logo" className="repo-logo-small" />
            <h1>{repo.name}</h1>
            {repo.owner?._id === localStorage.getItem("userId") && (
              <button 
                className={`visibility-badge ${repo.visibility}`}
                onClick={handleToggleVisibility}
                title="Click to toggle visibility"
              >
                {repo.visibility}
              </button>
            )}
          </div>
          
          <div className="repo-actions">
            <button className="btn-outline" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
            {repo.owner?._id === localStorage.getItem("userId") && (
              <button className="btn-danger" onClick={handleDeleteRepo}>
                Delete Repository
              </button>
            )}
          </div>
        </div>
        
        <div className="repo-info">
          {isEditingDesc ? (
            <div className="edit-description">
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows="3"
                placeholder="Repository description"
              />
              <div className="edit-actions">
                <button onClick={() => setIsEditingDesc(false)}>Cancel</button>
                <button onClick={handleUpdateDescription}>Save</button>
              </div>
            </div>
          ) : (
            <div className="description-container">
              <p className="repo-description">{repo.description || "No description provided"}</p>
              {repo.owner?._id === localStorage.getItem("userId") && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingDesc(true)}
                  title="Edit description"
                >
                  Edit
                </button>
              )}
            </div>
          )}
          <div className="repo-owner">
            Owner: {repo.owner?.username || "Unknown"}
          </div>
        </div>
        
        <div className="repo-tabs">
          <button 
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
          <button 
            className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Issues ({issues.length})
          </button>
        </div>
        
        {activeTab === 'code' && (
          <div className="repo-code-section">
            <div className="code-management-layout">
              <div className="file-tree-panel">
                <FileTree 
                  repositoryId={id}
                  onFileSelect={setSelectedFile}
                />
              </div>
              <div className="code-editor-panel">
                <CodeEditor 
                  repositoryId={id}
                  selectedFile={selectedFile}
                  onFileSave={handleFileRefresh}
                  isOwner={repo.owner?._id === localStorage.getItem("userId")}
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'issues' && (
          <div className="issues-section">
            <div className="issues-header">
              <h3>Issues</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowNewIssueForm(!showNewIssueForm)}
              >
                {showNewIssueForm ? 'Cancel' : 'New Issue'}
              </button>
            </div>
            
            {showNewIssueForm && (
              <div className="new-issue-form">
                <h4>Create New Issue</h4>
                <form onSubmit={handleCreateIssue}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newIssue.title}
                      onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                      placeholder="Issue title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                      rows="3"
                      placeholder="Describe the issue"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Create Issue
                  </button>
                </form>
              </div>
            )}
            
            {issues.length > 0 ? (
              <ul className="issues-list">
                {issues.map(issue => (
                  <li key={issue._id} className="issue-item">
                    <Link to={`/issue/${issue._id}`} className="issue-link">
                      <div className="issue-header">
                        <span className="issue-title">{issue.title}</span>
                        <span className={`issue-status ${issue.status}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="issue-description">
                        {issue.description.length > 100
                          ? `${issue.description.substring(0, 100)}...`
                          : issue.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-message">No issues found for this repository.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RepoDetail;