import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import "./Election.css";

const electionTypes = [
  { id: 0, name: "All Types", description: "Show all elections" },
  {
    id: 1,
    name: "National Elections",
    description: "Country-wide / presidential / congressional elections",
  },
  {
    id: 2,
    name: "Barangay Elections",
    description: "Local village / community-level elections",
  },
  {
    id: 3,
    name: "School Elections",
    description: "Student council, class officers, campus organizations",
  },
  {
    id: 4,
    name: "Custom Elections",
    description: "Any user-defined or special voting event",
  },
];

export default function Elections() {
  const [selectedType, setSelectedType] = useState(0);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Assign voters states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [voters, setVoters] = useState([]);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [search, setSearch] = useState("");
  const [votersLoading, setVotersLoading] = useState(false);
  const [votersError, setVotersError] = useState(null);

  // Position management states
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [selectedElectionForPositions, setSelectedElectionForPositions] = useState(null);
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionForm, setPositionForm] = useState({
    position_name: "",
    max_vote_allowed: 1
  });
  const [editingPosition, setEditingPosition] = useState(null);
  const [positionError, setPositionError] = useState(null);

  // Candidate management states
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    full_name: "",
    party_name: "",
    photo_url: "",
    status: "Active"
  });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [candidateError, setCandidateError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    election_type_id: 3,
    name: "",
    start_at: "",
    end_at: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Format MySQL datetime (YYYY-MM-DD HH:mm:ss) to readable 12-hour format
  const formatDisplayDate = (mysqlDateTime) => {
    if (!mysqlDateTime) return "";
    
    try {
      const [datePart, timePart] = mysqlDateTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let hours = parseInt(hour);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      return `${months[parseInt(month)-1]} ${parseInt(day)}, ${year}, ${hours}:${minute} ${ampm}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return mysqlDateTime;
    }
  };

  // Convert MySQL datetime to datetime-local input format for editing
  const mysqlToInputFormat = (mysqlDateTime) => {
    if (!mysqlDateTime) return "";
    try {
      return mysqlDateTime.substring(0, 16).replace(' ', 'T');
    } catch (error) {
      return "";
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await API.get("/elections");

      if (data.status === "success") {
        setElections(data.data || []);
      } else {
        throw new Error(data.message || data.error || "Backend error");
      }
    } catch (err) {
      setError(err.message || "Failed to load elections");
      console.error("Fetch elections error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Position management functions
  const openPositionModal = async (election) => {
    setSelectedElectionForPositions(election);
    setShowPositionModal(true);
    fetchPositions(election.election_id);
  };

  const fetchPositions = async (electionId) => {
    try {
      setPositionsLoading(true);
      const response = await API.get(`/elections/${electionId}/positions`);
      
      if (response.status === "success") {
        setPositions(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch positions");
      }
    } catch (err) {
      console.error("Fetch positions error:", err);
      setPositionError(err.message);
    } finally {
      setPositionsLoading(false);
    }
  };

  const handlePositionSubmit = async (e) => {
    e.preventDefault();
    setPositionError(null);

    if (!positionForm.position_name.trim()) {
      setPositionError("Position name is required");
      return;
    }

    try {
      if (editingPosition) {
        // Update position
        await API.put(`/positions/${editingPosition.position_id}`, {
          position_name: positionForm.position_name.trim(),
          max_vote_allowed: parseInt(positionForm.max_vote_allowed)
        });
      } else {
        // Create position
        await API.post(`/elections/${selectedElectionForPositions.election_id}/positions`, {
          position_name: positionForm.position_name.trim(),
          max_vote_allowed: parseInt(positionForm.max_vote_allowed)
        });
      }

      resetPositionForm();
      fetchPositions(selectedElectionForPositions.election_id);
    } catch (err) {
      setPositionError(err.message || "Failed to save position");
    }
  };

  const handlePositionEdit = (position) => {
    setEditingPosition(position);
    setPositionForm({
      position_name: position.position_name,
      max_vote_allowed: position.max_vote_allowed
    });
  };

  const handlePositionDelete = async (positionId) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;

    try {
      await API.delete(`/positions/${positionId}`);
      fetchPositions(selectedElectionForPositions.election_id);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const resetPositionForm = () => {
    setPositionForm({
      position_name: "",
      max_vote_allowed: 1
    });
    setEditingPosition(null);
    setPositionError(null);
  };

  // Candidate management functions
  const openCandidateModal = async (position) => {
    setSelectedPosition(position);
    setShowCandidateModal(true);
    resetCandidateForm();
    await fetchCandidates(position.position_id);
  };

  const fetchCandidates = async (positionId) => {
    try {
      setCandidatesLoading(true);
      setCandidateError(null);
      
      const response = await API.get(`/candidates/position/${positionId}`);
      
      if (response && response.status === "success") {
        setCandidates(response.data || []);
      } else if (response && response.data) {
        setCandidates(Array.isArray(response.data) ? response.data : []);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error("Fetch candidates error:", err);
      setCandidateError(err.message || "Failed to fetch candidates");
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setCandidateError("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setCandidateError("File must be an image");
        return;
      }

      setPhotoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setCandidateForm(prev => ({ ...prev, photo_url: previewUrl }));
    }
  };

const uploadPhoto = async () => {
  if (!photoFile) return null;

  try {
    setUploadingPhoto(true);
    
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await API.upload('/upload/photo', formData);
    
    if (response.status === 'success') {
      return response.data.file_path;
    } else {
      throw new Error(response.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  } finally {
    setUploadingPhoto(false);
  }
};

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setCandidateError(null);

    if (!candidateForm.full_name.trim()) {
      setCandidateError("Candidate name is required");
      return;
    }

    try {
      let photoUrl = candidateForm.photo_url;

      // Upload photo if selected
      if (photoFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const candidateData = {
        position_id: selectedPosition.position_id,
        full_name: candidateForm.full_name.trim(),
        party_name: candidateForm.party_name.trim() || null,
        photo_url: photoUrl,
        status: candidateForm.status
      };

      if (editingCandidate) {
        await API.put(`/candidates/${editingCandidate.candidate_id}`, candidateData);
      } else {
        await API.post("/candidates", candidateData);
      }

      resetCandidateForm();
      fetchCandidates(selectedPosition.position_id);
    } catch (err) {
      setCandidateError(err.message || "Failed to save candidate");
    }
  };

  const handleCandidateEdit = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      full_name: candidate.full_name,
      party_name: candidate.party_name || "",
      photo_url: candidate.photo_url || "",
      status: candidate.status || "Active"
    });
    setPhotoFile(null);
    setPhotoPreview(candidate.photo_url || null);
  };

  const handleCandidateDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await API.delete(`/candidates/${candidateId}`);
      fetchCandidates(selectedPosition.position_id);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      full_name: "",
      party_name: "",
      photo_url: "",
      status: "Active"
    });
    setEditingCandidate(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setCandidateError(null);
  };

  const openAssignModal = async (election) => {
    setSelectedElectionId(election.election_id);
    setShowAssignModal(true);
    setSelectedVoters([]);
    setSearch("");
    setVotersLoading(true);
    setVotersError(null);

    try {
      const res = await API.get(`/voters/election/${election.election_id}/voters`);
      const votersArray = res?.data ?? [];
      setVoters(votersArray);
    } catch (err) {
      console.error("Failed to fetch voters:", err);
      setVotersError("Failed to load available voters");
      setVoters([]);
    } finally {
      setVotersLoading(false);
    }
  };

  const toggleVoter = (id) => {
    setSelectedVoters((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filteredVoters = voters.filter((v) =>
    (v.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const assignVoters = async () => {
    try {
      await API.post(`/admins/election/${selectedElectionId}/assign-voters`, {
        voter_ids: selectedVoters,
      });
      alert("Voters assigned successfully!");
      setShowAssignModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to assign voters");
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      election_type_id: 3,
      name: "",
      start_at: "",
      end_at: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Election name is required");
      return;
    }
    if (!formData.election_type_id) {
      setError("Please select an election type");
      return;
    }
    if (!formData.start_at || !formData.end_at) {
      setError("Start and end dates are required");
      return;
    }

    setSubmitting(true);

    try {
      const startLocal = formData.start_at;
      const endLocal = formData.end_at;

      let data;
      if (editingId) {
        data = await API.put(`/elections/${editingId}`, {
          name: formData.name.trim(),
          election_type_id: Number(formData.election_type_id),
          start_at: startLocal,
          end_at: endLocal,
        });
      } else {
        data = await API.post("/elections", {
          name: formData.name.trim(),
          election_type_id: Number(formData.election_type_id),
          start_at: startLocal,
          end_at: endLocal,
        });
      }

      if (data.status !== "success") {
        throw new Error(data.message || data.error || "Operation failed");
      }

      alert(
        editingId
          ? "Election updated successfully!"
          : "Election created successfully!"
      );
      resetForm();
      fetchElections();
    } catch (err) {
      setError(err.message || "Operation failed. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (election) => {
    setEditingId(election.election_id);
    setFormData({
      election_type_id: election.election_type_id,
      name: election.election_name || "",
      start_at: mysqlToInputFormat(election.start_at),
      end_at: mysqlToInputFormat(election.end_at),
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election? This action cannot be undone.")) {
      return;
    }

    try {
      await API.delete(`/elections/${id}`);
      alert("Election deleted successfully!");
      fetchElections();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
      console.error("Delete error:", err);
    }
  };

  const filteredElections =
    selectedType === 0
      ? elections
      : elections.filter((el) => el.election_type_id === selectedType);

  return (
    <div className="election-container">
      <div className="election-header">
        <h1 className="election-title">🗳️ Manage Elections</h1>
        <p className="election-subtitle">
          Create, edit, and monitor all voting events
        </p>
      </div>

      {/* Create / Edit Form */}
      <div className="content-card">
        <div className="content-header">
          <h2 className="content-title">
            {editingId ? "✏️ Edit Election" : "➕ Create New Election"}
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? "✕ Cancel" : "➕ Add Election"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>📋 Election Type *</label>
                <select
                  name="election_type_id"
                  value={formData.election_type_id}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  {electionTypes.slice(1).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>🏷️ Election Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. 2026 Student Council Election"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>⏰ Start Date & Time (Philippines Time) *</label>
                <input
                  type="datetime-local"
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
                <small className="text-gray-500">Enter time in Philippines (UTC+8)</small>
              </div>

              <div className="form-group">
                <label>⌛ End Date & Time (Philippines Time) *</label>
                <input
                  type="datetime-local"
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
                <small className="text-gray-500">Enter time in Philippines (UTC+8)</small>
              </div>
            </div>

            {error && <div className="error-message mt-3">{error}</div>}

            <div className="form-actions mt-4">
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? "⏳ Saving..." : editingId ? "✏️ Update Election" : "✅ Create Election"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={resetForm}
                disabled={submitting}
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Elections List */}
      <div className="content-card">
        <div className="content-header flex justify-between items-center">
          <h2 className="content-title">📊 Elections List</h2>
          <div className="filter-group">
            <label className="mr-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(Number(e.target.value))}
              className="filter-select"
            >
              {electionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading text-center py-8">⏳ Loading elections...</div>
        ) : error ? (
          <div className="error-message text-center py-8">{error}</div>
        ) : filteredElections.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-medium mb-2">No elections found</div>
            <div className="text-gray-500">Create your first election to get started</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="elections-table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Start (PH Time)</th>
                  <th>End (PH Time)</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Positions</th>
                  <th>Voters</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((el) => (
                  <tr key={el.election_id}>
                    <td>#{el.election_id}</td>
                    <td className="font-medium">{el.election_name}</td>
                    <td>
                      <span className="type-badge">
                        {el.type_name || "Unknown"}
                      </span>
                    </td>
                    <td title={`Raw: ${el.start_at}`}>{formatDisplayDate(el.start_at)}</td>
                    <td title={`Raw: ${el.end_at}`}>{formatDisplayDate(el.end_at)}</td>
                    <td>
                      <span
                        className={`status-badge ${el.status === "Ongoing" ? "ongoing" : el.status === "Upcoming" ? "upcoming" : "closed"}`}
                      >
                        {el.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-edit btn-sm mr-2"
                        onClick={() => handleEdit(el)}
                        title="Edit election"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-delete btn-sm"
                        onClick={() => handleDelete(el.election_id)}
                        title="Delete election"
                      >
                        🗑️
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openPositionModal(el)}
                        title="Manage positions"
                      >
                        📋 Positions ({el.positions_count || 0})
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openAssignModal(el)}
                        title="Assign voters"
                      >
                        👥 Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Position Management Modal */}
      {showPositionModal && selectedElectionForPositions && (
        <div className="modal-overlay">
          <div className="modal position-modal content-card">
            <div className="content-header">
              <div>
                <h2 className="content-title">📋 Manage Positions</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Election: <span className="font-semibold">{selectedElectionForPositions.election_name}</span>
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPositionModal(false);
                  resetPositionForm();
                }}
              >
                ✕ Close
              </button>
            </div>

            <div className="modal-body p-6">
              {/* Position Form */}
              <div className="form-section mb-6">
                <h3 className="form-section-title">
                  {editingPosition ? "✏️ Edit Position" : "➕ Add New Position"}
                </h3>
                <form onSubmit={handlePositionSubmit}>
                  <div className="form-grid-small">
                    <div className="form-group">
                      <label>Position Name *</label>
                      <input
                        type="text"
                        value={positionForm.position_name}
                        onChange={(e) => setPositionForm({...positionForm, position_name: e.target.value})}
                        placeholder="e.g. President, Vice President"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Votes Allowed *</label>
                      <input
                        type="number"
                        min="1"
                        value={positionForm.max_vote_allowed}
                        onChange={(e) => setPositionForm({...positionForm, max_vote_allowed: parseInt(e.target.value) || 1})}
                        required
                      />
                      <small>Maximum number of votes per voter</small>
                    </div>
                  </div>

                  {positionError && (
                    <div className="error-message mt-2">{positionError}</div>
                  )}

                  <div className="form-actions-small mt-3">
                    <button type="submit" className="btn btn-success">
                      {editingPosition ? "✏️ Update Position" : "✅ Add Position"}
                    </button>
                    {editingPosition && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetPositionForm}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Positions List */}
              <div className="positions-section">
                <h3 className="form-section-title">📋 Positions List</h3>
                {positionsLoading ? (
                  <div className="text-center py-4">⏳ Loading positions...</div>
                ) : positions.length === 0 ? (
                  <div className="empty-state text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-medium mb-2">No positions added yet</div>
                    <div className="text-gray-500">Add your first position above</div>
                  </div>
                ) : (
                  <div className="positions-grid">
                    {positions.map((pos) => (
                      <div key={pos.position_id} className="position-card">
                        <div className="position-card-header">
                          <h4 className="position-name">{pos.position_name}</h4>
                          <span className="max-votes-badge">
                            Max {pos.max_vote_allowed} vote{pos.max_vote_allowed > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="position-card-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openCandidateModal(pos)}
                            title="Manage candidates"
                          >
                            👥 Candidates
                          </button>
                          <button
                            className="btn btn-edit btn-sm"
                            onClick={() => handlePositionEdit(pos)}
                            title="Edit position"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-delete btn-sm"
                            onClick={() => handlePositionDelete(pos.position_id)}
                            title="Delete position"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Management Modal */}
      {showCandidateModal && selectedPosition && (
        <div className="modal-overlay">
          <div className="modal candidate-modal content-card">
            <div className="content-header">
              <div>
                <h2 className="content-title">👥 Manage Candidates</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Position: <span className="font-semibold">{selectedPosition.position_name}</span>
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCandidateModal(false);
                  resetCandidateForm();
                }}
              >
                ✕ Close
              </button>
            </div>

            <div className="modal-body p-6">
              {/* Candidate Form */}
              <div className="form-section mb-6">
                <h3 className="form-section-title">
                  {editingCandidate ? "✏️ Edit Candidate" : "➕ Add New Candidate"}
                </h3>
                <form onSubmit={handleCandidateSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>👤 Full Name *</label>
                      <input
                        type="text"
                        value={candidateForm.full_name}
                        onChange={(e) => setCandidateForm({...candidateForm, full_name: e.target.value})}
                        placeholder="Candidate's full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>🏛️ Party/Partylist</label>
                      <input
                        type="text"
                        value={candidateForm.party_name}
                        onChange={(e) => setCandidateForm({...candidateForm, party_name: e.target.value})}
                        placeholder="e.g. Student Party, Independent"
                      />
                    </div>

                    <div className="form-group">
                      <label>📊 Status</label>
                      <select
                        value={candidateForm.status}
                        onChange={(e) => setCandidateForm({...candidateForm, status: e.target.value})}
                      >
                        <option value="Active">✅ Active</option>
                        <option value="Withdrawn">⏸️ Withdrawn</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>📸 Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="file-input"
                      />
                      <small>Max 5MB. Leave empty to keep existing photo.</small>
                    </div>
                  </div>

                  {photoPreview && (
                    <div className="photo-preview-container mt-3">
                      <img src={photoPreview} alt="Preview" className="photo-preview" />
                    </div>
                  )}

                  {candidateError && (
                    <div className="error-message mt-2">{candidateError}</div>
                  )}

                  <div className="form-actions mt-4">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? "⏳ Uploading..." : (editingCandidate ? "✏️ Update Candidate" : "✅ Add Candidate")}
                    </button>
                    {editingCandidate && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetCandidateForm}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Candidates List */}
              <div className="candidates-section">
                <h3 className="form-section-title">👥 Candidates List</h3>
                {candidatesLoading ? (
                  <div className="text-center py-4">⏳ Loading candidates...</div>
                ) : candidates.length === 0 ? (
                  <div className="empty-state text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-medium mb-2">No candidates added yet</div>
                    <div className="text-gray-500">Add your first candidate above</div>
                  </div>
                ) : (
                  <div className="candidates-grid">
                    {candidates.map((candidate) => (
                      <div key={candidate.candidate_id} className="candidate-card">
                        <div className="candidate-photo-wrapper">
                          {candidate.photo_url ? (
                            <img 
                              src={candidate.photo_url} 
                              alt={candidate.full_name}
                              className="candidate-photo"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="candidate-photo-placeholder">
                              👤
                            </div>
                          )}
                        </div>
                        <div className="candidate-info">
                          <h4 className="candidate-name">{candidate.full_name}</h4>
                          {candidate.party_name && (
                            <p className="candidate-party">{candidate.party_name}</p>
                          )}
                          <div className="candidate-status">
                            <span className={`status-badge-small ${candidate.status === 'Active' ? 'active' : 'withdrawn'}`}>
                              {candidate.status === 'Active' ? '✅ Active' : '⏸️ Withdrawn'}
                            </span>
                            <span className="candidate-number">
                              #{candidate.ballot_number}
                            </span>
                          </div>
                        </div>
                        <div className="candidate-actions">
                          <button
                            className="btn btn-edit btn-sm"
                            onClick={() => handleCandidateEdit(candidate)}
                            title="Edit candidate"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-delete btn-sm"
                            onClick={() => handleCandidateDelete(candidate.candidate_id)}
                            title="Delete candidate"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Voters Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal assign-voters-modal content-card">
            <div className="content-header">
              <div>
                <h2 className="content-title">👥 Assign Voters to Election</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Election ID: <span className="font-semibold">#{selectedElectionId}</span>
                </p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <div className="modal-body p-6">
              <div className="search-box mb-4">
                <input
                  type="text"
                  placeholder="🔍 Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="selection-info flex justify-between items-center mb-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      filteredVoters.length > 0 &&
                      selectedVoters.length === filteredVoters.length
                    }
                    onChange={() => {
                      if (selectedVoters.length === filteredVoters.length) {
                        setSelectedVoters([]);
                      } else {
                        setSelectedVoters(
                          filteredVoters.map((v) => v.voter_id)
                        );
                      }
                    }}
                    className="checkbox"
                  />
                  <span>Select All</span>
                </label>

                <span className="selection-count">
                  {selectedVoters.length} selected
                  {filteredVoters.length > 0 && ` of ${filteredVoters.length}`}
                </span>
              </div>

              <div className="voters-list-container">
                {votersLoading ? (
                  <div className="text-center py-10 text-gray-500">
                    ⏳ Loading voters...
                  </div>
                ) : votersError ? (
                  <div className="text-center py-10 text-red-600 font-medium">
                    {votersError}
                  </div>
                ) : filteredVoters.length === 0 ? (
                  <div className="empty-voters text-center py-12 px-6 text-gray-500">
                    {search.trim() ? (
                      <>
                        <div className="text-4xl mb-3">🔍</div>
                        <div className="text-lg font-medium mb-2">
                          No matching voters
                        </div>
                        <div>No voters found matching "{search.trim()}"</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-3">👥</div>
                        <div className="text-lg font-medium mb-2">
                          No available voters
                        </div>
                        <div>
                          There are no voters available to assign to this election yet.
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="voter-list">
                    {filteredVoters.map((voter) => (
                      <label key={voter.voter_id} className="voter-item">
                        <input
                          type="checkbox"
                          checked={selectedVoters.includes(voter.voter_id)}
                          onChange={() => toggleVoter(voter.voter_id)}
                          className="checkbox"
                        />
                        <span className="voter-name">{voter.full_name}</span>
                        <span className="voter-id">
                          ID: #{voter.voter_id}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                ✕ Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={assignVoters}
                disabled={selectedVoters.length === 0}
              >
                ✅ Assign {selectedVoters.length} Voter
                {selectedVoters.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="election-footer text-center mt-8 text-gray-500">
        Parallel Voting System • {elections.length} elections loaded
      </p>
    </div>
  );
}