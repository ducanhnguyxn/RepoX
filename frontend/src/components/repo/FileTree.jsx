import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import "./FileTree.css";

const FileTree = ({ repositoryId, onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.apiUrl}/repo/${repositoryId}/files`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setFiles(response.data.files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    if (repositoryId) {
      fetchFiles();
    }
  }, [repositoryId]);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'css': '🎨',
      'html': '🌐',
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'swift': '🦉',
      'kt': '🏗️',
      'dart': '🎯',
      'vue': '💚',
      'scss': '🎨',
      'less': '🎨',
      'xml': '📄',
      'yml': '📄',
      'yaml': '📄',
      'dockerfile': '🐳',
      'gitignore': '📝',
      'env': '🔐',
      'sql': '🗃️'
    };
    return iconMap[extension] || '📄';
  };

  const getFolderIcon = (isExpanded) => {
    return isExpanded ? '📂' : '📁';
  };

  const organizeFiles = (files) => {
    const tree = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let current = tree;
      
      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          // It's a file
          current[part] = file;
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    
    return tree;
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (tree, basePath = '') => {
    return Object.entries(tree).sort(([a], [b]) => {
      // Folders first, then files
      const aIsFile = tree[a].name !== undefined;
      const bIsFile = tree[b].name !== undefined;
      
      if (aIsFile && !bIsFile) return 1;
      if (!aIsFile && bIsFile) return -1;
      return a.localeCompare(b);
    }).map(([name, content]) => {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      const isFile = content.name !== undefined;
      
      if (isFile) {
        return (
          <div
            key={fullPath}
            className="file-item"
            onClick={() => onFileSelect && onFileSelect(content)}
          >
            <span className="file-icon">{getFileIcon(name)}</span>
            <span className="file-name">{name}</span>
            <span className="file-size">{formatFileSize(content.size)}</span>
          </div>
        );
      } else {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath} className="folder-item">
            <div
              className="folder-header"
              onClick={() => toggleFolder(fullPath)}
            >
              <span className="folder-icon">{getFolderIcon(isExpanded)}</span>
              <span className="folder-name">{name}</span>
            </div>
            {isExpanded && (
              <div className="folder-content">
                {renderTree(content, fullPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="file-tree-loading">
        <div className="loading-spinner"></div>
        <span>Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-tree-error">
        <span>❌ {error}</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-tree-empty">
        <span>📂 No files yet</span>
        <p>Start by adding some files to this repository</p>
      </div>
    );
  }

  const organizedTree = organizeFiles(files);

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>📁 Files</h3>
        <span className="file-count">{files.length} files</span>
      </div>
      <div className="file-tree-content">
        {renderTree(organizedTree)}
      </div>
    </div>
  );
};

export default FileTree;
