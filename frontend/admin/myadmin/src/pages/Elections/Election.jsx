import React, { useState } from 'react';
import './Election.css';

const electionTypes = [
  { id: 1, name: 'National Elections', description: 'Country-wide / presidential / congressional elections' },
  { id: 2, name: 'Barangay Elections', description: 'Local village / community-level elections' },
  { id: 3, name: 'School Elections', description: 'Student council, class officers, campus organizations' },
  { id: 4, name: 'Custom Elections', description: 'Any user-defined or special voting event' },
];

export default function Elections() {
  const [selectedType, setSelectedType] = useState(1);
  const currentType = electionTypes.find(t => t.id === selectedType);

  return (
    <div className="election-container space-y-8">
      {/* Header */}
      <div className="election-header">
        <h1 className="election-title">Elections Management</h1>
        <p className="election-subtitle">
          Create, view and manage voting events • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Selector */}
      <div className="selector-card">
        <label className="selector-label">Select Election Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(Number(e.target.value))}
          className="selector-select"
        >
          {electionTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} (ID: {type.id})
            </option>
          ))}
        </select>

        {currentType && (
          <div className="type-info-box">
            <h3 className="type-info-title">{currentType.name}</h3>
            <div className="type-info-id">Type ID: {currentType.id}</div>
            <p className="type-info-desc">{currentType.description}</p>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="content-card">
        <div className="content-header">
          <h3 className="content-title">
            {currentType ? `${currentType.name} Overview` : 'Election Management'}
          </h3>
        </div>

        <div className="content-body">
          <p className="empty-message">
            {currentType ? `Manage ${currentType.name}` : 'Select an election type above'}
          </p>
          <p className="empty-subtext">
            {currentType
              ? 'Here you will see list of elections, create new, edit, view results, etc.'
              : 'Choose election type to see relevant management options'}
          </p>
          <button
            className="create-btn"
            disabled
          >
            Create New {currentType?.name || 'Election'} (coming soon)
          </button>
        </div>
      </div>

      <p className="election-footer">
        Election types are stored in database (IDs 1–4) • Extend later as needed
      </p>
    </div>
  );
}