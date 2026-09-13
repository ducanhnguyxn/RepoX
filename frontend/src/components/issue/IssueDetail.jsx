import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Navbar from "../Navbar";
import "./IssueDetail.css";

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssue, setEditedIssue] = useState({
    title: "",
    description: "",
    status: ""
  });

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.apiUrl}/issue/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIssue(response.data);
        setEditedIssue({
          title: response.data.title,
          description: response.data.description,
          status: response.data.status
        });
      } catch (error) {
        console.error("Error fetching issue:", error);
        setError("Failed to load issue. It might not exist or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleUpdateIssue = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${config.apiUrl}/issue/${id}`,
        editedIssue,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIssue(response.data.issue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("Failed to update issue");
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.apiUrl}/issue/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Navigate back to the repository page
      if (issue.repository && issue.repository._id) {
        navigate(`/repo/${issue.repository._id}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Failed to delete issue");
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = issue.status === "open" ? "closed" : "open";
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${config.apiUrl}/issue/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIssue(response.data.issue);
    } catch (error) {
      console.error("Error updating issue status:", error);
      alert("Failed to update issue status");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="issue-container">
          <div className="loading">Loading issue...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="issue-container">
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
      <div className="issue-container">
        <div className="issue-header">
          <div className="breadcrumbs">
            {issue.repository && (
              <Link to={`/repo/${issue.repository._id}`} className="repo-link">
                {issue.repository.name}
              </Link>
            )}
            <span className="separator">/</span>
            <span>Issue #{id.substring(0, 7)}</span>
          </div>
          
          <div className="issue-actions">
            {issue.repository?.owner?._id === localStorage.getItem("userId") && (
              <>
                <button 
                  className={`status-toggle ${issue.status}`}
                  onClick={handleToggleStatus}
                >
                  {issue.status === "open" ? "Close Issue" : "Reopen Issue"}
                </button>
                <button 
                  className="btn-outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button className="btn-danger" onClick={handleDeleteIssue}>
                  Delete Issue
                </button>
              </>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="issue-edit-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editedIssue.title}
                onChange={(e) => setEditedIssue({...editedIssue, title: e.target.value})}
                placeholder="Issue title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editedIssue.description}
                onChange={(e) => setEditedIssue({...editedIssue, description: e.target.value})}
                rows="5"
                placeholder="Issue description"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editedIssue.status}
                onChange={(e) => setEditedIssue({...editedIssue, status: e.target.value})}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-actions">
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateIssue} className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="issue-content">
            <div className="issue-title-section">
              <h1>{issue.title}</h1>
              <span className={`issue-status-badge ${issue.status}`}>
                {issue.status}
              </span>
            </div>
            <div className="issue-description">
              <h3>Description</h3>
              <p>{issue.description}</p>
            </div>
            <div className="issue-meta">
              <p><strong>Created:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(issue.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IssueDetail;