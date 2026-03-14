const DBService = require("./dbService");

class CandidatesService {
  static VALID_STATUSES = ['Active', 'Withdrawn'];

  static async create(position_id, full_name, party_name, photo_url, status) {
    if (!position_id || !full_name) {
      throw new Error("Missing required fields: position_id and full_name");
    }

    const finalStatus = status && this.VALID_STATUSES.includes(status) ? status : 'Active';

    const positionExists = await DBService.read(
      `SELECT position_id FROM positions WHERE position_id = ?`,
      [position_id]
    );
    if (positionExists.length === 0) {
      throw new Error("Invalid position_id: The specified position does not exist.");
    }

    const existing = await DBService.read(
      `SELECT candidate_id FROM candidates WHERE position_id = ? AND full_name = ?`,
      [position_id, full_name]
    );
    if (existing.length > 0) {
      throw new Error("Candidate is already registered for this position.");
    }

    const maxResult = await DBService.read(
      `SELECT COALESCE(MAX(ballot_number), 0) AS max_ballot FROM candidates WHERE position_id = ?`,
      [position_id]
    );
    const ballot_number = maxResult[0].max_ballot + 1;

    const sql = `INSERT INTO candidates (position_id, ballot_number, full_name, party_name, photo_url, status) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await DBService.write(sql, [
      position_id,
      ballot_number,
      full_name.trim(),
      party_name ? party_name.trim() : null,
      photo_url || null,
      finalStatus
    ]);

    const insertedId = result.insertId || result.lastInsertRowid;

    return {
      status: "success",
      message: "Candidate created successfully",
      data: {
        candidate_id: insertedId,
        position_id,
        ballot_number,
        full_name,
        party_name,
        photo_url,
        status: finalStatus
      }
    };
  }

  static async getAll() {
    const sql = `
      SELECT 
        c.candidate_id, 
        c.position_id,
        c.ballot_number,
        c.full_name, 
        c.party_name, 
        c.photo_url, 
        c.status,
        p.position_name,
        p.max_vote_allowed,      /* ito nadagdag – needed for vote limits */
        e.election_id,            /* ito nadagdag – needed for filtering */
        e.election_name
      FROM candidates c
      JOIN positions p ON c.position_id = p.position_id
      JOIN elections e ON p.election_id = e.election_id
      ORDER BY e.election_name ASC, p.position_name ASC, c.ballot_number ASC
    `;
    
    const candidates = await DBService.read(sql, []);

    return {
      status: "success",
      count: candidates.length,
      data: candidates
    };
  }

  static async update(candidate_id, position_id, full_name, party_name, photo_url, status) {
    if (!candidate_id) throw new Error("candidate_id is required");
    if (!position_id || !full_name) throw new Error("position_id and full_name are required");

    const finalStatus = status && this.VALID_STATUSES.includes(status) ? status : 'Active';

    const existingCandidate = await DBService.read(
      `SELECT position_id FROM candidates WHERE candidate_id = ?`,
      [candidate_id]
    );
    if (existingCandidate.length === 0) throw new Error("Candidate not found");
    const oldPositionId = existingCandidate[0].position_id;

    if (Number(position_id) !== Number(oldPositionId)) {
      throw new Error("Position cannot be changed after creation. To move candidate, delete and re-create.");
    }

    const positionExists = await DBService.read(
      `SELECT position_id FROM positions WHERE position_id = ?`,
      [position_id]
    );
    if (positionExists.length === 0) throw new Error("Invalid position_id");

    const duplicateCheck = await DBService.read(
      `SELECT candidate_id FROM candidates WHERE position_id = ? AND full_name = ? AND candidate_id != ?`,
      [position_id, full_name.trim(), candidate_id]
    );
    if (duplicateCheck.length > 0) {
      throw new Error("Another candidate with the same name already exists for this position.");
    }

    const sql = `
      UPDATE candidates 
      SET
        full_name = ?,
        party_name = ?,
        photo_url = ?,
        status = ?
      WHERE candidate_id = ?
    `;
    await DBService.write(sql, [
      full_name.trim(),
      party_name ? party_name.trim() : null,
      photo_url ? photo_url.trim() : null,
      finalStatus,
      candidate_id
    ]);

    return {
      status: "success",
      message: "Candidate updated successfully",
      data: {
        candidate_id,
        position_id,
        full_name,
        party_name,
        photo_url,
        status: finalStatus
      }
    };
  }

  static async delete(candidate_id) {
    if (!candidate_id) throw new Error("candidate_id is required");

    const exists = await DBService.read(
      `SELECT candidate_id FROM candidates WHERE candidate_id = ?`,
      [candidate_id]
    );
    if (exists.length === 0) throw new Error("Candidate not found");

    try {
      await DBService.write(
        `DELETE FROM candidates WHERE candidate_id = ?`,
        [candidate_id]
      );
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        throw new Error("Cannot delete candidate because they have existing votes. Consider marking as 'Withdrawn' instead.");
      }
      throw error;
    }

    return {
      status: "success",
      message: "Candidate deleted successfully"
    };
  }
}

module.exports = CandidatesService;