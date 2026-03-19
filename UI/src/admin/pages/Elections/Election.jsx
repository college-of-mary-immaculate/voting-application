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
      // MySQL format: "2026-03-19 23:10:00"
      const [datePart, timePart] = mysqlDateTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      // Format to 12-hour with AM/PM
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let hours = parseInt(hour);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
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
      // MySQL: "2026-03-19 23:10:00" -> datetime-local: "2026-03-19T23:10"
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

  const openAssignModal = async (election) => {
    setSelectedElectionId(election.election_id);
    setShowAssignModal(true);
    setSelectedVoters([]);
    setSearch("");
    setVotersLoading(true);
    setVotersError(null);

    try {
      const res = await API.get(
        `/voters/election/${election.election_id}/voters`,
      );

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
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const filteredVoters = voters.filter((v) =>
    (v.full_name || "").toLowerCase().includes(search.toLowerCase()),
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
      // Send the datetime-local value directly - backend expects YYYY-MM-DDTHH:mm
      const startLocal = formData.start_at;
      const endLocal = formData.end_at;

      console.log("Sending to backend:", {
        name: formData.name.trim(),
        election_type_id: Number(formData.election_type_id),
        start_at: startLocal,
        end_at: endLocal
      });

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
          : "Election created successfully!",
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
    if (
      !window.confirm(
        "Are you sure you want to delete this election? This action cannot be undone.",
      )
    ) {
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
        <h1 className="election-title">Manage Elections</h1>
        <p className="election-subtitle">
          Create, edit, and monitor all voting events
        </p>
      </div>

      {/* Create / Edit Form */}
      <div className="content-card">
        <div className="content-header">
          <h2 className="content-title">
            {editingId ? "Edit Election" : "Create New Election"}
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            disabled={submitting}
          >
            {showForm ? "Cancel" : "Add Election"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Election Type *</label>
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
                <label>Election Name *</label>
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
                <label>Start Date & Time (Philippines Time) *</label>
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
                <label>End Date & Time (Philippines Time) *</label>
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
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Election"
                    : "Create Election"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Elections List */}
      <div className="content-card">
        <div className="content-header flex justify-between items-center">
          <h2 className="content-title">Elections List</h2>
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
          <div className="loading text-center py-8">Loading elections...</div>
        ) : error ? (
          <div className="error-message text-center py-8">{error}</div>
        ) : filteredElections.length === 0 ? (
          <div className="empty-state text-center py-12">
            No elections found for the selected filter.
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
                  <th>Assign</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((el) => {
                  // Debug log to verify the format
                  console.log(`Election ${el.election_id}:`, {
                    raw: el.start_at,
                    formatted: formatDisplayDate(el.start_at)
                  });

                  return (
                    <tr key={el.election_id}>
                      <td>{el.election_id}</td>
                      <td className="font-medium">{el.election_name}</td>
                      <td>{el.type_name || "Unknown"}</td>
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
                          className="btn btn-edit mr-2"
                          onClick={() => handleEdit(el)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(el.election_id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openAssignModal(el)}
                        >
                          Assign Voters
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showAssignModal && (
          <div className="modal-overlay">
            <div className="modal assign-voters-modal content-card">
              {/* Header */}
              <div className="content-header">
                <div>
                  <h2 className="content-title">Assign Voters to Election</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Election ID: {selectedElectionId}
                  </p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Close
                </button>
              </div>

              <div className="modal-body p-6">
                {/* Search */}
                <div className="mb-5">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* Select All + Count */}
                <div className="flex justify-between items-center mb-4 text-sm">
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
                            filteredVoters.map((v) => v.voter_id),
                          );
                        }
                      }}
                    />
                    <span>Select All</span>
                  </label>

                  <span className="text-gray-600">
                    {selectedVoters.length} selected
                    {filteredVoters.length > 0 && ` / ${filteredVoters.length}`}
                  </span>
                </div>

                {/* Voter List */}
                <div className="voters-list-container">
                  {votersLoading ? (
                    <div className="text-center py-10 text-gray-500">
                      Loading voters...
                    </div>
                  ) : votersError ? (
                    <div className="text-center py-10 text-red-600 font-medium">
                      {votersError}
                    </div>
                  ) : filteredVoters.length === 0 ? (
                    <div className="empty-voters text-center py-12 px-6 text-gray-500">
                      {search.trim() ? (
                        <>
                          <div className="text-lg font-medium mb-2">
                            No matching voters
                          </div>
                          <div>No voters found matching "{search.trim()}"</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-medium mb-2">
                            No available voters
                          </div>
                          <div>
                            There are no voters available to assign to this
                            election yet.
                          </div>
                          <div className="text-xs mt-2 text-gray-400">
                            (server returned {voters.length} voters)
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
                          />
                          <span className="voter-name">{voter.full_name}</span>
                          <span className="voter-id text-xs text-gray-500">
                            ID: {voter.voter_id}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={assignVoters}
                  disabled={selectedVoters.length === 0}
                >
                  Assign {selectedVoters.length} Voter
                  {selectedVoters.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="election-footer text-center mt-8 text-gray-500">
        Connected to backend • {elections.length} elections loaded
      </p>
    </div>
  );
}