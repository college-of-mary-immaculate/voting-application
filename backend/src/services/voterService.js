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

  static async getByNotRegistered(election_id) {
  if (!election_id) throw new Error('Election ID is missing.');

  const sql = `
    SELECT 
      v.voter_id,
      v.full_name
    FROM voters v
    WHERE NOT EXISTS (
      SELECT *
      FROM voter_elections ve
      WHERE ve.election_id = ?
        AND ve.voter_id = v.voter_id
    );
  `;

  const rows = await DBService.read(sql, [election_id]);

  if (!rows || rows.length === 0) {
    return {
      status: "success",
      count: 0,
      data: [],
    };
  }

  return {
    status: "success",
    count: rows.length,
    data: rows,
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

  static async castVote(voter_id, election_id, votes) {
    if (
      !voter_id ||
      !election_id ||
      !Array.isArray(votes) ||
      votes.length === 0
    ) {
      throw new Error("Missing required voting information");
    }

    voter_id = Number(voter_id);
    election_id = Number(election_id);

    // 1️⃣ Voter exists
    const voter = await DBService.read(
      `SELECT 1 FROM voters WHERE voter_id = ? LIMIT 1`,
      [voter_id],
    );
    if (voter.length === 0) throw new Error("Voter not found");

    // 2️⃣ Voter eligible
    const eligible = await DBService.read(
      `SELECT 1 FROM voter_elections WHERE voter_id = ? AND election_id = ? LIMIT 1`,
      [voter_id, election_id],
    );
    if (eligible.length === 0)
      throw new Error("You are not eligible to vote in this election");

    // 3️⃣ Election ongoing
    const election = await DBService.read(
      `SELECT 1 FROM elections WHERE election_id = ? AND status = 'Ongoing' LIMIT 1`,
      [election_id],
    );
    if (election.length === 0)
      throw new Error("This election is not currently active");

    // 4️⃣ Already voted? ✅ Use master to avoid replication lag
    const alreadyVoted = await DBService.write(
      `SELECT 1 FROM votes WHERE voter_id = ? AND election_id = ? LIMIT 1`,
      [voter_id, election_id],
    );
    if (alreadyVoted.length > 0) {
      throw new Error("You have already voted in this election");
    }

    // 5️⃣ Validate votes and collect rules
    const positionRules = {};
    const validCandidateIds = [];

    for (const vote of votes) {
      const { position_id, ballot_number } = vote;

      const cand = await DBService.read(
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
         AND c.status = 'Active'
       LIMIT 1`,
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
          max: Number(c.max_vote_allowed),
          count: 0,
        };
      }
      positionRules[position_id].count++;
    }

    // 6️⃣ Enforce max votes per position
    for (const posId in positionRules) {
      const rule = positionRules[posId];
      if (rule.count > rule.max) {
        throw new Error(
          `You may vote for up to ${rule.max} candidate(s) for ${rule.name}. You selected ${rule.count}.`,
        );
      }
    }

    // 7️⃣ Deduplicate candidate IDs before insert
    const uniqueCandidateIds = [...new Set(validCandidateIds)];

    if (uniqueCandidateIds.length > 0) {
      const placeholders = uniqueCandidateIds.map(() => "(?, ?, ?)").join(", ");
      const values = [];
      uniqueCandidateIds.forEach((cid) =>
        values.push(voter_id, cid, election_id),
      );

      try {
        // Insert all votes; duplicate candidate inserts will fail safely
        await DBService.write(
          `INSERT INTO votes (voter_id, candidate_id, election_id) VALUES ${placeholders}`,
          values,
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          throw new Error(
            "You have already voted for one or more of the selected candidates",
          );
        }
        throw err;
      }
    }
  }
}

module.exports = VoterService;
