-- =========================================
-- Voting System Database Schema
-- =========================================

CREATE DATABASE IF NOT EXISTS voting_db;
USE voting_db;

-- =========================================
-- 1. Elections Table
-- =========================================
CREATE TABLE election_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO election_types (type_name) VALUES ('National'), ('Barangay'), ('School');

CREATE TABLE elections (
    election_id INT AUTO_INCREMENT PRIMARY KEY,
    election_type_id INT NOT NULL,
    election_name VARCHAR(100) NOT NULL,

    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,

    status ENUM('Upcoming','Ongoing','Closed') NOT NULL DEFAULT 'Upcoming',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_elections_type
        FOREIGN KEY (election_type_id)
        REFERENCES election_types(type_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;
-- =========================================
-- 2. Positions Table
-- =========================================
CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    max_vote_allowed INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_positions_election
        FOREIGN KEY (election_id)
        REFERENCES elections(election_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- 3. Candidates Table
-- =========================================
CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    party_name VARCHAR(100),
    photo_url VARCHAR(255),
    status ENUM('Active','Withdrawn') NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_candidates_position
        FOREIGN KEY (position_id)
        REFERENCES positions(position_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- 4. Voters Table
-- =========================================
CREATE TABLE voters (
    voter_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- 5. Votes Table
-- =========================================
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id INT NOT NULL,
    candidate_id INT NOT NULL,
    election_id INT NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_votes_voter
        FOREIGN KEY (voter_id)
        REFERENCES voters(voter_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_votes_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(candidate_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_votes_election
        FOREIGN KEY (election_id)
        REFERENCES elections(election_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- Indexes for Performance (Important for Replication & Scaling)
-- =========================================

CREATE INDEX idx_votes_candidate ON votes(candidate_id);
CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);

CREATE INDEX idx_positions_election ON positions(election_id);
CREATE INDEX idx_candidates_position ON candidates(position_id);