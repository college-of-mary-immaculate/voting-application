# Voting-Application

## Overview

Voting Application is a **Real-Time Voting System** built using modern web technologies.

It allows voters (clients) to cast votes for candidates under specific positions with **instant tally updates**, while administrators manage elections through a dedicated admin panel.

When a vote is submitted, the vote count updates immediately across the system, ensuring accurate and synchronized results.

The system supports:

- Real-time vote tally updates
- Separate Admin and Client frontends
- Secure voter authentication
- Master–Slave database replication
- Docker-based scalable deployment

---

# System Architecture

Client Users  
↓  
Client Frontend  

Admin Users  
↓  
Admin Frontend  

Both connect to  
↓  
Node.js Backend API  
↓  
Real-Time Vote Processing  
↓  
MySQL / MariaDB Database (Master–Slave Replication)

---

# Technologies Used

## Frontend (Admin & Client)
- React.js

## Backend
- Node.js
- REST API Architecture

## Database
- MySQL / MariaDB


## Infrastructure
- Docker
- Docker Compose
- Master–Slave Database Replication

---

# Features

## Client (Voter) Features

- Secure login
- View active elections
- View positions per election
- View candidates per position
- Vote for one candidate per position
- Prevent double voting
- Real-time result updates


## Admin Features

- Monitor live vote results
- Manage voter records


## Real-Time Features

- Live vote tally updates
- Instant vote recording
- Immediate result reflection after vote submission
- Synchronized result viewing across users

This ensures synchronized and accurate vote counting.

---

# Database Schema

## Elections
- election_id
- election_name
- election_date
- status (Upcoming, Ongoing, Closed)

## Positions
- position_id
- election_id
- position_name
- max_vote_allowed

## Candidates
- candidate_id
- position_id
- full_name
- party_name
- photo_url
- status (Active, Withdrawn)

## Voters
- voter_id
- student_id
- full_name
- password_hash
- has_voted
- created_at

## Votes
- vote_id
- voter_id
- candidate_id
- election_id
- voted_at

---

## Contributors
**Backend:**
- Bautista, John Francis
- Jamila, Jessa Mae

**Frontend(Admin & Client)**
- Orea, Brian
- Marcos, Gian Carl