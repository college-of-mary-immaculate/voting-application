const DBService = require("./dbService");
const bcrypt = require("bcrypt");

class VoterService {
  static async create(fullname, email, password) {
    if (!fullname || !email || !password) {
      throw new Error("All fields are required.");
    }

    const exist = await DBService.read(
      `SELECT voter_id FROM voters WHERE email = ?`,
      [email],
    );

    if (exist.length > 0) {
      throw new Error("This email is already registered.");
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    await DBService.write(
      `INSERT INTO voters (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
      [fullname, email, hashedPwd],
    );

    return {
      status: "success",
      message: "Voter Registered Successfully",
    };
  }

  static async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const user = await DBService.read(`SELECT * FROM voters WHERE email = ?`, [
      email,
    ]);

    if (user.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const voter = user[0];
    const match = await bcrypt.compare(password, voter.password_hash);

    if (!match) {
      throw new Error("Invalid email or password.");
    }

    return {
      status: "success",
      message: "Login successful",
      data: {
        id: voter.voter_id,
        email: voter.email,
        fullname: voter.full_name,
      },
    };
  }

  static async getAll() {
    const voters = await DBService.read(
      `SELECT voter_id, full_name, email, created_at
       FROM voters
       ORDER BY created_at DESC`,
      [],
    );

    return {
      status: "success",
      count: voters.length,
      data: voters,
    };
  }

  static async getById(id) {
    const voters = await DBService.read(
        `SELECT voter_id, full_name, email, has_voted, created_at
         FROM voters WHERE voter_id = ?`,
        [id]
    );
    return voters[0] || null;
}

  static async update(id, fullname, email, password) {
      const existing = await DBService.read(`SELECT voter_id FROM voters WHERE voter_id = ?`, [id]);
      if (existing.length === 0) throw new Error("Voter not found");

      if (email) {
          const duplicate = await DBService.read(
              `SELECT voter_id FROM voters WHERE email = ? AND voter_id != ?`,
              [email, id]
          );
          if (duplicate.length > 0) throw new Error("Email already in use");
      }

      let sql = `UPDATE voters SET full_name = ?, email = ?`;
      let params = [fullname || existing[0].full_name, email || existing[0].email];

      if (password) {
          const hashed = await bcrypt.hash(password, 10);
          sql += `, password_hash = ?`;
          params.push(hashed);
      }

      sql += ` WHERE voter_id = ?`;
      params.push(id);

      await DBService.write(sql, params);
      return { status: "success", message: "Voter updated" };
  }

  static async delete(id) {
      const result = await DBService.write(`DELETE FROM voters WHERE voter_id = ?`, [id]);
      if (result.affectedRows === 0) throw new Error("Voter not found");
      return { status: "success", message: "Voter deleted" };
  }

  static async castVote(voter_id, election_id, votes) {
    if (
      !voter_id ||
      !election_id ||
      !Array.isArray(votes) ||
      votes.length === 0
    ) {
      throw new Error("Voting information missing fields.");
    }

    const voterExists = await DBService.read(
      `SELECT voter_id FROM voters WHERE voter_id = ?`,
      [voter_id],
    );

    if (voterExists.length === 0) {
      throw new Error("Voter not found.");
    }

    // 1. Check election status
    const election = await DBService.read(
      `SELECT election_id
       FROM elections
       WHERE election_id = ?
       AND status = 'Ongoing'`,
      [election_id],
    );

    if (election.length === 0) {
      throw new Error("Election is not active.");
    }

    // 2. Check if voter already voted
    const voted = await DBService.read(
      `SELECT vote_id
       FROM votes
       WHERE voter_id = ?
       AND election_id = ?`,
      [voter_id, election_id],
    );

    if (voted.length > 0) {
      throw new Error("You already voted in this election.");
    }

    const candidates = [];

    // 3. Validate each vote
    for (const vote of votes) {
      const result = await DBService.read(
        `SELECT
            c.candidate_id,
            c.position_id,
            c.ballot_number,
            p.position_name,
            p.max_vote_allowed
         FROM candidates c
         JOIN positions p
           ON c.position_id = p.position_id
         WHERE p.election_id = ?
         AND c.position_id = ?
         AND c.ballot_number = ?`,
        [election_id, vote.position_id, vote.ballot_number],
      );

      if (result.length === 0) {
        throw new Error(
          `Invalid ballot number for position ${vote.position_id}`,
        );
      }

      candidates.push(result[0]);
    }

    if (candidates.length === 0) {
      throw new Error("No valid candidates selected.");
    }

    // 4. Validate max votes per position
    const positionCheck = {};

    candidates.forEach((c) => {
      if (!positionCheck[c.position_id]) {
        positionCheck[c.position_id] = {
          count: 0,
          max: c.max_vote_allowed,
          name: c.position_name,
        };
      }

      positionCheck[c.position_id].count++;

      if (
        positionCheck[c.position_id].count > positionCheck[c.position_id].max
      ) {
        throw new Error(
          `Limit exceeded: ${c.position_name} allows only ${c.max_vote_allowed} vote(s)`,
        );
      }
    });

    // 5. Bulk Insert Votes (FAST)
    const placeholders = candidates.map(() => "(?, ?, ?)").join(",");

    const values = [];

    candidates.forEach((c) => {
      values.push(voter_id, c.candidate_id, election_id);
    });

    await DBService.write(
      `INSERT INTO votes (voter_id, candidate_id, election_id)
       VALUES ${placeholders}`,
      values,
    );

    return {
      status: "success",
      message: "Vote successfully cast.",
    };
  }
}

module.exports = VoterService;
