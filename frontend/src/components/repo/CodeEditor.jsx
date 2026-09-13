import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import "./CodeEditor.css";

const CodeEditor = ({ repositoryId, selectedFile, onFileSave, isOwner }) => {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewFile, setIsNewFile] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      setContent(selectedFile.content || "");
      setFileName(selectedFile.name || "");
      setFilePath(selectedFile.path || "");
      setIsNewFile(false);
      setIsEditing(false);
    }
  }, [selectedFile]);

  const handleSaveFile = async () => {
    if (!fileName.trim() || !repositoryId) {
      alert("File name and repository are required");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.apiUrl}/repo/${repositoryId}/files`,
        {
          fileName: fileName,
          content: content,
          path: filePath || fileName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIsEditing(false);
      setIsNewFile(false);
      
      // Notify parent component to refresh file tree
      if (onFileSave) {
        onFileSave();
      }

      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewFile = () => {
    setContent("");
    setFileName("");
    setFilePath("");
    setIsNewFile(true);
    setIsEditing(true);
  };

  const getLanguageFromExtension = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
      'vue': 'javascript',
      'scss': 'scss',
      'less': 'less',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[extension] || 'text';
  };

  const formatContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="code-line">
        <span className="line-number">{index + 1}</span>
        <span className="line-content">{line || ' '}</span>
      </div>
    ));
  };

  const downloadFile = () => {
    if (!fileName || !content) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="file-info">
          {isNewFile ? (
            <div className="new-file-inputs">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="filename.ext"
                className="file-name-input"
              />
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="optional/path/filename.ext"
                className="file-path-input"
              />
            </div>
          ) : (
            <>
              <span className="file-icon">📄</span>
              <span className="file-name">{fileName || "No file selected"}</span>
              {selectedFile && (
                <>
                  <span className="file-size">({Math.round(content.length / 1024 * 100) / 100} KB)</span>
                  <span className="language-badge">{getLanguageFromExtension(fileName)}</span>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="editor-actions">
          {!isNewFile && (
            <button onClick={downloadFile} className="action-btn download-btn">
              ⬇️ Download
            </button>
          )}
          
          {isOwner && (
            <>
              {isEditing ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setIsNewFile(false);
                    }}
                    className="action-btn cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveFile}
                    disabled={isSaving}
                    className="action-btn save-btn"
                  >
                    {isSaving ? "Saving..." : "💾 Save"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleNewFile} className="action-btn new-btn">
                    ➕ New File
                  </button>
                  {selectedFile && (
                    <button onClick={() => setIsEditing(true)} className="action-btn edit-btn">
                      ✏️ Edit
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="editor-content">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="code-textarea"
            placeholder={isNewFile ? "Write your code here..." : "Edit your code..."}
            spellCheck={false}
          />
        ) : (
          <div className="code-viewer">
            {content ? (
              <div className="code-content">
                {formatContent(content)}
              </div>
            ) : (
              <div className="no-file-selected">
                <div className="empty-state">
                  <span className="empty-icon">📂</span>
                  <h3>No file selected</h3>
                  <p>Select a file from the tree to view its content</p>
                  {isOwner && (
                    <button onClick={handleNewFile} className="create-file-btn">
                      Create New File
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
