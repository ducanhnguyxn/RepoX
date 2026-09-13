import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./CreateRepo.css";
import logo from "../../assets/logo.png";
import config from "../../config";

const CreateRepo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public",
    readmeOption: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      // Simple validation
      if (!formData.name.trim()) {
        alert("Repository name is required");
        setLoading(false);
        return;
      }

      // Prepare initial content if README is selected
      const content = formData.readmeOption ? 
        [`# ${formData.name}\n\n${formData.description || 'A new repository'}`] : 
        [];

      await axios.post(
        `${config.apiUrl}/create`,
        {
          name: formData.name,
          description: formData.description,
          visibility: formData.visibility,
          owner: userId,
          content: content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Repository created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating repository:", error);
      alert("Failed to create repository: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-container">
        <div className="create-repo-card">
          <div className="repo-logo-container">
            <img src={logo} alt="RepoX Logo" className="repo-logo" />
          </div>
          <h2>Create a New Repository</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Repository Name Field */}
            <div className="form-group">
              <label htmlFor="name">Repository Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                required
              />
              <small>Choose a unique name for your repository</small>
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell people what your project is about..."
                rows="3"
              />
              <small>A good description helps others understand your project</small>
            </div>

            {/* Visibility Field */}
            <div className="form-group">
              <label htmlFor="visibility">Visibility</label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <small>
                {formData.visibility === "public" 
                  ? "Anyone can see this repository" 
                  : "Only you can see this repository"
                }
              </small>
            </div>

            {/* README Option */}
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="readmeOption"
                name="readmeOption"
                checked={formData.readmeOption}
                onChange={handleChange}
              />
              <label htmlFor="readmeOption">Initialize this repository with a README</label>
              <small>This will create a README.md file with the repository name and description</small>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate("/")}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Creating..." : "Create Repository"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;