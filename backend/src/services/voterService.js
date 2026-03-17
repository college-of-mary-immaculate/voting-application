const DBService = require("./dbService");
const bcrypt = require("bcrypt");

class VoterService {
  static async getAll(election_id = null) {
    let sql = `
      SELECT 
        v.voter_id, 
        v.full_name, 
        v.email, 
        v.created_at
    `;

    const params = [];

    if (election_id) {
      sql += `,
        EXISTS(
          SELECT 1 
          FROM votes v2 
          WHERE v2.voter_id = v.voter_id 
          AND v2.election_id = ?
        ) AS has_voted`;
      params.push(election_id);
    }

    sql += `
      FROM voters v
      ORDER BY v.created_at DESC
    `;

    const voters = await DBService.read(sql, params);

    return {
      status: "success",
      count: voters.length,
      data: voters,
    };
  }

  static async getById(voter_id) {
    const rows = await DBService.read(
      `SELECT voter_id, full_name, email, created_at
       FROM voters 
       WHERE voter_id = ?`,
      [voter_id],
    );

    return rows[0] || null;
  }

  /**
   * Update voter profile (full_name, email, optional password)
   */
  static async update(voter_id, { full_name, email, password } = {}) {
    const existing = await DBService.read(
      `SELECT voter_id, full_name, email 
       FROM voters 
       WHERE voter_id = ?`,
      [voter_id],
    );

    if (existing.length === 0) {
      throw new Error("Voter not found");
    }

    const current = existing[0];

    // Check email uniqueness if changing
    if (email && email !== current.email) {
      const duplicate = await DBService.read(
        `SELECT 1 FROM voters 
         WHERE email = ? AND voter_id != ?`,
        [email, voter_id],
      );
      if (duplicate.length > 0) {
        throw new Error("Email already in use by another voter");
      }
    }

    const updates = [];
    const params = [];

    if (full_name !== undefined) {
      updates.push("full_name = ?");
      params.push(full_name || current.full_name);
    }

    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email || current.email);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push("password_hash = ?");
      params.push(hashed);
    }

    if (updates.length === 0) {
      return { status: "success", message: "No changes provided" };
    }

    const sql = `
      UPDATE voters 
      SET ${updates.join(", ")} 
      WHERE voter_id = ?
    `;
    params.push(voter_id);

    await DBService.write(sql, params);

    return { status: "success", message: "Voter updated successfully" };
  }

  static async delete(voter_id) {
    const result = await DBService.write(
      `DELETE FROM voters WHERE voter_id = ?`,
      [voter_id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Voter not found");
    }

    return { status: "success", message: "Voter deleted successfully" };
  }

  /**
   * Cast vote(s) in an election
   * @param {number} voter_id
   * @param {number} election_id
   * @param {Array<{position_id: number, ballot_number: number}>} votes
   */
  static async castVote(voter_id, election_id, votes) {
    if (
      !voter_id ||
      !election_id ||
      !Array.isArray(votes) ||
      votes.length === 0
    ) {
      throw new Error("Missing required voting information");
    }

    await DBService.transaction(async (conn) => {
      // ─────────────────────────────────────────────
      // 1. Voter exists?
      const voter = await conn.read(`SELECT 1 FROM voters WHERE voter_id = ?`, [
        voter_id,
      ]);
      if (voter.length === 0) throw new Error("Voter not found");

      // ─────────────────────────────────────────────
      // 2. Voter eligible for this election?
      const eligible = await conn.read(
        `SELECT 1 FROM voter_elections 
         WHERE voter_id = ? AND election_id = ?`,
        [voter_id, election_id],
      );
      if (eligible.length === 0) {
        throw new Error("You are not eligible to vote in this election");
      }

      // ─────────────────────────────────────────────
      // 3. Election is ongoing?
      const election = await conn.read(
        `SELECT 1 FROM elections 
         WHERE election_id = ? AND status = 'Ongoing'`,
        [election_id],
      );
      if (election.length === 0) {
        throw new Error("This election is not currently active");
      }

      // ─────────────────────────────────────────────
      // 4. Already voted?
      const alreadyVoted = await conn.read(
        `SELECT 1 FROM votes 
         WHERE voter_id = ? AND election_id = ? 
         LIMIT 1`,
        [voter_id, election_id],
      );
      if (alreadyVoted.length > 0) {
        throw new Error("You have already voted in this election");
      }

      // ─────────────────────────────────────────────
      // 5. Load valid candidates + position rules
      const positionRules = {};
      const validCandidateIds = [];

      for (const vote of votes) {
        const { position_id, ballot_number } = vote;

        const cand = await conn.read(
          `SELECT 
             c.candidate_id,
             c.ballot_number,
             p.position_name,
             p.max_vote_allowed
           FROM candidates c
           JOIN positions p ON c.position_id = p.position_id
           WHERE p.election_id = ?
             AND c.position_id = ?
             AND c.ballot_number = ?
             AND c.status = 'Active'`,
          [election_id, position_id, ballot_number],
        );

        if (cand.length === 0) {
          throw new Error(
            `Invalid or inactive candidate for position ${position_id}, ballot ${ballot_number}`,
          );
        }

        const c = cand[0];
        validCandidateIds.push(c.candidate_id);

        if (!positionRules[position_id]) {
          positionRules[position_id] = {
            name: c.position_name,
            max: c.max_vote_allowed,
            count: 0,
          };
        }

        positionRules[position_id].count++;
      }

      // ─────────────────────────────────────────────
      // 6. Enforce max votes per position
      for (const posId in positionRules) {
        const rule = positionRules[posId];
        if (rule.count > rule.max) {
          throw new Error(
            `You may vote for up to ${rule.max} candidate(s) for ${rule.name}. You selected ${rule.count}.`,
          );
        }
      }

      // ─────────────────────────────────────────────
      // 7. Insert all votes (already in transaction)
      if (validCandidateIds.length > 0) {
        const placeholders = validCandidateIds
          .map(() => "(?, ?, ?)")
          .join(", ");
        const values = [];
        validCandidateIds.forEach((cid) => {
          values.push(voter_id, cid, election_id);
        });

        await conn.write(
          `INSERT INTO votes (voter_id, candidate_id, election_id) 
           VALUES ${placeholders}`,
          values,
        );
      }
    });

    return {
      status: "success",
      message: "Your vote has been successfully recorded.",
    };
  }
}

module.exports = VoterService;
