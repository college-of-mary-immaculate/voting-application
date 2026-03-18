-- =========================================
-- Voting System Database Schema
-- =========================================

CREATE DATABASE IF NOT EXISTS voting_db;
USE voting_db;

-- 1. Election Types
CREATE TABLE election_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO election_types (type_name) VALUES ('National'), ('Barangay'), ('School'), ('Custom');

-- 2. Elections
CREATE TABLE elections (
    election_id INT AUTO_INCREMENT PRIMARY KEY,
    election_type_id INT NOT NULL,
    election_name VARCHAR(100) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status ENUM('Upcoming','Ongoing','Closed') NOT NULL DEFAULT 'Upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_elections_type FOREIGN KEY (election_type_id) 
        REFERENCES election_types(type_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Position Templates (Added FK for data integrity)
CREATE TABLE position_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    election_type_id INT NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    max_vote_allowed INT DEFAULT 1,
    CONSTRAINT fk_templates_type FOREIGN KEY (election_type_id) 
        REFERENCES election_types(type_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Positions
CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    max_vote_allowed INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_positions_election FOREIGN KEY (election_id) 
        REFERENCES elections(election_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Candidates
CREATE TABLE candidates (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL,
    ballot_number INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    party_name VARCHAR(100),
    photo_url VARCHAR(255),
    status ENUM('Active','Withdrawn') NOT NULL DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ballot_per_position (position_id, ballot_number),
    CONSTRAINT fk_candidates_position FOREIGN KEY (position_id) 
        REFERENCES positions(position_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Voters
CREATE TABLE voters (
    voter_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE, -- Added UNIQUE for security
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Votes
CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id INT NOT NULL,
    candidate_id INT NOT NULL,
    election_id INT NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_votes_voter FOREIGN KEY (voter_id) REFERENCES voters(voter_id),
    CONSTRAINT fk_votes_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    CONSTRAINT fk_votes_election FOREIGN KEY (election_id) REFERENCES elections(election_id)
) ENGINE=InnoDB;

CREATE TABLE voter_elections (
    voter_id INT NOT NULL,
    election_id INT NOT NULL,
    PRIMARY KEY (voter_id, election_id),
    FOREIGN KEY (voter_id) REFERENCES voters(voter_id),
    FOREIGN KEY (election_id) REFERENCES elections(election_id)
);

-- 8. Admins
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


ALTER TABLE votes ADD CONSTRAINT unique_vote_per_voter_per_election 
UNIQUE(voter_id, election_id);
-- =========================================
-- SEED DATA
-- =========================================

-- Templates
INSERT INTO position_templates (election_type_id, position_name, max_vote_allowed) VALUES
(1, 'President', 1), (1, 'Vice President', 1), (1, 'Senator', 12),
(2, 'Barangay Captain', 1), (2, 'Barangay Kagawad', 7),
(3, 'President', 1), (3, 'Vice President', 1), (3, 'Board Member', 3);

-- Sample Election
INSERT INTO elections (election_type_id, election_name, start_at, end_at, status)
VALUES (3, '2026 Student Government Election', '2026-01-01 08:00:00', '2026-12-31 17:00:00', 'Ongoing');

-- Sample Positions (Linked to Election ID 1)
INSERT INTO positions (election_id, position_name, max_vote_allowed)
VALUES (1, 'President', 1), (1, 'Vice President', 1), (1, 'Board Member', 3);

-- Sample Candidates (Corrected "IINSERT" typo and ensured position_ids exist)
INSERT INTO candidates (position_id, ballot_number, full_name, party_name) VALUES
(1, 1, 'Juan Dela Cruz', 'Unity Party'),
(1, 2, 'Maria Santos', 'Progress Party'),
(2, 1, 'Carlos Reyes', 'Unity Party'), -- Reset ballot # for new position
(2, 2, 'Ana Lopez', 'Progress Party'),
(3, 1, 'Miguel Torres', 'Unity Party'),
(3, 2, 'Sofia Ramirez', 'Unity Party');

-- Sample Voters
INSERT INTO voters (full_name, email, password_hash) VALUES
('Alice Johnson', 'alice@example.com', '$2b$10$mK29hX5kZUG5xUmmKRcW4..OsClI9rr6e..uod64qTGcxWgSm7kn2'),
-- alice password: "alices"
('Bob Martinez', 'bob@example.com', 'hashed_pass_456');

-- Absolute Admin
INSERT INTO admins (full_name, email, password_hash)
VALUES ('adminone', 'adminone@gmail.com', '$2b$10$h7EN/pWQw2q1mVUbX.oOcORWOKdQXStvTcApldc9ArRLqZWDt4UC.');

-- Performance Indexes
CREATE INDEX idx_votes_voter_election ON votes(voter_id, election_id);
CREATE INDEX idx_candidates_position ON candidates(position_id);

-- 1. Drop the old UNIQUE constraint
ALTER TABLE votes
DROP INDEX unique_vote_per_voter_per_election;

-- 2. Add a new UNIQUE constraint per candidate per election
ALTER TABLE votes
ADD UNIQUE KEY unique_vote_per_voter_candidate_election (voter_id, candidate_id, election_id);